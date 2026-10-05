import { useEffect, useRef, useState } from "react";
import { chatbotService } from "./chatbotService";

export function useChatbots(service = chatbotService) {
  const [chatbots, setChatbots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);
  const [revision, setRevision] = useState(0);
  const mutationInProgress = useRef(false);

  useEffect(() => {
    let cancelled = false;
    service
      .list()
      .then((records) => {
        if (!cancelled) {
          setChatbots(records);
          setIsLoading(false);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setError("We couldn't load your chatbots. Please try again.");
          setErrorStatus(cause?.status || null);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [service, revision]);

  async function mutate(operation) {
    if (mutationInProgress.current) return null;
    mutationInProgress.current = true;
    setIsSaving(true);
    setError("");
    setErrorStatus(null);
    try {
      const result = await operation();
      setChatbots(await service.list());
      return result;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Couldn't update this chatbot. Please try again.",
      );
      setErrorStatus(cause?.status || null);
      return null;
    } finally {
      mutationInProgress.current = false;
      setIsSaving(false);
    }
  }

  return {
    chatbots,
    isLoading,
    isSaving,
    error,
    errorStatus,
    retry() {
      setIsLoading(true);
      setError("");
      setErrorStatus(null);
      setRevision((current) => current + 1);
    },
    setStatus: (id, status) => mutate(() => service.setStatus(id, status)),
    duplicate: (id) => mutate(() => service.duplicate(id)),
    remove: (id) => mutate(() => service.remove(id)),
  };
}
