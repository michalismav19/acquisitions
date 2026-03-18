// Is about  running the server
// Implementing logging
// Everything to know that server running properly
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
