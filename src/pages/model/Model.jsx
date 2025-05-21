import * as React from "react";
import { listen } from "@tauri-apps/api/event";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Box,
  Chip,
  Typography,
  TextField,
  IconButton,
  Stack,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Button,
  Select,
  MenuItem,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

import useModelStore from "../../stores/ModelStore";

export default function Model() {
  const localModelDir = useModelStore((state) => state.localModelDir);
  const models = useModelStore((state) => state.models);
  const downloadModel = useModelStore((state) => state.downloadModel);
  const downloading = useModelStore((state) => state.downloading);
  const downloadProgress = useModelStore((state) => state.downloadProgress);

  React.useEffect(() => {
    const unlisten = listen("download-progress", (event) => {
      const [downloadFile, progressData] = event.payload;
      useModelStore.getState().setDownloadProgress(progressData);
      console.debug("Download progress:", downloadFile, progressData);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleModelSelect = (model) => {
    useModelStore.getState().setSelectedModel(model);
  };

  return (
    <Box
      sx={{
        mt: 3,
        mb: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        height: "95%",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          pb: 2,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={""}
          // onChange={(e) => setQuery(e.target.value)}
          placeholder={"Hugging Face Model ID"}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ px: 1 }}>
                  <IconButton
                    //   onClick={handleSearch}
                    aria-label="search"
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                  <Select
                    size="small"
                    defaultValue="hf"
                    sx={{
                      minWidth: 60,
                      mr: 1,
                      background: "#f5f5f5",
                      "& .MuiSelect-select": {
                        py: 0.5,
                        fontSize: 12,
                      },
                    }}
                    // onChange={handleSourceChange}
                    displayEmpty
                  >
                    <MenuItem value="hf" sx={{ fontSize: 12 }}>
                      Hugging Face
                    </MenuItem>
                    <MenuItem value="msc" sx={{ fontSize: 12 }}>
                      ModelScope CN
                    </MenuItem>
                  </Select>
                </InputAdornment>
              ),
              // endAdornment: query && (
              //   <InputAdornment position="end">
              //     <IconButton aria-label="clear" edge="end">
              //       <ClearIcon />
              //     </IconButton>
              //   </InputAdornment>
              // ),
              sx: {
                fontSize: 12, // input value font size
                "&::placeholder": {
                  fontSize: 12, // placeholder font size
                  opacity: 1,
                },
                py: 0.5,
              },
            },
          }}
          sx={{
            my: 5,
            width: "50%",
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              backgroundColor: "#fff",
              "& fieldset": {
                borderColor: "#ccc",
              },
              "&:hover fieldset": {
                borderColor: "#888",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#007bff",
              },
            },
          }}
        />
      </Box>

      {["chat_model", "embedding_model", "ranker_model"].map((modelType) => (
        <Accordion
          key={modelType}
          defaultExpanded={modelType === "chat_model"}
          sx={{ width: "75%", boxShadow: 0 }}
        >
          <AccordionSummary
            expandIcon={<KeyboardArrowDownIcon />}
            aria-controls={`${modelType}-content`}
            id={`${modelType}-header`}
          >
            <Typography variant="h6">
              {modelType
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .replace(/\s\w/g, (c) => c.toLowerCase())}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {models
              .filter((model) => model.model_type === modelType)
              .sort((a, b) => {
                if (modelType === "chat_model") {
                  // Recommended first
                  if (a.recommended && !b.recommended) return -1;
                  if (!a.recommended && b.recommended) return 1;
                  // Both recommended, sort by accuracy descending
                  if (a.recommended && b.recommended) {
                    return (b.accuracy ?? 0) - (a.accuracy ?? 0);
                  }
                }
                return 0;
              })
              .map((model) => (
                <Card
                  key={model.id}
                  sx={{
                    width: "100%",
                    mb: 2,
                    backgroundColor: model.selected ? "#e0f7fa" : "#fff",
                  }}
                >
                  <CardContent sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body1" gutterBottom>
                        {model.full_name}
                      </Typography>
                      <Box sx={{}}>
                        {model.recommended && (
                          <Chip
                            label="Recommended"
                            size="small"
                            color="success"
                          />
                        )}
                        {model.info.pipeline_tag && (
                          <Chip
                            label={model.info.pipeline_tag}
                            size="small"
                            color="primary"
                          />
                        )}
                        <Chip
                          label={model.model_type}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption">Model ID:</Typography>
                      <Typography variant="caption">{model.info.id}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption">
                        Downloads Count:
                      </Typography>
                      <Typography variant="caption">
                        {model.info.downloads}
                      </Typography>
                      <Typography variant="caption">Likes Count:</Typography>
                      <Typography variant="caption">
                        {model.info.likes}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption">SHA:</Typography>
                      <Typography variant="caption">
                        {model.commit_id}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={() =>
                        openUrl(
                          model.download_link.includes("aibuilder")
                            ? model.model_card
                            : model.download_link
                        )
                      }
                    >
                      Source
                    </Button>
                    <Button
                      size="small"
                      disabled={model.downloaded}
                      onClick={() => downloadModel(model, localModelDir)}
                      loading={downloading === model.full_name}
                      loadingPosition="end"
                    >
                      {model.downloaded ? "Downloaded" : "Download"}
                    </Button>
                    <Button
                      size="small"
                      disabled={!model.downloaded}
                      color="error"
                    >
                      Remove
                    </Button>
                    <Button
                      size="small"
                      disabled={model.selected || !model.downloaded}
                      onClick={() => {
                        handleModelSelect(model);
                      }}
                    >
                      {model.selected && model.downloaded
                        ? "Selected"
                        : "Select"}
                    </Button>
                  </CardActions>

                  {downloading === model.full_name && (
                    <LinearProgress
                      variant="determinate"
                      value={downloadProgress}
                    />
                  )}
                </Card>
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
