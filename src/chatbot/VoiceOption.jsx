import { Mic } from "lucide-react";
import ChatbotOption from "./ChatbotOption";

export default function VoiceOption({ onClick }) {
  return (
    <ChatbotOption
      icon={Mic}
      title="Voice"
      description="Talk Naturally With AI"
      onClick={onClick}
    />
  );
}
