require("dotenv").config();
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Hacktober backend API" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
