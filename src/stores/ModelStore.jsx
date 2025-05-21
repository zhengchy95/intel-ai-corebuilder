import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { checkModelDownloaded } from "../utils/modelCheck";

const useModelStore = create((set) => ({
  localModelDir: null,
  setLocalModelDir: async (path) => set({ localModelDir: path }),
  endpoint: null,
  setEndpoint: async (config) => set({ endpoint: config.download_endpoint }),

  models: [],
  fetchModels: async (config) => {
    try {
      const allModels = config.ActiveAssistant.all_models;
      const selectedModel = config.ActiveAssistant.models;
      const recommendedModel = JSON.parse(
        config.ActiveAssistant.recommended_models
      );
      const models = await Promise.all(
        allModels.map(async (model, index) => {
          const info = await invoke("get_hf_model_info", {
            modelId: model.download_link.includes("aibuilder")
              ? model.model_card.replace(config.download_endpoint + "/", "")
              : "OpenVINO/" + model.full_name,
          });
          const hfModelInfo = JSON.parse(info);

          const modelDownloaded = await checkModelDownloaded(
            config.local_model_hub,
            model.full_name
          );
          return {
            ...model,
            id: index,
            selected: Array.isArray(selectedModel)
              ? selectedModel.some((m) => m.short_name === model.short_name)
              : false,
            downloaded: modelDownloaded,
            recommended: recommendedModel.some(
              (item) => item.model === model.full_name
            ),
            accuracy:
              recommendedModel.find((item) => item.model === model.full_name)
                ?.accuracy ?? null,
            info: hfModelInfo,
          };
        })
      );
      console.debug("Models Fetched:", models);
      set({ models });
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  },

  downloadModel: async (model, local_model_dir) => {
    try {
      set((state) => ({ downloading: model.full_name }));
      const response = await invoke("download_model", {
        fileUrl: model.download_link,
        localPath: `${local_model_dir}${model.full_name}`,
      });
      set((state) => {
        const updatedModels = state.models.map((m) =>
          m.id === model.id ? { ...m, downloaded: true } : m
        );
        return { models: updatedModels };
      });
    } catch (error) {
      console.error("Error downloading model:", error);
    } finally {
      set((state) => ({ downloading: "", downloadProgress: 0 }));
    }
  },
  downloading: "",
  setDownloading: (downloading) => set({ downloading }),
  downloadProgress: 0,
  setDownloadProgress: (progress) => set({ downloadProgress: progress }),

  setSelectedModel: (selectedModel) =>
    set((state) => {
      const updatedModels = state.models.map((m) => {
        if (m.model_type === selectedModel.model_type) {
          // Only the selected model gets selected:true, others with same type get false
          return {
            ...m,
            selected: m.full_name === selectedModel.full_name,
          };
        }
        // Models with different type remain unchanged
        return m;
      });
      return { models: updatedModels };
    }),
}));

export default useModelStore;
