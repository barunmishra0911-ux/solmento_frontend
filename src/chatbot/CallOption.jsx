import { Phone } from "lucide-react";
import ChatbotOption from "./ChatbotOption";

export default function CallOption({ onClick }) {
  return (
    <ChatbotOption
      icon={Phone}
      title="Call"
      description="Talk with us directly"
      onClick={onClick}
    />
  );
}
