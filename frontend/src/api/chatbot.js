import API from "./config";

export const sendChatbotMessage = async (message) => {
  const res = await API.post("/chatbot", { message });
  return res.data; // { reply }
};
