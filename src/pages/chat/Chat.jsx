import * as React from "react";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Stack,
  Slide,
  Tooltip,
  Badge,
  Skeleton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import StopIcon from "@mui/icons-material/Stop";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import SummarizeIcon from "@mui/icons-material/Summarize";
import TableViewIcon from "@mui/icons-material/TableView";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";

import useAppStore from "../../stores/AppStore";
import useChatStore from "../../stores/ChatStore";
import useModelStore from "../../stores/ModelStore";

export default function Chat() {
  const status = useAppStore((state) => state.status);
  const models = useModelStore((state) => state.models);
  const selectedSession = useChatStore((state) => state.selectedSession);
  const sessions = useChatStore((state) => state.sessions);
  const prompt = useChatStore((state) => state.prompt);
  const response = useChatStore((state) => state.response);
  const thinking = useChatStore((state) => state.thinking);
  const attachments = useChatStore((state) => state.attachments);
  const attachmentsExtensions = useChatStore(
    (state) => state.attachmentsExtensions
  );
  const selectedQuery = useChatStore((state) => state.query);

  const {
    setPrompt,
    sendPrompt,
    setResponse,
    clearResponse,
    stopResponse,
    createSession,
    setThinking,
    updateLastChatMessage,
    addAttachment,
    removeAttachment,
    clearAttachments,
    setQuery,
  } = useChatStore();

  React.useEffect(() => {
    if (attachments.length === 0) {
      setQuery("");
    }
  }, [attachments]);

  React.useEffect(() => {
    let isSubscribed = true;
    let unlistenData;
    let unlistenCompleted;

    const setupDataListener = async () => {
      unlistenData = await listen("new_message", (event) => {
        if (!isSubscribed) {
          return;
        }
        setResponse(event.payload);
      });
    };

    const setupCompletedListener = async () => {
      unlistenCompleted = await listen("stream-completed", () => {
        if (!isSubscribed) {
          return;
        }
        updateLastChatMessage(useChatStore.getState().response);
        clearResponse();
        setThinking(false);
      });
    };

    setupDataListener();
    setupCompletedListener();
    clearResponse();

    return () => {
      isSubscribed = false;
      if (unlistenData) unlistenData();
      if (unlistenCompleted) unlistenCompleted();
    };
  }, []);

  const handleSendPrompt = () => {
    if (prompt.trim() !== "") {
      if (selectedSession === null) createSession();
      sendPrompt(prompt);
      setPrompt("");
      clearAttachments();
      setQuery("");
      setThinking(true);
    }
  };

  const handleAttachmentClick = async (query) => {
    clearAttachments();
    const files = await open({
      title: "Add Files for Current Chat",
      multiple: true,
      filters: [
        {
          name: "Supported Documents",
          extensions: attachmentsExtensions,
        },
      ],
    });
    console.debug("Selected files:", files);
    if (files) {
      setQuery(query === "gen_image" ? "image" : query);
      addAttachment(files);
    }
  };

  return (
    <Box
      sx={{
        pt: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          flexGrow: selectedSession === null ? 0 : 1,
          minWidth: "360px",
          maxWidth: "600px",
          width: "100%",
          p: 2,
          mb: 3,
          justifyItems: "center",
          overflowY: "auto",
          WebkitAlignContent:
            selectedSession !== null ? "flex-start" : "center",
        }}
      >
        {selectedSession !== null ? (
          <>
            {sessions
              .find((session) => session.sid === selectedSession)
              .messages.map((message, index, messages) =>
                message.sender === "assistant" ? (
                  <>
                    {thinking &&
                    index === messages.length - 1 &&
                    response === "" ? (
                      <Box sx={{ width: "100%", justifyContent: "flex-start" }}>
                        <Skeleton
                          variant="rounded"
                          animation="wave"
                          width={"50%"}
                          height={30}
                        />
                      </Box>
                    ) : (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "flex-start",
                          borderRadius: 2,
                          p: 1,
                          pl: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "12px", whiteSpace: "pre-wrap" }}
                          dangerouslySetInnerHTML={{
                            __html: (index === messages.length - 1 &&
                            response !== ""
                              ? response
                              : message.text
                            )
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;")
                              .replace(/(\*\*)(.*?)\1/g, "<b>$2</b>")
                              .replace(/\n/g, "<br/>"),
                          }}
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyItems: "center",
                      width: "100%",
                      alignItems: "flex-end",
                      mb: 2,
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    {JSON.parse(message.attached_files).length > 0 &&
                      JSON.parse(message.attached_files).map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            p: 1,
                            bgcolor: "grey.200",
                          }}
                        >
                          <AttachFileIcon
                            sx={{ fontSize: "14px", color: "grey.600" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ ml: 1, fontSize: "10px" }}
                          >
                            {file}
                          </Typography>
                        </Box>
                      ))}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        p: 1,
                        bgcolor: "lightGrey",
                        borderRadius: 2,
                        color: "black",
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Box>
                )
              )}
          </>
        ) : (
          <Typography variant="h5">What's on your mind today?</Typography>
        )}
      </Box>

      <Slide
        in={true}
        direction={selectedSession === null ? "down" : "up"}
        appear={false}
        timeout={400}
      >
        <Box
          sx={{
            minWidth: "360px",
            maxWidth: "600px",
            width: "100%",
            borderRadius: 6,
            border: 0.1,
            borderColor: "divider",
            p: 1,
            bgcolor: "background.paper",
            mt: selectedSession === null ? 0 : "auto",
            transition: "margin-top 0.4s",
          }}
        >
          {attachments.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                my: 1,
                ml: 1,
              }}
            >
              {attachments.map((attachment, index) => (
                <Tooltip key={index} title={attachment} placement="top" arrow>
                  <Badge
                    badgeContent={
                      <IconButton
                        size="small"
                        sx={{
                          fontSize: "8px",
                          backgroundColor: "red",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#ff7961",
                          },
                        }}
                        onClick={() => {
                          removeAttachment(attachment);
                        }}
                      >
                        <CloseIcon fontSize="8px" />
                      </IconButton>
                    }
                    onClick={() => {
                      removeAttachment(attachment);
                    }}
                  >
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        p: 1,
                        height: "40px",
                        width: "40px",
                        bgcolor: "grey.200",
                      }}
                    >
                      <InsertDriveFileIcon
                        sx={{ fontSize: "18px", color: "grey.600" }}
                      />
                    </Box>
                  </Badge>
                </Tooltip>
              ))}
            </Box>
          )}
          <Stack>
            <TextField
              fullWidth
              multiline
              placeholder="Type your prompt..."
              variant="standard"
              value={prompt}
              size="small"
              disabled={status !== ""}
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              sx={{
                px: 1,
                borderRadius: 2,
                "& .MuiInput-underline:before, & .MuiInput-underline:after": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline.Mui-disabled:before": {
                  borderBottom: "none !important",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                  fontSize: "12px",
                },
                "& .MuiInputBase-root": {
                  bgcolor: "background.paper",
                  fontSize: "13px",
                },
                "& input::placeholder, & textarea::placeholder": {
                  fontSize: "13px",
                  opacity: 0.5,
                },
              }}
            />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                {["summarize", "table", "image", "gen_image", "resume"].map(
                  (query) => (
                    <Button
                      key={query}
                      disabled={
                        status !== ""
                          ? true
                          : query === "image" || query === "gen_image"
                          ? models.find(
                              (m) =>
                                m.selected &&
                                m.model_type === "chat_model" &&
                                m.info.pipeline_tag === "image-text-to-text"
                            )
                            ? false
                            : true
                          : false
                      }
                      variant={
                        selectedQuery === query ? "contained" : "outlined"
                      }
                      startIcon={
                        query === "summarize" ? (
                          <SummarizeIcon
                            sx={{ fontSize: "14px !important", mr: -0.5 }}
                          />
                        ) : query === "table" ? (
                          <TableViewIcon
                            sx={{ fontSize: "14px !important", mr: -0.5 }}
                          />
                        ) : query === "image" ? (
                          <ImageIcon
                            sx={{ fontSize: "14px !important", mr: -0.5 }}
                          />
                        ) : (
                          <ArticleIcon
                            sx={{ fontSize: "14px !important", mr: -0.5 }}
                          />
                        )
                      }
                      sx={{
                        fontSize: "10px",
                        borderRadius: 12,
                        boxShadow: 0,
                        px: 1,
                        ml: 1,
                      }}
                      onClick={() => {
                        handleAttachmentClick(query);
                      }}
                    >
                      {query}
                    </Button>
                  )
                )}
              </Box>

              <IconButton
                size="small"
                sx={{
                  backgroundColor: thinking ? "red" : "#0054ae",
                  color: "white",
                  "&:hover": {
                    backgroundColor: thinking ? "#ff7961" : "#1976d2", // lighter red or blue
                  },
                }}
                disabled={status !== ""}
                onClick={() => {
                  thinking ? stopResponse() : handleSendPrompt();
                }}
              >
                {thinking ? (
                  <StopIcon sx={{ fontSize: "18px" }} />
                ) : (
                  <SendIcon sx={{ fontSize: "18px" }} />
                )}
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </Slide>
    </Box>
  );
}
