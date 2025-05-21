import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Box, Typography } from "@mui/material";
import useAppStore from "../../stores/AppStore";

function StatusBar() {
  const status = useAppStore((state) => state.status);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "14px",
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        px: 2,
        zIndex: 1300,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "10px" }}
      >
        {status}
      </Typography>
    </Box>
  );
}

export default StatusBar;
