import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import {
  Avatar,
  Box,
  Toolbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SettingsIcon from "@mui/icons-material/Settings";

import useAppStore from "../../stores/AppStore";
import useUIStore from "../../stores/UIStores";
import useModelStore from "../../stores/ModelStore";
import useChatStore from "../../stores/ChatStore";

export default function Appbar() {
  const theme = useTheme();
  const username = useAppStore((state) => state.username);
  const status = useAppStore((state) => state.status);
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const setDrawerOpen = useUIStore((state) => state.setDrawerOpen);
  const appPage = useUIStore((state) => state.appPage);
  const models = useModelStore((state) => state.models);

  const selectNewChatSession = () => {
    useUIStore.getState().setAppPage("chat");
    useChatStore.getState().setSelectedSession(null);
  };

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(drawerOpen && {
          width: `calc(100% - 240px)`,
          marginLeft: `240px`,
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[0],
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen()}
            edge="start"
            sx={[drawerOpen && { display: "none" }]}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="open new chat session"
            onClick={() => selectNewChatSession()}
            edge="start"
            sx={[drawerOpen && { display: "none" }]}
          >
            <AddCircleOutlineIcon />
          </IconButton>
          {appPage === "chat" && (
            <>
              <Box
                sx={{ display: "flex", minWidth: 120, alignContent: "center" }}
              >
                <FormControl fullWidth>
                  <Select
                    labelId="model-select-label"
                    id="model-select"
                    value={
                      models.find(
                        (m) =>
                          m.selected &&
                          m.downloaded &&
                          m.model_type === "chat_model"
                      )?.id || -1
                    }
                    disabled={status !== ""}
                    size="small"
                    variant="standard"
                    sx={{
                      "&:before, &:after": {
                        borderBottom: "none !important",
                      },
                      "& .MuiSelect-root:before, & .MuiSelect-root:after": {
                        borderBottom: "none !important",
                      },
                      "& .MuiInput-underline:before, & .MuiInput-underline:after":
                        {
                          borderBottom: "none !important",
                        },
                      "& .MuiSelect-select": {
                        fontSize: "14px", // smaller font size
                        display: "flex",
                        alignItems: "center", // vertical centering
                        minHeight: "32px", // ensure enough height for centering
                        paddingY: "4px",
                      },
                    }}
                  >
                    {models?.filter(
                      (model) =>
                        model.downloaded && model.model_type === "chat_model"
                    ).length === 0 && (
                      <MenuItem value={-1} sx={{ fontSize: "14px" }}>
                        No Model Available
                      </MenuItem>
                    )}

                    {models
                      ?.filter(
                        (model) =>
                          model.downloaded && model.model_type === "chat_model"
                      )
                      .map((model) => (
                        <MenuItem
                          key={model.id}
                          value={model.id}
                          sx={{ fontSize: "14px" }}
                        >
                          {model.full_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
              {status === "Loading Models..." && (
                <CircularProgress color="inherit" size="18px" />
              )}
            </>
          )}
        </Box>
        <Box>
          {/* <Avatar sx={{ width: 28, height: 28, fontSize: "12px" }}>
            {username}
          </Avatar> */}
          <IconButton color="inherit" aria-label="open settings" edge="end">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
