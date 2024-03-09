const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Missing authorization header' });
  }

  // Check if header format is valid (Bearer <token>)
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Unauthorized: Invalid authorization format' });
  }

  const token = parts[1];

  // Verify the JWT token
  try {
    const secret = process.env.JWT_SECRET; // Replace with your secret key
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach decoded user information to the request
    next(); // Allow request to proceed to the next middleware/route
  } catch (err) {
    // Handle errors (e.g., invalid signature, expired token)
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authorize;
