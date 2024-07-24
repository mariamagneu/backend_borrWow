const jwt = require("jsonwebtoken");
const secret = process.env.TOKEN_SECRET; // Fetch secret from environment variables

const isAuthenticated = (req, res, next) => {
  // Debug log (remove or mask before production)
  // console.log("TOKEN_SECRET:", secret);

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

  try {
    // Verify the token and decode payload
    const payload = jwt.verify(token, secret);

    // Attach payload to request object
    req.tokenPayload = payload;

    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    // Handle errors related to token
    console.error("Token verification failed:", error.message); // Debug log
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { isAuthenticated };
