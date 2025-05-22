import * as React from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import "./App.css";
import AppBar from "./components/appBar/AppBar";
import SideBar from "./components/sideBar/SideBar";
import StatusBar from "./components/statusBar/StatusBar";
import Settings from "./components/settings/Settings";
import Chat from "./pages/chat/Chat";
import Model from "./pages/model/Model";
import KnowledgeBase from "./pages/knowledgeBase/KnowledgeBase";
import useAppStore from "./stores/AppStore";
import useUIStore from "./stores/UIStores";
import useSuperbuilderStore from "./stores/SuperbuilderStore";
import useModelStore from "./stores/ModelStore";
import useChatStore from "./stores/ChatStore";
import useKBStore from "./stores/KBStore";

function App() {
  const theme = useTheme();
  const appTheme = useUIStore((state) => state.appTheme);
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const appPage = useUIStore((state) => state.appPage);
  const config = useSuperbuilderStore((state) => state.config);
  const models = useModelStore((state) => state.models);
  const setStatus = useAppStore((state) => state.setStatus);
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const mode =
    appTheme === "system" ? (prefersDarkMode ? "dark" : "light") : appTheme;

  const customTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  React.useEffect(() => {
    const initializeApp = async () => {
      const response = await invoke("connect_client");
      console.log("Middleware status:", response);
      if (response == "Connected") {
        await useSuperbuilderStore.getState().fetchConfig();
        await useChatStore.getState().getSession();
      }
    };

    setStatus("Initializing...");
    initializeApp();
  }, []);

  React.useEffect(() => {
    const fetchModels = async () => {
      await useModelStore.getState().setLocalModelDir(config.local_model_hub);
      await useModelStore.getState().setEndpoint(config);
      await useModelStore.getState().fetchModels(config);
    };

    if (config) {
      setStatus("Parsing Models...");
      // useAppStore.getState().setUsername();
      fetchModels();
    }
  }, [config]);

  React.useEffect(() => {
    const modelWarmUp = async () => {
      const selectedDownloaded = models.filter(
        (m) => m.selected === true && m.downloaded === true
      );
      if (
        selectedDownloaded.length === 3 &&
        selectedDownloaded.filter((m) => m.model_type === "chat_model")
          .length === 1 &&
        selectedDownloaded.filter((m) => m.model_type === "embedding_model")
          .length === 1 &&
        selectedDownloaded.filter((m) => m.model_type === "ranker_model")
          .length === 1
      ) {
        // All conditions met
        setStatus("Checking PyLLM...");
        const pyllm_status = await useSuperbuilderStore
          .getState()
          .checkPyLLM(config);
        if (pyllm_status === "ready") {
          setStatus("Loading Models...");
          await useSuperbuilderStore.getState().loadModels();
          await useKBStore.getState().getRAGFiles();
          setStatus("");
        }
      }
    };

    if (models) {
      modelWarmUp();
    }
  }, [models]);

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box display="flex" sx={{ height: "100%", width: "100%" }}>
        <AppBar />
        <SideBar />
        <Box
          component="main"
          sx={{
            height: "100%",
            flexGrow: 1,
            p: 3,
            transition: (theme) =>
              theme.transitions.create("margin", {
                easing: drawerOpen
                  ? theme.transitions.easing.easeOut
                  : theme.transitions.easing.sharp,
                duration: drawerOpen
                  ? theme.transitions.duration.enteringScreen
                  : theme.transitions.duration.leavingScreen,
              }),
            marginLeft: drawerOpen ? "0px" : "-240px",
          }}
        >
          {appPage === "chat" && <Chat />}
          {appPage === "model" && <Model />}
          {appPage === "knowledge base" && <KnowledgeBase />}
          {appPage === "settings" && <Typography>Settings Page</Typography>}
        </Box>
        {/* <StatusBar /> */}
        <Settings />
      </Box>
    </ThemeProvider>
  );
}

export default App;
