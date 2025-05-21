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
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";

import useUIStore from "../../stores/UIStores";
import useChatStore from "../../stores/ChatStore";
import { isToday, isPast7Days, isOlder } from "../../utils/dateCheck";

export default function SideBar() {
  const open = useUIStore((state) => state.drawerOpen);
  const setDrawerClose = useUIStore((state) => state.setDrawerClose);
  const setAppPage = useUIStore((state) => state.setAppPage);
  const sessions = useChatStore((state) => state.sessions);
  const selectedSession = useChatStore((state) => state.selectedSession);
  const [hoveredSession, setHoveredSession] = React.useState(null);

  const selectChatSession = (session) => {
    setAppPage("chat");
    useChatStore.getState().setSelectedSession(session.sid);
  };

  const selectNewChatSession = () => {
    setAppPage("chat");
    useChatStore.getState().setSelectedSession(null);
  };

  const removeChatSession = (sid) => {
    useChatStore.getState().removeSession(sid);
  };

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
        <IconButton onClick={() => selectNewChatSession()}>
          <AddCircleOutlineIcon />
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

      {sessions.filter((s) => isToday(s.date)).length > 0 && (
        <>
          <Typography
            variant="overline"
            sx={{ fontSize: "10px", pl: 3, mt: 3, mb: 0 }}
          >
            <b>Today</b>
          </Typography>
          <List
            dense
            sx={{
              pt: 0,
              "& .MuiListItemButton-root": {
                minHeight: 12,
                px: 3,
                py: 0,
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
                fontSize: 13,
                width: "100%",
              },
              gap: 0,
            }}
          >
            {sessions
              .filter((s) => isToday(s.date))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((session) => (
                <ListItem
                  key={session.sid}
                  disablePadding
                  onMouseEnter={() => setHoveredSession(session.sid)}
                  onMouseLeave={() => setHoveredSession(null)}
                  secondaryAction={
                    hoveredSession === session.sid && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        color="error"
                        onClick={() => removeChatSession(session.sid)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemButton
                    selected={session.sid === selectedSession}
                    onClick={() => selectChatSession(session)}
                  >
                    <ListItemText primary={session.name} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </>
      )}

      {sessions.filter((s) => isPast7Days(s.date)).length > 0 && (
        <>
          <Typography
            variant="overline"
            sx={{ fontSize: "10px", pl: 3, mt: 1, mb: 0 }}
          >
            <b>Past 7 Days</b>
          </Typography>
          <List
            dense
            sx={{
              pt: 0,
              "& .MuiListItemButton-root": {
                minHeight: 32,
                px: 3,
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
                fontSize: 13,
                width: "100%",
              },
              gap: 0,
            }}
          >
            {sessions
              .filter((s) => isPast7Days(s.date))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((session) => (
                <ListItem
                  key={session.sid}
                  disablePadding
                  onMouseEnter={() => setHoveredSession(session.sid)}
                  onMouseLeave={() => setHoveredSession(null)}
                  secondaryAction={
                    hoveredSession === session.sid && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        color="error"
                        onClick={() => removeChatSession(session.sid)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemButton
                    selected={session.sid === selectedSession}
                    onClick={() => selectChatSession(session)}
                  >
                    <ListItemText primary={session.name} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </>
      )}

      {sessions.filter((s) => isOlder(s.date)).length > 0 && (
        <>
          <Typography
            variant="overline"
            sx={{ fontSize: "10px", pl: 3, mt: 3, mb: 0 }}
          >
            <b>Older Than 7 Days</b>
          </Typography>
          <List
            dense
            sx={{
              pt: 0,
              "& .MuiListItemButton-root": {
                minHeight: 32,
                px: 3,
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
                fontSize: 13,
                width: "100%",
              },
              gap: 0,
            }}
          >
            {sessions
              .filter((s) => isOlder(s.date))
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((session) => (
                <ListItem
                  key={session.sid}
                  disablePadding
                  onMouseEnter={() => setHoveredSession(session.sid)}
                  onMouseLeave={() => setHoveredSession(null)}
                  secondaryAction={
                    hoveredSession === session.sid && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        color="error"
                        onClick={() => removeChatSession(session.sid)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemButton
                    selected={session.sid === selectedSession}
                    onClick={() => selectChatSession(session)}
                  >
                    <ListItemText primary={session.name} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </>
      )}
    </Drawer>
  );
}
