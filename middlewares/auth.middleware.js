const jwt = require("jsonwebtoken");
const secret = require("../config/secretGenerator.js");
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.tokenPayload = decoded; // Attach the decoded user info to the request object
    next();
  });
};
module.exports = { isAuthenticated };
