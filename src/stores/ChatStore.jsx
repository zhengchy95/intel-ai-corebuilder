import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import findNextNumber from "../utils/nextSidCheck";

const useChatStore = create((set, get) => ({
  prompt: "",
  setPrompt: (prompt) => set({ prompt }),
  sendPrompt: async (input) => {
    const selectedSid = get().selectedSession;
    const selectedSession = get().sessions.find(
      (session) => session.sid === selectedSid
    );
    if (!selectedSession) {
      console.error("No session found with the given SID.");
      return;
    }
    // Extract messages into array of dictionaries
    const selectedChatHistory = selectedSession.messages.map((message) => ({
      Role: message.sender,
      Content: message.text,
    }));
    useChatStore.getState().renameSession(selectedSid, input);
    const newMessage = {
      sender: "user",
      text: input,
      query_type: get().query,
      attached_files: JSON.stringify(get().attachments),
      timestamp: new Date().getTime(),
    };
    useChatStore.getState().addChatMessage(newMessage);
    const newDraftResponse = {
      sender: "assistant",
      text: "",
      timestamp: new Date().getTime() + 1,
    };
    useChatStore.getState().addChatMessage(newDraftResponse);
    const response = await invoke("call_chat", {
      name: "CoreUI",
      prompt: input,
      conversationHistory: selectedChatHistory,
      sid: selectedSid,
      query: get().query,
      files: JSON.stringify(get().attachments),
    });
    return JSON.parse(response);
  },

  addChatMessage: (message) => {
    set((state) => {
      const sessions = get().sessions.map((session) => {
        if (session.sid === get().selectedSession) {
          return {
            ...session,
            messages: [...session.messages, message],
          };
        }
        return session;
      });
      return { sessions: sessions };
    });
  },

  updateLastChatMessage: (newMessage) => {
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.sid === state.selectedSession) {
          const messages = session.messages;
          messages[messages.length - 1].text = newMessage;
          messages[messages.length - 1].timestamp = new Date().getTime();
          console.log("Updating Messages:", newMessage);
          return { ...session, messages: messages };
        }
        return session;
      }),
    }));
  },

  response: "",
  responseCompleted: true,
  setResponseCompleted: (completed) => set({ responseCompleted: completed }),
  setResponse: (streamResponse) =>
    set((state) => ({ response: state.response + streamResponse })),
  clearResponse: () => set({ response: "" }),
  stopResponse: async () => {
    console.log("Stopping chat stream early...");
    await invoke("stop_chat");
  },

  sessions: [],
  selectedSession: null,
  getSession: async () => {
    const sessions = await invoke("get_chat_history");
    console.debug("Chat history:", JSON.parse(sessions));
    set({ sessions: JSON.parse(sessions) });
  },
  updateSessions: async (sessions) => {
    set({ sessions: sessions });
  },
  setSelectedSession: (sid) => {
    set({ selectedSession: sid });
  },

  createSession: async () =>
    set((state) => {
      const sessions = get().sessions;
      const newSession = {
        sid: findNextNumber(sessions.map((session) => session.sid)),
        messages: [],
        name: "New Chat",
        date: new Date(),
      };
      return {
        sessions: [...sessions, newSession],
        selectedSession: newSession.sid,
      };
    }),

  renameSession: async (sid, name) => {
    const result = await invoke("rename_chat_session", {
      sid: sid,
      name: name,
    });
    if (result) {
      const updatedSessions = get().sessions.map((session) => {
        if (session.sid === sid) {
          return { ...session, name: name };
        }
        return session;
      });
      set({ sessions: updatedSessions });
    }
  },

  removeSession: async (sid) => {
    try {
      await invoke("remove_chat_session", { sid: sid });
      const remainingSessions = get().sessions.filter(
        (session) => session.sid !== sid
      );
      useChatStore.getState().updateSessions(remainingSessions);
      if (get().selectedSession === sid) {
        useChatStore.getState().setSelectedSession(null);
      }
    } catch (error) {
      console.error("Failed to remove chat session:", error);
    }
  },

  thinking: false,
  setThinking: (thinking) => set({ thinking }),

  query: "",
  setQuery: (query) => set({ query }),
  attachments: [],
  attachmentsExtensions: ["pdf", "docx", "txt", "md", "pptx", "xlsx", "csv"],
  setAttachments: (attachments) => set({ attachments }),
  addAttachment: (attachment) =>
    set((state) => ({
      attachments: [...state.attachments, ...attachment],
    })),
  removeAttachment: (attachment) => {
    set((state) => ({
      attachments: state.attachments.filter((att) => att !== attachment),
    }));
  },

  clearAttachments: () => set({ attachments: [] }),
}));

export default useChatStore;
