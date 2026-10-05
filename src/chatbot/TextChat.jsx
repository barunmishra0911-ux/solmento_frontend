import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft } from "lucide-react";

export default function TextChat({ onBack }) {
  // message input
  const [message, setMessage] = useState("");

  // get user name
  const getUserName = () => {
    try {
      // get chatbot user from current session
      const chatbotUser = JSON.parse(
        sessionStorage.getItem("chatbotAuthenticated"),
      );

      if (chatbotUser?.name?.trim()) {
        return chatbotUser.name.trim();
      }

      // fallback to main application user
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

  // default chat messages
  const defaultMessages = [
    {
      id: 1,
      sender: "bot",
      text: `Hi ${userName}! 👋 I'm Barun, your admission counsellor at Barun's University. How may I help you today? Whether it's about courses, fees, scholarships, or campus life — just ask!`,
      time: "09:53 AM",
      suggestions: ["Courses", "Fees", "Scholarships", "Campus Life"],
    },
  ];

  // restore chat history from current browser session
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = sessionStorage.getItem("textChatHistory");

      return savedMessages ? JSON.parse(savedMessages) : defaultMessages;
    } catch (error) {
      console.error("Unable to restore text chat history:", error);

      return defaultMessages;
    }
  });

  // auto scroll
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // save chat history whenever messages change
  useEffect(() => {
    try {
      sessionStorage.setItem("textChatHistory", JSON.stringify(messages));
    } catch (error) {
      console.error("Unable to save text chat history:", error);
    }
  }, [messages]);

  // get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // bot response
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.trim().toLowerCase();

    // greeting
    if (
      lowerMessage === "hi" ||
      lowerMessage === "hii" ||
      lowerMessage === "hiii" ||
      lowerMessage === "hello" ||
      lowerMessage === "hey" ||
      lowerMessage.startsWith("hi ") ||
      lowerMessage.startsWith("hello ") ||
      lowerMessage.startsWith("hey ")
    ) {
      return {
        text: `Hi ${userName}! 👋 Great to hear from you. I'm Barun, your admission counsellor at Barun's University. How may I help you today? You can ask me about courses, fees, scholarships, admissions, or campus life.`,
        suggestions: ["Courses", "Fees", "Scholarships", "Admissions"],
      };
    }

    // courses
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

    // fees
    if (lowerMessage.includes("fee")) {
      return {
        text: "Our fee structure depends on the program you choose. I can help you explore the fees for a specific course.",
        suggestions: ["B.Tech Fees", "MBA Fees", "BBA Fees", "Scholarships"],
      };
    }

    // scholarships
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

    // campus and hostel
    if (lowerMessage.includes("campus") || lowerMessage.includes("hostel")) {
      return {
        text: "Our campus provides modern facilities, academic infrastructure, student activities, and hostel accommodation. What would you like to explore?",
        suggestions: [
          "Hostel",
          "Campus Facilities",
          "Student Life",
          "Contact Us",
        ],
      };
    }

    // mba
    if (lowerMessage === "mba") {
      return {
        text: "Our MBA program is designed to develop strong management, leadership, and business skills. Would you like to know about eligibility, fees, or admissions?",
        suggestions: [
          "MBA Eligibility",
          "MBA Fees",
          "MBA Admission",
          "MBA Specializations",
        ],
      };
    }

    // b.tech
    if (lowerMessage.includes("b.tech") || lowerMessage.includes("btech")) {
      return {
        text: "Our B.Tech programs cover multiple engineering disciplines. I can help you with specializations, eligibility, fees, and admission details.",
        suggestions: [
          "B.Tech Specializations",
          "B.Tech Eligibility",
          "B.Tech Fees",
          "B.Tech Admission",
        ],
      };
    }

    // bba
    if (lowerMessage === "bba") {
      return {
        text: "The BBA program focuses on business fundamentals, management, entrepreneurship, and professional skills. What would you like to know?",
        suggestions: [
          "BBA Eligibility",
          "BBA Fees",
          "BBA Admission",
          "BBA Curriculum",
        ],
      };
    }

    // admission
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

    // contact
    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("counsellor")
    ) {
      return {
        text: "Sure! I can help you connect with the admission team. Would you like to explore the admission process or get contact information?",
        suggestions: [
          "Admission Process",
          "Contact Admission",
          "Call Counsellor",
          "Office Location",
        ],
      };
    }

    // default response
    return {
      text: `Thanks for your message, ${userName}! 👋 I'd be happy to help. You can ask me about courses, fees, scholarships, admissions, campus life, or hostel facilities.`,
      suggestions: ["Courses", "Fees", "Scholarships", "Admissions"],
    };
  };

  // send message
  const sendMessage = (text) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) {
      return;
    }

    // user message
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
      time: getCurrentTime(),
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);

    setMessage("");

    // bot response
    setTimeout(() => {
      const response = getBotResponse(trimmedMessage);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.text,
        time: getCurrentTime(),
        suggestions: response.suggestions,
      };

      setMessages((previousMessages) => [...previousMessages, botMessage]);
    }, 700);
  };

  // form submit
  const handleSendMessage = (event) => {
    event.preventDefault();

    sendMessage(message);
  };

  // suggestion click
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="relative flex h-[570px] flex-col bg-[#fffaf0]">
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
    justify-center
    rounded-lg
    bg-white
    p-2
    text-gray-600
    shadow-sm
    transition
    hover:bg-blue-50
    hover:text-blue-600
  "
        title="Back to chat options"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {/* chat messages */}

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {messages.map((item) => (
            <div key={item.id}>
              {/* message */}

              <div
                className={`flex ${
                  item.sender === "user" ? "justify-end" : "justify-start"
                }`}
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
                  <p className="text-sm leading-6">{item.text}</p>

                  <p className="mt-2 text-[10px] text-gray-500">{item.time}</p>
                </div>
              </div>

              {/* suggestions after bot response */}

              {item.sender === "bot" && item.suggestions?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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

          {/* auto scroll target */}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* message input */}

      <form
        onSubmit={handleSendMessage}
        className="
          border-t
          bg-white
          p-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-gray-200
            bg-white
            px-3
            py-1
            shadow-sm
          "
        >
          {/* input */}

          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your message..."
            className="
              flex-1
              bg-transparent
              px-2
              py-2
              text-sm
              outline-none
            "
          />

          {/* send button */}

          <button
            type="submit"
            disabled={!message.trim()}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-400
              text-white
              transition
              hover:bg-blue-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            title="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
