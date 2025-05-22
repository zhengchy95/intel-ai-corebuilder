import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Select,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import useUIStore from "../../stores/UIStores";

const categories = [
  {
    key: "general",
    label: "General",
    desc: "Configure your general preferences and appearance settings.",
  },
  {
    key: "llm",
    label: "LLM",
    desc: "Manage your LLM settings and configurations.",
  },
  {
    key: "rag",
    label: "RAG",
    desc: "Configure your RAG settings and configurations.",
  },
];

const Settings = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(categories[0].key);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const settingOpen = useUIStore((state) => state.settingOpen);
  const setSettingClose = useUIStore((state) => state.setSettingClose);
  const appTheme = useUIStore((state) => state.appTheme);
  const setAppTheme = useUIStore((state) => state.setAppTheme);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                py: 4,
              }}
            >
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, fontSize: 14 }}
                >
                  Color Mode
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 10 }}
                >
                  Choose how the application appears to you
                </Typography>
              </Box>

              <Select
                variant="outlined"
                value={appTheme}
                onChange={(e) => {
                  // Handle theme change here
                  console.log("Theme changed to:", e.target.value);
                  setAppTheme(e.target.value);
                }}
                sx={{
                  height: 32,
                  fontSize: 12,
                  minWidth: 80,
                  ".MuiSelect-select": {
                    py: 1.5,
                  },
                }}
                size="small"
              >
                <MenuItem value="light" sx={{ fontSize: 12 }}>
                  Light
                </MenuItem>
                <MenuItem value="dark" sx={{ fontSize: 12 }}>
                  Dark
                </MenuItem>
                <MenuItem value="system" sx={{ fontSize: 12 }}>
                  System
                </MenuItem>
              </Select>
            </Box>
          </Box>
        );
      case "llm":
        return <Box>{/* Add llm controls here */}</Box>;
      case "rag":
        return <Box>{/* Add rag controls here */}</Box>;
      default:
        return null;
    }
  };

  return (
    <Modal
      open={settingOpen}
      onClose={() => setSettingClose()}
      aria-labelledby="settings-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "100%" : "min(50vw, 900px)",
          height: isMobile ? "100%" : "min(50vh, 350px)",
          minWidth: "600px",
          minHeight: "480px",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: isMobile ? 0 : 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Header for mobile view */}
        {isMobile && (
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" component="h2">
              Settings
            </Typography>
            <IconButton onClick={() => setSettingClose()} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Sidebar / Navigation */}
        <Box
          sx={{
            width: isMobile ? "100%" : "30%",
            height: isMobile ? "auto" : "100%",
            borderRight: isMobile ? 0 : 1,
            borderBottom: isMobile ? 1 : 0,
            borderColor: "divider",
            bgcolor: "background.default",
            overflow: "auto",
          }}
        >
          <List
            sx={{
              display: isMobile ? "flex" : "block",
              flexDirection: isMobile ? "row" : "column",
              overflowX: isMobile ? "auto" : "visible",
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,.2)",
                borderRadius: "4px",
              },
            }}
          >
            {categories.map((category, index) => (
              <ListItem
                key={category.key}
                selected={activeTab === category.key}
                onClick={() => handleTabChange(category.key)}
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: isMobile ? 0 : "1px solid",
                  borderColor: "divider",
                  minWidth: isMobile ? "120px" : "auto",
                  justifyContent: isMobile ? "center" : "flex-start",
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    borderLeft: isMobile ? 0 : "4px solid",
                    borderBottom: isMobile ? "4px solid" : 0,
                    borderColor: "primary.main",
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={category.label}
                  secondary={category.desc}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: isMobile ? "8px" : "14px",
                        fontWeight:
                          activeTab === category.key ? "bold" : "normal",
                      },
                    },
                    secondary: {
                      sx: {
                        fontSize: isMobile ? "8px" : "10px",
                      },
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            width: isMobile ? "100%" : "70%",
            height: isMobile ? "calc(100% - 120px)" : "100%",
            p: 4,
            overflow: "auto",
            position: "relative",
          }}
        >
          {!isMobile && (
            <IconButton
              onClick={() => setSettingClose()}
              aria-label="close"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
          {renderContent()}
        </Box>
      </Box>
    </Modal>
  );
};

export default Settings;
