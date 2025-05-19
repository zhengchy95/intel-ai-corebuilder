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
  Menu,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import useUIStore from "../../stores/UIStores";

export default function Appbar() {
  const theme = useTheme();
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const setDrawerOpen = useUIStore((state) => state.setDrawerOpen);

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
          <Box sx={{ display: "flex", minWidth: 120, alignContent: "center" }}>
            <FormControl fullWidth>
              <Select
                labelId="model-select-label"
                id="model-select"
                value={10}
                size="small"
                variant="standard"
                sx={{
                  "&:before, &:after": {
                    borderBottom: "none !important",
                  },
                  "& .MuiSelect-root:before, & .MuiSelect-root:after": {
                    borderBottom: "none !important",
                  },
                  "& .MuiInput-underline:before, & .MuiInput-underline:after": {
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
                <MenuItem value={0} sx={{ fontSize: "14px" }}>
                  None
                </MenuItem>
                <MenuItem value={10} sx={{ fontSize: "14px" }}>
                  Qwen2.5-1.5B-Instruct-int8-ov
                </MenuItem>
                <MenuItem value={20} sx={{ fontSize: "14px" }}>
                  Model 2
                </MenuItem>
                <MenuItem value={30} sx={{ fontSize: "14px" }}>
                  Model 3
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box>
          <Avatar sx={{ width: 28, height: 28, fontSize: "12px" }}>OZ</Avatar>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
