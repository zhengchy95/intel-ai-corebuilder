import * as React from "react";
import { CssBaseline, Box, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import "./App.css";
import AppBar from "./components/appBar/AppBar";
import SideBar from "./components/sideBar/SideBar";
import Chat from "./pages/chat/Chat";
import Model from "./pages/model/Model";
import useUIStore from "./stores/UIStores";

function App() {
  const theme = useTheme();
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const appPage = useUIStore((state) => state.appPage);

  return (
    <Box display="flex" sx={{ height: "100%", width: "100%" }}>
      <CssBaseline />
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
        {appPage === "knowledge base" && (
          <Typography sx={{ pt: 3 }}>KB Page</Typography>
        )}
        {appPage === "settings" && <Typography>Settings Page</Typography>}
      </Box>
    </Box>
  );
}

export default App;
