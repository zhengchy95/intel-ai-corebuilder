import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { stat, readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { basename, dirname, extname } from "@tauri-apps/api/path";

const useKBStore = create((set) => ({
  validExtensions: ["pdf", "docx", "txt", "md", "pptx", "xlsx", "csv"],
  initialPath: [],
  files: [],
  uploading: false,
  rag_files: [],
  selected_rag_files: [],

  setFiles: (fileList) => set({ files: fileList }),
  clearFiles: () => set({ files: [] }),
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  removeFile: (file) => {
    set((state) => ({
      files: state.files.filter((f) => f !== file),
    }));
  },

  toggleUploading: () => set((state) => ({ uploading: !state.uploading })),
  setUploadingTrue: () => set({ uploading: true }),
  setUploadingFalse: () => set({ uploading: false }),

  processPath: async (paths) => {
    for (const path of paths) {
      const pathStat = await stat(path);
      if (pathStat.isDirectory) {
        const dir = await readDir(path);
        for (const file of dir) {
          const fileStat = await stat(path + "\\" + file.name);
          if (file.isFile && !file.isSymlink) {
            const ext = file.name.split(".").pop();
            if (
              useKBStore.getState().validExtensions.includes(ext.toLowerCase())
            ) {
              if (
                !useKBStore
                  .getState()
                  .rag_files.some(
                    (item) => item.name === file.name && item.path === path
                  )
              ) {
                useKBStore.getState().addFile(path + "\\" + file.name);
                useKBStore.getState().addRAGFiles(file.name, path, fileStat);
              }
            }
          }
        }
      } else if (pathStat.isFile) {
        const ext = path.split(".").pop();
        if (useKBStore.getState().validExtensions.includes(ext.toLowerCase())) {
          const fileName = await basename(path);
          const dirName = await dirname(path);
          if (
            !useKBStore
              .getState()
              .rag_files.some(
                (item) => item.name === fileName && item.path === dirName
              )
          ) {
            useKBStore.getState().addFile(path);

            useKBStore.getState().addRAGFiles(fileName, dirName, pathStat);
          }
        }
      }
    }
  },

  uploadFiles: async () => {
    console.debug("Uploading files:", useKBStore.getState().files);
    useKBStore.getState().setUploadingTrue();
    await invoke("upload_file", {
      paths: JSON.stringify(useKBStore.getState().files),
    });
    useKBStore.getState().setUploadingFalse();
  },

  getRAGFiles: async () => {
    const response = await invoke("get_file_list");
    const files = JSON.parse(response);
    console.log(`${files.length} RAG files found.`);
    console.debug("Found RAG files:", files);
    for (const file of files) {
      const fileStat = await stat(file);
      const fileName = await basename(file);
      const dirName = await dirname(file);
      useKBStore.getState().addRAGFiles(fileName, dirName, fileStat);
      useKBStore.getState().updateRAGFileStatus(fileName, "Uploaded");
      if (
        dirName.includes("pyllmsrv") &&
        dirName.includes("feedback_docs") &&
        fileName.includes("feedback")
      ) {
        const content = await readTextFile(file);
        const sessions = useChatStore.getState().sessions;
        for (const session of sessions) {
          session.messages.forEach((message, index) => {
            if (message.sender === "user" && content.startsWith(message.text)) {
              let combinedText = message.text;
              if (index + 1 < session.messages.length) {
                combinedText += " " + session.messages[index + 1].text;
              }
              const remainingContent = content
                .slice(
                  combinedText.length + 1 + combinedText.split("\n").length - 1
                )
                .trim();
              useChatStore.getState().setFeedback({
                sessionID: session.sid,
                messageID: index + 1,
                type: remainingContent.includes("Positive")
                  ? "feedback-thumbs-up"
                  : "feedback-thumbs-down",
                text: remainingContent,
                added: true,
                rag_file: {
                  name: fileName,
                  path: dirName,
                },
              });
              return;
            }
          });
        }
      }
    }
  },

  addRAGFiles: (name, path, fileStat) =>
    set((state) => ({
      rag_files: [
        ...state.rag_files,
        {
          id:
            state.rag_files.length > 0
              ? state.rag_files.reduce(
                  (maxId, file) => Math.max(maxId, file.id),
                  0
                ) + 1
              : state.rag_files.length + 1,
          name: name,
          type: name.split(".").pop(),
          size: `${(fileStat.size / (1024 * 1024)).toFixed(2)} MB`,
          status: "Uploading",
          progress: 0,
          path: path,
          added: new Date(fileStat.atime).toLocaleString(),
          modified: new Date(fileStat.mtime).toLocaleString(),
        },
      ],
    })),

  updateRAGFileStatus: (name, status) => {
    set((state) => ({
      rag_files: state.rag_files.map((file) =>
        file.name === name ? { ...file, status: status } : file
      ),
    }));
  },

  updateRAGFileProgress: (name, progress) => {
    set((state) => ({
      rag_files: state.rag_files.map((file) =>
        file.name === name ? { ...file, progress: progress } : file
      ),
    }));
  },

  setSelectedRAGFiles: (files) => {
    set({
      selected_rag_files: files,
    });
  },

  clearSelectedRAGFiles: () => {
    set({ selected_rag_files: [] });
  },

  removeRAGFiles: async () => {
    for (const file of useKBStore.getState().selected_rag_files) {
      console.log(`Removing files: ${file.name}`);
      useKBStore.getState().updateRAGFileStatus(file.name, "Removing");
    }
    await invoke("remove_file", {
      files: JSON.stringify(
        useKBStore
          .getState()
          .selected_rag_files.map((file) => file.path + "\\" + file.name)
      ),
    });
    console.log("Removed all selected files.");
    for (const file of useKBStore.getState().selected_rag_files) {
      set((state) => ({
        rag_files: state.rag_files.filter((f) => f.name !== file.name),
      }));
    }
    useKBStore.getState().clearSelectedRAGFiles();
  },

  cancelUploadFiles: async () => {
    await invoke("stop_upload_file");

    set((state) => ({
      rag_files: state.rag_files.filter((f) => f.status === "Uploaded"),
    }));

    useKBStore.getState().setUploadingFalse();
    console.debug("File upload Cancelled.");
  },
}));

export default useKBStore;
