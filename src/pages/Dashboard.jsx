import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "@/lib/authApi";

import VoiceOption from "../chatbot/VoiceOption";
import TextOption from "../chatbot/TextOption";
import CallOption from "../chatbot/CallOption";
import TextChat from "../chatbot/TextChat";
import VoiceChat from "../chatbot/VoiceChat";
import CallScreen from "../chatbot/CallScreen";
import {
  CHATBOT_WIDGET_NAME_KEY,
  CHATBOT_WIDGET_POSITION_KEY,
  getStoredWidgetPosition,
  getStoredWidgetName,
  getWidgetPositionStyle,
  formatChatbotDisplayName,
} from "../chatbot/widgetPosition";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { ArrowRight, Bot, Minus, X } from "lucide-react";

function SideChatbotTrigger({ side, name, onClick }) {
  const isLeft = side === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${name}`}
      className={`fixed top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 bg-blue-500 px-2 py-3 text-white shadow-lg transition hover:bg-blue-600 hover:shadow-xl sm:px-2.5 ${isLeft ? "left-0 rounded-r-2xl" : "right-0 rounded-l-2xl"}`}
    >
      <Bot className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
      <span
        className="max-h-28 max-w-28 truncate text-xs font-semibold sm:max-h-36 sm:text-sm"
        style={{
          writingMode: "vertical-rl",
          transform: isLeft ? "rotate(180deg)" : undefined,
        }}
      >
        {name}
      </span>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutRequest().catch(() => undefined);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("chatbotAuthenticated");
    sessionStorage.removeItem("textChatHistory");
    sessionStorage.removeItem("voiceChatHistory");
    Object.keys(localStorage)
      .filter((key) => key.startsWith("solmento:"))
      .forEach((key) => localStorage.removeItem(key));
    navigate("/auth/login", { replace: true });
  };

  /* chatbot states */

  const [showChatbot, setShowChatbot] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);

  const [widgetPosition, setWidgetPosition] = useState(() =>
    getStoredWidgetPosition(),
  );
  const [widgetName, setWidgetName] = useState(() => getStoredWidgetName());
  const middleWidgetPosition = widgetPosition.endsWith("-middle");
  const headerRef = useRef(null);
  const [widgetTopOffset, setWidgetTopOffset] = useState(0);

  useEffect(() => {
    const syncWidgetPosition = (event) => {
      if (
        event.type === "storage" &&
        event.key !== CHATBOT_WIDGET_POSITION_KEY &&
        event.key !== CHATBOT_WIDGET_NAME_KEY
      ) {
        return;
      }
      if (
        event.type !== "storage" ||
        event.key === CHATBOT_WIDGET_POSITION_KEY
      ) {
        setWidgetPosition(getStoredWidgetPosition());
      }
      if (event.type !== "storage" || event.key === CHATBOT_WIDGET_NAME_KEY) {
        setWidgetName(getStoredWidgetName());
      }
    };

    window.addEventListener("storage", syncWidgetPosition);
    window.addEventListener("solmento:widget-name-changed", syncWidgetPosition);
    window.addEventListener(
      "solmento:widget-position-changed",
      syncWidgetPosition,
    );
    return () => {
      window.removeEventListener("storage", syncWidgetPosition);
      window.removeEventListener(
        "solmento:widget-name-changed",
        syncWidgetPosition,
      );
      window.removeEventListener(
        "solmento:widget-position-changed",
        syncWidgetPosition,
      );
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    const measureHeader = () => {
      setWidgetTopOffset(header.getBoundingClientRect().height + 16);
    };

    measureHeader();
    const observer = new ResizeObserver(measureHeader);
    observer.observe(header);
    window.addEventListener("resize", measureHeader);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureHeader);
    };
  }, []);

  const [showAuth, setShowAuth] = useState(false);

  const [chatMode, setChatMode] = useState("options");

  /* chatbot user information */

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  /* validation errors */

  const [nameError, setNameError] = useState("");

  const [emailError, setEmailError] = useState("");

  const [phoneError, setPhoneError] = useState("");

  /* chatbot session authentication */

  const [isChatbotAuthenticated, setIsChatbotAuthenticated] = useState(
    !!sessionStorage.getItem("chatbotAuthenticated"),
  );

  /* chat connection status */

  const isChatConnected = !showAuth && chatMode !== "options";

  /* main website user */

  const user = JSON.parse(localStorage.getItem("user"));

  /* validate name */

  const validateName = (nameValue) => {
    if (!nameValue.trim()) {
      return "Name is required.";
    }

    return "";
  };

  /* validate email */

  const validateEmail = (emailValue) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue.trim()) {
      return "Email is required.";
    }

    if (!emailPattern.test(emailValue.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  /* validate phone */

  const validatePhone = (phoneValue) => {
    const phonePattern = /^[6-9]\d{9}$/;

    if (!phoneValue.trim()) {
      return "Phone number is required.";
    }

    if (!phonePattern.test(phoneValue.trim())) {
      return "Please enter a valid 10-digit phone number.";
    }

    return "";
  };

  /* form validation */

  const isFormValid =
    validateName(name) === "" &&
    validateEmail(email) === "" &&
    validatePhone(phone) === "";

  /* handle name */

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);

    const error = validateName(value);

    setNameError(error);
  };

  /* handle email */

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);

    const error = validateEmail(value);

    setEmailError(error);
  };

  /* handle phone */

  const handlePhoneChange = (event) => {
    const value = event.target.value;

    const onlyNumbers = value.replace(/\D/g, "");

    setPhone(onlyNumbers);

    const error = validatePhone(onlyNumbers);

    setPhoneError(error);
  };

  /* chatbot icon click */

  const handleChatbotClick = () => {
    setShowChatbot(true);

    setIsMinimized(false);

    const chatbotSession = sessionStorage.getItem("chatbotAuthenticated");

    if (chatbotSession) {
      setIsChatbotAuthenticated(true);

      setShowAuth(false);

      setChatMode("options");
    } else {
      setShowAuth(true);

      setChatMode("options");
    }
  };

  /* chatbot authentication */

  const handleChatbotAuth = (event) => {
    event.preventDefault();

    const currentNameError = validateName(name);

    const currentEmailError = validateEmail(email);

    const currentPhoneError = validatePhone(phone);

    setNameError(currentNameError);

    setEmailError(currentEmailError);

    setPhoneError(currentPhoneError);

    if (currentNameError || currentEmailError || currentPhoneError) {
      return;
    }

    /* create chatbot user */

    const chatbotUser = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      isAuthenticated: true,
    };

    /* save chatbot session */

    sessionStorage.setItem("chatbotAuthenticated", JSON.stringify(chatbotUser));

    setIsChatbotAuthenticated(true);

    /* open chat options */

    setShowAuth(false);

    setShowChatbot(true);

    setIsMinimized(false);

    setChatMode("options");
  };

  /* text */

  const handleText = () => {
    setChatMode("text");
  };

  /* voice */

  const handleVoice = () => {
    setChatMode("voice");
  };

  /* call */

  const handleCall = () => {
    setChatMode("call");
  };

  /* close chatbot */

  const handleCloseChatbot = () => {
    setShowChatbot(false);

    setIsMinimized(false);

    setShowAuth(false);

    setChatMode("options");
  };

  /* minimize chatbot */

  const handleMinimizeChatbot = () => {
    setIsMinimized(true);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* main website header */}

      <header
        ref={headerRef}
        className="
          flex
          items-center
          justify-between
          border-b
          bg-white
          px-6
          py-4
          shadow-sm
        "
      >
        {/* website title */}

        <div>
          <h1 className="text-2xl font-bold text-blue-500">SOLMENTO AI</h1>

          <p className="text-sm text-gray-500">
            Welcome, {user?.email?.split("@")[0] || "Guest"}
          </p>
        </div>

        {/* logout */}

        <Button
          onClick={handleLogout}
          className="
            h-auto
            cursor-pointer
            bg-blue-500
            px-6
            py-2
            font-bold
            text-white
            transition-transform
            duration-200
            hover:scale-105
            hover:bg-blue-600
          "
        >
          Logout
        </Button>
      </header>

      {/* main page */}

      <main
        className="
          flex
          min-h-[calc(100vh-81px)]
          items-center
          justify-center
          p-6
        "
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to
            <span className="font-bold text-blue-500"> SOLMENTO AI</span>
          </h2>

          <p className="mt-2 text-gray-500">
            Your AI-powered assistant is ready to help you.
          </p>
        </div>
      </main>

      {/* floating chatbot icon */}

      {!showChatbot && !isMinimized && middleWidgetPosition && (
        <SideChatbotTrigger
          side={widgetPosition === "left-middle" ? "left" : "right"}
          name={formatChatbotDisplayName(widgetName)}
          onClick={handleChatbotClick}
        />
      )}

      {!showChatbot && !isMinimized && !middleWidgetPosition && (
        <button
          type="button"
          onClick={handleChatbotClick}
          style={{
            ...getWidgetPositionStyle(
              widgetPosition,
              "1.5rem",
              `${widgetTopOffset || 96}px`,
            ),
            borderRadius: widgetPosition.endsWith("-middle")
              ? "1rem"
              : "9999px",
            width: widgetPosition.endsWith("-middle") ? "5rem" : "4rem",
          }}
          className="
            fixed
            bottom-6
            right-6
            z-30
            flex
            h-16
            w-16
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-blue-500
            text-white
            shadow-xl
            transition-all
            duration-200
            hover:scale-110
            hover:bg-blue-600
            hover:shadow-2xl
          "
          title="Open Chatbot"
        >
          <Bot className="h-8 w-8" />
        </button>
      )}

      {/* chatbot window */}

      {showChatbot && !isMinimized && (
        <div
          style={getWidgetPositionStyle(
            widgetPosition,
            "1.5rem",
            `${widgetTopOffset || 96}px`,
          )}
          className={`
            fixed
            z-40
            w-[400px]
            max-w-[calc(100vw-2rem)]
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-2xl
            transition-all
            duration-300
          `}
        >
          {/* chatbot header */}

          <div
            className="
              flex
              items-center
              justify-between
              bg-blue-400
              px-5
              py-4
            "
          >
            {/* left side */}

            <div className="flex items-center gap-3">
              {/* bot icon */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-gray-100
                "
              >
                <Bot className="h-6 w-6 text-blue-500" />
              </div>

              {/* bot name and status */}

              <div>
                <h2 className="font-bold text-gray-800">
                  {formatChatbotDisplayName(widgetName)}
                </h2>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`
                      h-2
                      w-2
                      rounded-full
                      ${isChatConnected ? "bg-green-500" : "bg-red-400"}
                    `}
                  />

                  <span className="text-xs text-gray-700">
                    {isChatConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>

            {/* header controls */}

            <div className="flex items-center gap-1">
              {/* minimize */}

              <button
                type="button"
                onClick={handleMinimizeChatbot}
                className="
                  cursor-pointer
                  rounded-md
                  p-2
                  text-gray-700
                  transition
                  hover:bg-blue-500
                  hover:text-white
                "
                title="Minimize Chatbot"
              >
                <Minus className="h-5 w-5" />
              </button>

              {/* close */}

              <button
                type="button"
                onClick={handleCloseChatbot}
                className="
                  cursor-pointer
                  rounded-md
                  p-2
                  text-gray-700
                  transition
                  hover:bg-red-500
                  hover:text-white
                "
                title="Close Chatbot"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* chatbot content */}

          <div className="bg-[#fffaf0]">
            {/* welcome form */}

            {showAuth && (
              <div className="px-5 py-6">
                <Card className="border-0 bg-transparent shadow-none">
                  {/* header */}

                  <CardHeader className="px-0 pb-5">
                    <CardTitle className="text-2xl text-blue-500">
                      Welcome!
                    </CardTitle>

                    <CardDescription>
                      Please share the following details to continue.
                    </CardDescription>
                  </CardHeader>

                  {/* form */}

                  <CardContent className="px-0">
                    <form onSubmit={handleChatbotAuth} className="space-y-5">
                      {/* name */}

                      <div className="space-y-2">
                        <Label htmlFor="chatbot-name">Full Name</Label>

                        <Input
                          id="chatbot-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={handleNameChange}
                          className={nameError ? "border-red-500" : ""}
                        />

                        {nameError && (
                          <p className="text-sm text-red-500">{nameError}</p>
                        )}
                      </div>

                      {/* email */}

                      <div className="space-y-2">
                        <Label htmlFor="chatbot-email">Email</Label>

                        <Input
                          id="chatbot-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={handleEmailChange}
                          className={emailError ? "border-red-500" : ""}
                        />

                        {emailError && (
                          <p className="text-sm text-red-500">{emailError}</p>
                        )}
                      </div>

                      {/* phone */}

                      <div className="space-y-2">
                        <Label htmlFor="chatbot-phone">Phone Number</Label>

                        <Input
                          id="chatbot-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Enter your 10-digit phone number"
                          value={phone}
                          onChange={handlePhoneChange}
                          className={phoneError ? "border-red-500" : ""}
                        />

                        {phoneError && (
                          <p className="text-sm text-red-500">{phoneError}</p>
                        )}
                      </div>

                      {/* authenticate button */}

                      {/* authenticate button */}

                      <Button
                        type="submit"
                        disabled={!isFormValid}
                        title={
                          isFormValid ? "Authenticate" : "Complete all fields"
                        }
                        className={`
    mt-1
    flex
    h-12
    w-full
    cursor-pointer
    items-center
    justify-center
    rounded-lg
    p-0
    text-white
    transition-all
    duration-200
    ${
      isFormValid
        ? "bg-blue-500 hover:bg-blue-600"
        : "cursor-not-allowed bg-gray-300 hover:bg-gray-300"
    }
  `}
                      >
                        Start Converstion
                        {/* <ArrowRight className="h-12 w-12" /> */}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* chat options */}

            {!showAuth && chatMode === "options" && (
              <div className="px-5 py-8">
                {/* intro */}

                <div className="text-center">
                  {/* bot */}

                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-yellow-100
                    "
                  >
                    <Bot className="h-9 w-9 text-blue-500" />
                  </div>

                  <h2 className="text-xl font-bold text-gray-800">
                    How would you like to chat?
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Choose your preferred way to connect with us
                  </p>
                </div>

                {/* options */}

                <div className="mt-7 space-y-4">
                  <TextOption onClick={handleText} />

                  <VoiceOption onClick={handleVoice} />

                  <CallOption onClick={handleCall} />
                </div>
              </div>
            )}

            {/* text chat */}

            {!showAuth && chatMode === "text" && (
              <TextChat onBack={() => setChatMode("options")} />
            )}

            {/* voice chat */}

            {!showAuth && chatMode === "voice" && (
              <VoiceChat onBack={() => setChatMode("options")} />
            )}

            {/* call */}

            {!showAuth && chatMode === "call" && (
              <CallScreen onBack={() => setChatMode("options")} />
            )}
          </div>

          {/* chatbot footer */}

          <div
            className="
              border-t
              bg-white
              px-5
              py-3
              text-center
            "
          >
            <p className="text-xs text-gray-400">
              Powered by {formatChatbotDisplayName(widgetName)}
            </p>
          </div>
        </div>
      )}

      {/* minimized chatbot */}

      {showChatbot && isMinimized && middleWidgetPosition ? (
        <SideChatbotTrigger
          side={widgetPosition === "left-middle" ? "left" : "right"}
          name={formatChatbotDisplayName(widgetName)}
          onClick={() => setIsMinimized(false)}
        />
      ) : showChatbot && isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          style={{
            ...getWidgetPositionStyle(
              widgetPosition,
              "1.5rem",
              `${widgetTopOffset || 96}px`,
            ),
            borderRadius: widgetPosition.endsWith("-middle")
              ? "1rem"
              : "9999px",
            width: widgetPosition.endsWith("-middle") ? "5rem" : "4rem",
          }}
          className="
            fixed
            z-40
            flex
            h-16
            w-16
            cursor-pointer
            items-center
            justify-center
            rounded-full
            bg-blue-500
            text-white
            shadow-xl
            transition-all
            duration-200
            hover:scale-110
            hover:bg-blue-600
          "
          title="Open Chatbot"
        >
          <Bot className="h-8 w-8" />
        </button>
      ) : null}
    </div>
  );
}
