import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react";

function getFemaleVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const femaleKeywords = [
    "female",
    "woman",
    "girl",
    "zira",
    "samantha",
    "victoria",
    "karen",
    "jenny",
    "aria",
    "sonia",
    "libby",
    "eva",
    "ava",
    "allison",
    "susan",
    "serena",
    "heera",
    "neerja",
    "swara",
    "priya",
    "aditi",
    "raveena",
    "veena",
    "ananya",
    "natasha",
    "stephanie",
    "linda",
    "joanna",
    "salli",
    "ivy",
    "kendra",
    "kimberly",
    "nicole",
    "amy",
    "emma",
  ];

  const isFemaleName = (name) => {
    const lower = (name || "").toLowerCase();
    return femaleKeywords.some((k) => lower.includes(k));
  };

  const isEn = (v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    return lang.startsWith("en");
  };

  const isEnIn = (v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    return (
      lang === "en-in" || lang.startsWith("en-in") || name.includes("india")
    );
  };

  // Priority 1: Indian English Female Voice
  const inFemale = voices.find((v) => isEnIn(v) && isFemaleName(v.name));
  if (inFemale) return inFemale;

  // Priority 2: Any English Female Voice (en-US, en-GB, en-AU, etc.)
  const enFemale = voices.find((v) => isEn(v) && isFemaleName(v.name));
  if (enFemale) return enFemale;

  // Priority 3: Any Indian English Voice
  const anyIn = voices.find((v) => isEnIn(v));
  if (anyIn) return anyIn;

  // Priority 4: Any English Voice
  const anyEn = voices.find((v) => isEn(v));
  if (anyEn) return anyEn;

  // Priority 5: Fallback to first available voice
  return voices[0] || null;
}

export default function VoiceChat({ onBack }) {
  /* states */

  const [isListening, setIsListening] = useState(false);

  const [isThinking, setIsThinking] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [liveTranscript, setLiveTranscript] = useState("");

  /* default voice messages */

  const defaultMessages = [];

  /* restore voice chat history from current session */

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = sessionStorage.getItem("voiceChatHistory");

      return savedMessages ? JSON.parse(savedMessages) : defaultMessages;
    } catch (error) {
      console.error("Unable to restore voice chat history:", error);

      return defaultMessages;
    }
  });

  const [isSupported, setIsSupported] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  /* refs */

  const recognitionRef = useRef(null);

  const finalTranscriptRef = useRef("");

  const chatContainerRef = useRef(null);

  const messagesEndRef = useRef(null);

  /* audio visualizer refs */

  const audioContextRef = useRef(null);

  const analyserRef = useRef(null);

  const microphoneStreamRef = useRef(null);

  const animationFrameRef = useRef(null);

  const barsRef = useRef([]);

  /* number of frequency bars */

  const BAR_COUNT = 36;

  /* initialize browser voices */

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  /* get user name */

  const getUserName = () => {
    try {
      /* get chatbot user from current session */

      const chatbotUser = JSON.parse(
        sessionStorage.getItem("chatbotAuthenticated"),
      );

      if (chatbotUser?.name?.trim()) {
        return chatbotUser.name.trim();
      }

      /* fallback to main application user */

      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.email) {
        return user.email.split("@")[0];
      }

      return "there";
    } catch {
      return "there";
    }
  };

  const userName = getUserName();

  /* save voice chat history whenever messages change */

  useEffect(() => {
    try {
      sessionStorage.setItem("voiceChatHistory", JSON.stringify(messages));
    } catch (error) {
      console.error("Unable to save voice chat history:", error);
    }
  }, [messages]);

  /* get current time */

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* bot response */

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.trim().toLowerCase();

    /* greeting */

    if (
      lowerMessage === "hi" ||
      lowerMessage === "hii" ||
      lowerMessage === "hiii" ||
      lowerMessage === "hello" ||
      lowerMessage === "hey"
    ) {
      return {
        text: `Hi ${userName}! 👋 Great to hear from you. I'm Barun's AI Agent, your admission counsellor at Barun's University. How may I help you today?`,
        suggestions: ["Courses", "Fees", "Scholarships", "Admissions"],
      };
    }

    /* courses */

    if (
      lowerMessage.includes("course") ||
      lowerMessage.includes("courses") ||
      lowerMessage.includes("program")
    ) {
      return {
        text: "We offer a wide range of undergraduate and postgraduate programs including B.Tech, MBA, BBA, MCA, and many more. Which program would you like to know about?",
        suggestions: ["B.Tech", "MBA", "BBA", "MCA"],
      };
    }

    /* fees */

    if (lowerMessage.includes("fee")) {
      return {
        text: "Our fee structure depends on the program you choose. I can help you explore the fees for a specific course.",
        suggestions: ["B.Tech Fees", "MBA Fees", "BBA Fees", "Scholarships"],
      };
    }

    /* scholarships */

    if (lowerMessage.includes("scholarship")) {
      return {
        text: "We offer different scholarship opportunities based on academic performance and eligibility criteria. Would you like to know about eligibility or the application process?",
        suggestions: [
          "Scholarship Eligibility",
          "Apply for Scholarship",
          "Scholarship Types",
          "Contact Admission",
        ],
      };
    }

    /* admission */

    if (lowerMessage.includes("admission") || lowerMessage.includes("apply")) {
      return {
        text: "I can guide you through the admission process, eligibility requirements, application steps, and important documents.",
        suggestions: [
          "Admission Process",
          "Eligibility",
          "Required Documents",
          "Application Form",
        ],
      };
    }

    /* default response */

    return {
      text: `Thanks for your message, ${userName}! 👋 I would be happy to help you with courses, fees, scholarships, admissions, or campus life.`,
      suggestions: ["Courses", "Fees", "Scholarships", "Admissions"],
    };
  };

  /* bot response and speech */

  const addBotResponse = async (userText) => {
    setIsThinking(true);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    const response = getBotResponse(userText);

    await minDelay;
    setIsThinking(false);

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: response.text,
      time: getCurrentTime(),
      suggestions: (response.suggestions || []).slice(0, 4),
    };

    setMessages((previousMessages) => [...previousMessages, botMessage]);

    /* bot voice */

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(response.text);
      const femaleVoice = getFemaleVoice();

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.lang = femaleVoice.lang || "en-IN";
      } else {
        utterance.lang = "en-IN";
      }

      utterance.pitch = 1.05;
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  /* stop audio visualizer */

  const stopAudioVisualizer = () => {
    /* stop animation */

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = null;
    }

    /* stop microphone tracks */

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());

      microphoneStreamRef.current = null;
    }

    /* close audio context */

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }

      audioContextRef.current = null;
    }

    analyserRef.current = null;

    /* reset bars */

    barsRef.current.forEach((bar) => {
      if (bar) {
        bar.style.height = "6px";
        bar.style.opacity = "0.35";
      }
    });
  };

  /* start audio visualizer */

  const startAudioVisualizer = async () => {
    try {
      /* ask for microphone access */

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      microphoneStreamRef.current = stream;

      /* create AudioContext */

      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const audioContext = new AudioContext();

      audioContextRef.current = audioContext;

      /* microphone source */

      const microphone = audioContext.createMediaStreamSource(stream);

      /* analyzer */

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 128;

      analyser.smoothingTimeConstant = 0.75;

      microphone.connect(analyser);

      analyserRef.current = analyser;

      /* frequency data */

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);

      /* animation loop */

      const updateVisualizer = () => {
        if (!analyserRef.current) {
          return;
        }

        analyserRef.current.getByteFrequencyData(frequencyData);

        const totalBars = barsRef.current.length;

        for (let i = 0; i < totalBars; i++) {
          const dataIndex = Math.floor((i / totalBars) * frequencyData.length);

          const value = frequencyData[dataIndex] || 0;

          /* convert audio level to bar height */

          const height = Math.max(6, Math.min(55, 6 + value * 0.7));

          const bar = barsRef.current[i];

          if (bar) {
            bar.style.height = `${height}px`;

            bar.style.opacity = value > 15 ? "1" : "0.45";
          }
        }

        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (error) {
      console.error("Microphone visualizer error:", error);

      setErrorMessage("Microphone permission is required for voice mode.");
    }
  };

  /* create speech recognition */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    /* browser support */

    if (!SpeechRecognition) {
      setIsSupported(false);

      return;
    }

    const recognition = new SpeechRecognition();

    /* continuous listening */

    recognition.continuous = true;

    /* real-time interim results */

    recognition.interimResults = true;

    /* language */

    recognition.lang = "en-IN";

    /* one best result */

    recognition.maxAlternatives = 1;

    /* save reference */

    recognitionRef.current = recognition;

    /* speech result */

    recognition.onresult = (event) => {
      let interimTranscript = "";

      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      /* real-time transcript */

      setLiveTranscript(finalTranscriptRef.current + interimTranscript);

      /* final transcript */

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;

        const completeTranscript = finalTranscriptRef.current.trim();

        setLiveTranscript(completeTranscript);

        if (completeTranscript) {
          const userMessage = {
            id: Date.now(),
            sender: "user",
            text: completeTranscript,
            time: getCurrentTime(),
          };

          setMessages((previousMessages) => [...previousMessages, userMessage]);

          /* reset transcript */

          finalTranscriptRef.current = "";

          setLiveTranscript("");

          /* bot response */

          void addBotResponse(completeTranscript);
        }
      }
    };

    /* start */

    recognition.onstart = () => {
      setIsListening(true);

      setErrorMessage("");
    };

    /* end */

    recognition.onend = () => {
      setIsListening(false);

      stopAudioVisualizer();
    };

    /* error */

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      setIsListening(false);

      stopAudioVisualizer();

      if (event.error === "not-allowed") {
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access.",
        );
      } else if (event.error === "no-speech") {
        setErrorMessage("No speech detected. Please try speaking again.");
      } else {
        setErrorMessage("Something went wrong with voice recognition.");
      }
    };

    /* cleanup */

    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore stop errors */
      }

      stopAudioVisualizer();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* auto scroll */

  // For committed messages, thinking state, and speaking transitions -> anchor immediately and follow up
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    const timeoutId = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, isThinking, isSpeaking]);

  // For live interim transcript while speaking -> instant anchor (no jitter/jump)
  useEffect(() => {
    if (liveTranscript && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  /* start listening */

  const startListening = async () => {
    if (!recognitionRef.current) {
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setErrorMessage("");

    finalTranscriptRef.current = "";

    setLiveTranscript("");

    /* start microphone visualizer */

    await startAudioVisualizer();

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log("Recognition already started.");
    }
  };

  /* stop listening */

  const stopListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      /* ignore stop errors */
    }

    setIsListening(false);

    stopAudioVisualizer();
  };

  /* suggestion click */

  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: suggestion,
      time: getCurrentTime(),
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);

    void addBotResponse(suggestion);
  };

  /* browser not supported */

  if (!isSupported) {
    return (
      <div
        className="
          relative
          flex
          h-[570px]
          flex-col
          items-center
          justify-center
          bg-[#fffaf0]
          px-6
          text-center
        "
      >
        {/* back button */}

        <button
          type="button"
          onClick={onBack}
          className="
            absolute
            left-4
            top-4
            z-10
            flex
            cursor-pointer
            items-center
            gap-2
            rounded-lg
            px-2
            py-1.5
            text-sm
            font-medium
            text-gray-600
            transition
            hover:bg-blue-100
            hover:text-blue-600
          "
        >
          <ArrowLeft className="h-4 w-4 " />
        </button>

        <div
          className="
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-red-100
          "
        >
          <MicOff
            className="
              h-8
              w-8
              text-red-500
            "
          />
        </div>

        <h2
          className="
            text-lg
            font-bold
            text-gray-800
          "
        >
          Voice is not supported
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-gray-500
          "
        >
          Your current browser does not support speech recognition.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        flex
        h-[570px]
        flex-col
        bg-[#fffaf0]
      "
    >
      {/* back button */}

      <button
        type="button"
        onClick={onBack}
        className="
          absolute
          left-3
          top-3
          z-20
          flex
          cursor-pointer
          items-center
          gap-2
          rounded-lg
          bg-white/90
          px-2.5
          py-1.5
          text-sm
          font-medium
          text-gray-600
          shadow-sm
          backdrop-blur
          transition
          hover:bg-blue-100
          hover:text-blue-600
        "
        title="Back to chat options"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {/* live / chat area */}

      <div
        ref={chatContainerRef}
        className="
          flex-1
          overflow-y-auto
          px-4
          pb-5
          pt-14
        "
      >
        <div className="space-y-5">
          {/* live transcript */}

          {liveTranscript && (
            <div className="flex justify-end">
              <div
                className="
                  max-w-[82%]
                  rounded-2xl
                  rounded-br-md
                  bg-blue-100
                  px-4
                  py-3
                  shadow-sm
                "
              >
                <p
                  className="
                    text-sm
                    leading-6
                    text-gray-800
                  "
                >
                  {liveTranscript}
                </p>

                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-1
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      animate-pulse
                      rounded-full
                      bg-red-500
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      text-gray-500
                    "
                  >
                    Listening...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* chat messages */}

          {messages.map((item) => (
            <div key={item.id}>
              {/* message */}

              <div
                className={`
                  flex
                  ${item.sender === "user" ? "justify-end" : "justify-start"}
                `}
              >
                <div
                  className={`
                    max-w-[82%]
                    rounded-2xl
                    px-4
                    py-3
                    shadow-sm
                    ${
                      item.sender === "user"
                        ? "rounded-br-md bg-blue-100 text-gray-800"
                        : "rounded-bl-md bg-blue-300 text-gray-800"
                    }
                  `}
                >
                  <p
                    className="
                      text-sm
                      leading-6
                    "
                  >
                    {item.text}
                  </p>

                  <p
                    className="
                      mt-2
                      text-[10px]
                      text-gray-500
                    "
                  >
                    {item.time}
                  </p>
                </div>
              </div>

              {/* bot suggestions */}

              {item.sender === "bot" && item.suggestions?.length > 0 && (
                <div
                  className="
                      mt-3
                      flex
                      flex-wrap
                      gap-2
                    "
                >
                  {item.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="
                            cursor-pointer
                            rounded-full
                            border
                            border-blue-400
                            bg-blue-100
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-gray-800
                            transition-all
                            duration-200
                            hover:bg-blue-200
                            hover:shadow-sm
                          "
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* thinking indicator */}

          {isThinking && (
            <div className="flex justify-start">
              <div
                className="
                  rounded-2xl
                  rounded-bl-md
                  bg-blue-200
                  px-4
                  py-3
                  text-sm
                  text-gray-700
                  shadow-sm
                  animate-pulse
                "
              >
                Thinking...
              </div>
            </div>
          )}

          {/* auto scroll */}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* voice control */}

      <div
        className="
          border-t
          bg-white
          px-5
          py-5
        "
      >
        {/* error */}

        {errorMessage && (
          <p
            className="
              mb-3
              text-center
              text-xs
              text-red-500
            "
          >
            {errorMessage}
          </p>
        )}

        {/* listening status */}

        <div
          className="
            mb-3
            text-center
          "
        >
          {isListening ? (
            <p
              className="
                text-xs
                font-semibold
                tracking-wide
                text-red-500
              "
            >
              LISTENING
            </p>
          ) : isThinking ? (
            <p
              className="
                text-xs
                font-semibold
                tracking-wide
                text-blue-500
              "
            >
              THINKING...
            </p>
          ) : isSpeaking ? (
            <p
              className="
                text-xs
                font-semibold
                tracking-wide
                text-green-600
              "
            >
              SPEAKING...
            </p>
          ) : (
            <p
              className="
                text-xs
                text-gray-400
              "
            >
              Tap the microphone and start speaking
            </p>
          )}
        </div>

        {/* frequency visualizer */}

        <div
          className="
            mb-4
            flex
            h-[70px]
            items-center
            justify-center
            gap-[3px]
            overflow-hidden
            rounded-xl
            bg-[#fffaf0]
            px-3
          "
        >
          {Array.from({
            length: BAR_COUNT,
          }).map((_, index) => (
            <span
              key={index}
              ref={(element) => {
                barsRef.current[index] = element;
              }}
              className="
                w-[3px]
                rounded-full
                bg-blue-400
                transition-[height,opacity]
                duration-75
              "
              style={{
                height: "6px",
                opacity: 0.35,
              }}
            />
          ))}
        </div>

        {/* microphone button */}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`
              flex
              h-16
              w-16
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-white
              shadow-lg
              transition-all
              duration-200
              hover:scale-105
              ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-400 hover:bg-blue-500"
              }
            `}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <MicOff className="h-7 w-7" />
            ) : (
              <Mic className="h-7 w-7" />
            )}
          </button>
        </div>

        {/* status */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <Volume2
            className="
              h-4
              w-4
              text-blue-400
            "
          />

          <span
            className="
              text-xs
              text-gray-400
            "
          >
            {isListening
              ? "Voice recognition active"
              : isThinking
                ? "AI is preparing response..."
                : isSpeaking
                  ? "AI is speaking..."
                  : "Ready to listen"}
          </span>
        </div>
      </div>
    </div>
  );
}
