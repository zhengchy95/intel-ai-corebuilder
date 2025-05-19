import * as React from "react";
import {
  Box,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function Model() {
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
          mb: 2,
          width: "60%",
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

      <Card sx={{ width: "85%" }}>
        <CardContent>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ color: "text.primary" }}
          >
            Qwen2.5-1.5B-Instruct-int8-ov
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.primary">
              Model ID:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              OpenVINO/Qwen2.5-1.5B-Instruct-int8-ov
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.primary">
              Model Type:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Text Generation
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.primary">
              Source Endpoint:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hugging Face
            </Typography>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button size="small">Download</Button>
        </CardActions>
      </Card>
    </Box>
  );
}
