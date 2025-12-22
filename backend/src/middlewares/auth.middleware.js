const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // 🔥 INI KUNCI TERAKHIR
    req.user = {
      ID_USER: decoded.ID_USER,
      ROLE: decoded.ROLE,
      EMAIL: decoded.EMAIL
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
