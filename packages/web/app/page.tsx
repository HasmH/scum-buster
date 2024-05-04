import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Scum Buster</h1>
      <TextField />
    </Box>
  );
}
