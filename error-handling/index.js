const path = require("path");

module.exports = (app) => {
  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    if (req.accepts('html')) {
      res.status(404).sendFile(path.join(__dirname, 'build', 'index.html'));
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
  });
};
