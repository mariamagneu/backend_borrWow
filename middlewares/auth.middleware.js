const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  console.log("TOKEN_SECRET:", process.env.TOKEN_SECRET); // Debug log

  try {
    // Check if Authorization header is provided
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Extract the token from Authorization header
    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Verify the token and decode payload
    const payload = jwt.verify(token, secret);

    // Attach payload to request object
    req.tokenPayload = payload;

    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    // Handle errors related to token
    res.status(401).json({ message: "Token not provided or not valid" });
  }
};

module.exports = { isAuthenticated };
