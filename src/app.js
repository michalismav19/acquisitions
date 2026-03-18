// Setting Up Express application server with the right middleware
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

export default app;
