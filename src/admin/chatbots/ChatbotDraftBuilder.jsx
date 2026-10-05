import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import {
  getChatbotBuilderRequest,
  publishChatbotBuilderRequest,
  saveChatbotBuilderDraftRequest,
} from "@/lib/authApi";
import { saveWidgetPosition } from "../../chatbot/widgetPosition";
import { createBuilderConfig } from "./ChatbotBuilder";
import StepChatbotBuilder from "./StepChatbotBuilder";

function messageFor(error) {
  if (error?.status === 404)
    return "This chatbot is not available in your workspace.";
  if (error?.status === 401 || error?.status === 403) {
    return "Your session cannot access this chatbot. Please sign in again.";
  }
  return error?.message || "We could not load this chatbot builder.";
}

function BuilderState({ title, message, retry, back, loading = false }) {
  return (
    <section className="mx-auto grid min-h-[420px] max-w-xl place-items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div>
        {loading ? (
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-blue-600" />
        ) : (
          <AlertCircle className="mx-auto h-9 w-9 text-rose-500" />
        )}
        <h1 className="mt-4 text-xl font-bold text-slate-950">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {message}
        </p>
        {!loading && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {retry && (
              <button
                type="button"
                onClick={retry}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <RefreshCw size={16} /> Retry
              </button>
            )}
            <button
              type="button"
              onClick={back}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Chatbots
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ChatbotDraftBuilder() {
  const { chatbotId: routeChatbotId } = useParams();
  const { pathname } = useLocation();
  // ClientAdminPanel is mounted at /app/*, so React Router does not expose
  // the nested :chatbotId param here. Read the already-matched URL segment
  // while retaining useParams support if the component is mounted directly.
  const chatbotId =
    routeChatbotId ||
    pathname.match(/^\/app\/chatbots\/([^/]+)\/builder\/?$/)?.[1] ||
    "";
  const navigate = useNavigate();
  const validId = /^\d+$/.test(chatbotId || "") && Number(chatbotId) > 0;
  const [state, setState] = useState({
    status: validId ? "loading" : "invalid",
    builder: null,
    error: "",
  });

  const load = useCallback(async () => {
    if (!validId) return;
    setState({ status: "loading", builder: null, error: "" });
    try {
      const builder = await getChatbotBuilderRequest(chatbotId);
      const initialConfig = createBuilderConfig(
        builder.chatbot,
        builder.draftConfig || builder.publishedConfig,
      );
      saveWidgetPosition(initialConfig.position);
      setState({
        status: "ready",
        builder: { ...builder, initialConfig },
        error: "",
      });
    } catch (error) {
      setState({
        status: error?.status === 404 ? "not-found" : "error",
        builder: null,
        error: messageFor(error),
      });
    }
  }, [chatbotId, validId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveDraft = useCallback(
    async (config) => {
      const result = await saveChatbotBuilderDraftRequest(chatbotId, {
        name: config.name.trim(),
        status: config.status,
        config,
      });
      saveWidgetPosition(config.position);
      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              builder: {
                ...result,
                initialConfig: createBuilderConfig(
                  result.chatbot,
                  result.draftConfig || result.publishedConfig,
                ),
              },
            }
          : current,
      );
      return result;
    },
    [chatbotId],
  );

  const publish = useCallback(
    async (config, changes = []) => {
      const result = await publishChatbotBuilderRequest(chatbotId, {
        name: config.name.trim(),
        status: config.status,
        config,
        changes,
      });
      saveWidgetPosition(config.position);
      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              builder: {
                ...result,
                initialConfig: createBuilderConfig(
                  result.chatbot,
                  result.draftConfig || result.publishedConfig,
                ),
              },
            }
          : current,
      );
      return result;
    },
    [chatbotId],
  );

  const back = () => navigate("/app/chatbots");

  if (!validId) {
    return (
      <BuilderState
        title="Invalid chatbot ID"
        message="Open the builder from a chatbot in this workspace."
        back={back}
      />
    );
  }
  if (state.status === "loading") {
    return (
      <BuilderState
        title="Loading chatbot builder"
        message="Loading this chatbot and its saved draft."
        loading
        back={back}
      />
    );
  }
  if (state.status === "not-found") {
    return (
      <BuilderState
        title="Chatbot not found"
        message={state.error}
        back={back}
      />
    );
  }
  if (state.status === "error") {
    return (
      <BuilderState
        title="Unable to load chatbot builder"
        message={state.error}
        retry={load}
        back={back}
      />
    );
  }

  return (
    <StepChatbotBuilder
      key={state.builder.chatbot.id}
      initialConfig={state.builder.initialConfig}
      initialVersions={state.builder.versions || []}
      onSaveDraft={saveDraft}
      onPublish={publish}
    />
  );
}
