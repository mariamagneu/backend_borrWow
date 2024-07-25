// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const path = require("path");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");

app.use("/api", indexRoutes);
app.use("/auth", authRoutes);

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all route to serve React's index.html for any requests not caught by the above routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
