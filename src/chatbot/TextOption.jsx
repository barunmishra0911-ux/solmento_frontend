import { MessageSquare } from "lucide-react";
import ChatbotOption from "./ChatbotOption";

export default function TextOption({ onClick }) {
  return (
    <ChatbotOption
      icon={MessageSquare}
      title="Text"
      description="Type your messages"
      onClick={onClick}
    />
  );
}
