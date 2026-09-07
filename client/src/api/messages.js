import api from "./axios";

export const getMessages = () => {
  return api.get("/messages");
};

export const sendMessage = (data) => {
  return api.post("/messages", data);
};