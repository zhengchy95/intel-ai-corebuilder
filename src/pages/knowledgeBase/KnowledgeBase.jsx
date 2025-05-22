import * as React from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { basename, dirname, extname } from "@tauri-apps/api/path";
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";

import useAppStore from "../../stores/AppStore";
import useKBStore from "../../stores/KBStore";

const columns = [
  { field: "name", headerName: "Name", flex: 1.5 },
  { field: "type", headerName: "Type", flex: 0.4 },
  { field: "size", headerName: "Size", flex: 0.6, align: "center" },
  {
    field: "status",
    headerName: "Status",
    flex: 0.7,
    renderCell: (params) => (
      <Box
        sx={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          height: "100%",
        }}
      >
        {/* <Typography variant="body2" gutterBottom>
          {params.row.status}
        </Typography> */}
        {params.row.status === "Uploading" && (
          <LinearProgress
            variant="determinate"
            value={params.row.progress}
            sx={{ width: "100%" }}
          />
        )}
        {params.row.status === "Uploaded" && (
          <CheckIcon color="success" fontSize="small" />
        )}

        {params.row.status === "Removing" && (
          <CircularProgress color="error" size="16px" />
        )}
      </Box>
    ),
  },
  { field: "path", headerName: "Path", flex: 2 },
  { field: "added", headerName: "Added Date", flex: 1 },
  { field: "modified", headerName: "Modified Date", flex: 1 },
];

export default function KnowledgeBase() {
  const status = useAppStore((state) => state.status);
  const uploadingFiles = useKBStore((state) => state.uploading);
  const fileExtensions = useKBStore((state) => state.validExtensions);
  const ragFiles = useKBStore((state) => state.rag_files);
  const processPath = useKBStore((state) => state.processPath);
  const uploadFiles = useKBStore((state) => state.uploadFiles);
  const selectedRAGFiles = useKBStore((state) => state.selected_rag_files);

  const handleFileClick = async () => {
    const files = await open({
      title: "Add Files for Core AI",
      multiple: true,
      filters: [
        {
          name: "Supported Documents",
          extensions: fileExtensions,
        },
      ],
    });
    console.debug("Selected files:", files);
    if (files) {
      await processPath(files);
      await uploadFiles();
    }
  };

  const handleFolderClick = async () => {
    const folders = await open({
      title: "Add Folders for Core AI",
      multiple: true,
      directory: true,
    });
    console.debug("Selected folders:", folders);
    if (folders) {
      await processPath(folders);
      await uploadFiles();
    }
  };

  const handleSelectionChange = (selection) => {
    const selectedRowData = Array.from(selection.ids).map((id) =>
      ragFiles.find((row) => row.id === id)
    );
    useKBStore.getState().setSelectedRAGFiles(selectedRowData);
  };

  const handleCancelClick = async () => {
    await useKBStore.getState().cancelUploadFiles();
  };

  const handleFileRemoveClick = async () => {
    await useKBStore.getState().removeRAGFiles();
  };

  React.useEffect(() => {
    let isSubscribed = true;

    // Subscribe to upload file progress event
    let unlistenData;
    const setupDataListener = async () => {
      unlistenData = await listen("upload-progress", async (event) => {
        if (!isSubscribed) return;
        const { current_file_uploading, current_file_progress } = event.payload;
        const fileName = await basename(current_file_uploading);
        useKBStore
          .getState()
          .updateRAGFileProgress(fileName, parseInt(current_file_progress, 10));
      });
    };
    setupDataListener();

    // Subscribe to upload file completion event
    let unlistenCompleted;
    const setupCompletedListener = async () => {
      unlistenCompleted = await listen("upload-completed", async (event) => {
        if (!isSubscribed) return;
        if (event.payload !== "" && event.payload !== "[]") {
          const uploadedFilesList = JSON.parse(event.payload);
          for (const file of uploadedFilesList) {
            const fileName = await basename(file);
            useKBStore.getState().updateRAGFileStatus(fileName, "Uploaded");
            console.debug("Uploaded file:", fileName);
          }
          useKBStore.getState().clearFiles();
        } else if (event.payload.includes("ERROR")) {
          for (const file of useKBStore.getState().files) {
            const fileName = await basename(file);
            useKBStore.getState().updateRAGFileStatus(fileName, "Failed");
          }
        } else if (event.payload === "") {
          for (const file of useKBStore.getState().files) {
            const fileName = await basename(file);
            useKBStore.getState().updateRAGFileStatus(fileName, "Uploaded");
            console.debug("Uploaded previously:", file);
          }
        }
      });
    };
    setupCompletedListener();

    return () => {
      isSubscribed = false;
      if (unlistenData) unlistenData();
      if (unlistenCompleted) unlistenCompleted();
    };
  }, []);

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
      <Box sx={{ display: "flex", mb: 2, flexDirection: "row", gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          disabled={status !== ""}
          onClick={handleFileClick}
          sx={{ width: "120px", borderRadius: "16px" }}
        >
          Add Files
        </Button>
        <Button
          size="small"
          color="primary"
          variant="contained"
          disabled={status !== ""}
          onClick={handleFolderClick}
          sx={{ width: "120px", borderRadius: "16px" }}
        >
          Add Folder
        </Button>
        {uploadingFiles ? (
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={handleCancelClick}
            sx={{ width: "120px", borderRadius: "16px" }}
          >
            Cancel
          </Button>
        ) : (
          <Button
            size="small"
            color="error"
            variant="contained"
            disabled={selectedRAGFiles.length === 0 ? true : false}
            onClick={handleFileRemoveClick}
            sx={{ width: "120px", borderRadius: "16px" }}
          >
            Remove
          </Button>
        )}
      </Box>
      <Box sx={{ width: "100%", height: "100%" }}>
        <DataGrid
          density="compact"
          rows={ragFiles}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 7,
              },
            },
          }}
          pageSizeOptions={[7]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) =>
            handleSelectionChange(newSelection)
          }
          localeText={{
            noRowsLabel:
              "The knowledge base is empty, please add files to enhance your assistant",
          }}
          sx={{
            borderRadius: "16px",
            "& .MuiDataGrid-cell": {
              fontSize: "12px", // Smaller font size for row items
            },
          }}
        />
      </Box>
    </Box>
  );
}
