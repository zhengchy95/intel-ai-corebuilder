import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

const useAppStore = create((set) => ({
  username: null,
  setUsername: async () => {
    const username = await invoke("get_username");
    console.debug("Username fetched:", username);
    set({ username });
  },
}));

export default useAppStore;
