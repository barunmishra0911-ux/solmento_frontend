import {
  deleteChatbotRequest,
  duplicateChatbotRequest,
  listChatbotsRequest,
  updateChatbotStatusRequest,
} from "@/lib/authApi";

export const chatbotService = {
  async list() {
    const { chatbots = [] } = await listChatbotsRequest();
    return chatbots;
  },
  async setStatus(id, status) {
    const { chatbot } = await updateChatbotStatusRequest(id, status);
    return chatbot;
  },
  async duplicate(id) {
    const { chatbot } = await duplicateChatbotRequest(id);
    return chatbot;
  },
  async remove(id) {
    const { chatbot } = await deleteChatbotRequest(id);
    return chatbot;
  },
};
