import * as React from "react";
import {
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import useUIStore from "../../stores/UIStores";

export default function SideBar() {
  const open = useUIStore((state) => state.drawerOpen);
  const setDrawerClose = useUIStore((state) => state.setDrawerClose);
  const appPage = useUIStore((state) => state.appPage);
  const setAppPage = useUIStore((state) => state.setAppPage);

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          my: 1,
          height: 32,
        }}
      >
        <IconButton onClick={() => setDrawerClose()}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton>
          <AddCircleOutlineIcon onClick={() => setAppPage("chat")} />
        </IconButton>
      </Box>
      <List
        dense
        sx={{
          pt: 0,
          "& .MuiListItemButton-root": {
            minHeight: 32,
            px: 2,
          },
          "& .MuiListItemIcon-root": {
            minWidth: 32,
            color: "inherit",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // icon center
          },
          "& .MuiSvgIcon-root": {
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          "& .MuiListItemText-root": {
            pl: 1,
          },
          "& .MuiListItemText-primary": {
            fontSize: 14,
            width: "100%",
          },
          gap: 0,
        }}
      >
        {[
          { text: "Model", icon: <AutoAwesomeIcon /> },
          { text: "Knowledge Base", icon: <PsychologyIcon /> },
        ].map(({ text, icon }) => (
          <ListItem
            key={text}
            disablePadding
            onClick={() => setAppPage(text.toLowerCase())}
          >
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
}
