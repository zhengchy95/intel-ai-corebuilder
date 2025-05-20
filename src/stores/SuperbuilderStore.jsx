import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

const useSuperbuilderStore = create((set) => ({
  config: null,

  fetchConfig: async () => {
    try {
      const response = await invoke("get_config", { assistant: "" });
      const rawConfig = JSON.parse(response);
      console.debug("Superbuilder DB config Fetched:", rawConfig);
      set({ config: rawConfig });
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  },

  updateModel: async (config, model) => {
    try {
      const newModelDict = config.ActiveAssistant.all_models.find(
        (m) => m.full_name === model.full_name
      );
      if (!newModelDict) {
        throw new Error("Model not found in all_models");
      }

      // Replace the model in models with the same model_type
      const updatedModels = config.ActiveAssistant.models.map((m) =>
        m.model_type === newModelDict.model_type ? newModelDict : m
      );
      const response = await invoke("update_db_models", {
        assistant: config.ActiveAssistant.short_name,
        modelsJson: JSON.stringify(updatedModels),
      });
      console.debug("Model updated:", response);
    } catch (error) {
      console.error("Error updating model:", error);
    }
  },

  checkPyLLM: async (config) => {
    try {
      const response = await invoke("check_pyllm", {
        assistant: config.ActiveAssistant.short_name,
      });
      console.debug("PyLLM check response:", response);
      return response;
    } catch (error) {
      console.error("PyLLM not Ready:", error);
    }
  },

  loadModels: async () => {
    try {
      const response = await invoke("load_models");
      console.debug("Models loaded:", response);
      return response;
    } catch (error) {
      console.error("Error loading models:", error);
    }
  },
}));

export default useSuperbuilderStore;
