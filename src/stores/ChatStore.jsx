import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

const useChatStore = create((set) => ({
  prompt: "",
  setPrompt: (prompt) => set({ prompt }),
  sendPrompt: async (prompt) => {
    const response = await invoke("call_chat", { prompt });
    return JSON.parse(response);
  },

  sessions: [],
  selectedSession: null,
  getSession: async () => {
    const sessions = await invoke("get_chat_history");
    console.debug("Chat history:", JSON.parse(sessions));
    set({ sessions: JSON.parse(sessions) });
  },
  setSelectedSession: (sid) => {
    set({ selectedSession: sid });
  },

  createSession: async () => {
    const session = await invoke("create_chat_session");
    set({ session: JSON.parse(session) });
  },
}));

export default useChatStore;
