const jwt = require("jsonwebtoken");
const secret = require("../config/secretGenerator.js");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.payload = payload; // Attach payload to req
      next();
    });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

module.exports = { isAuthenticated };
