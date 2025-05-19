import * as React from "react";
import { Box, Typography, TextField, IconButton, Stack } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LanguageIcon from "@mui/icons-material/Language";

export default function Chat() {
  return (
    <Box
      sx={{
        pt: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          width: "75%",
          p: 2,
          justifyItems: "center",
          WebkitAlignContent: "center",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          What's on your mind today?
        </Typography>
      </Box>

      <Box
        sx={{
          width: "75%",
          borderRadius: 6,
          border: 1,
          borderColor: "grey.300",
          p: 1,
          bgcolor: "background.paper",
          mt: "auto",
        }}
      >
        <Stack>
          <TextField
            fullWidth
            multiline
            placeholder="Type your prompt..."
            variant="standard"
            value=""
            size="small"
            // onChange={handleInputChange}
            sx={{
              px: 1,
              borderRadius: 2,
              "& .MuiInput-underline:before, & .MuiInput-underline:after": {
                borderBottom: "none",
              },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottom: "none",
                fontSize: "0.85rem",
              },
              "& .MuiInputBase-root": {
                bgcolor: "background.paper",
              },
              "& input::placeholder, & textarea::placeholder": {
                fontSize: "0.85rem", // smaller placeholder
                opacity: 0.5,
              },
            }}
          />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              color="primary"
              size="small"
              sx={{ border: 1, borderColor: "grey.300" }}
            >
              <AttachFileIcon sx={{ fontSize: "18px" }} />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              sx={{ backgroundColor: "#0054ae", color: "white" }}
            >
              <SendIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
