module.exports = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.ROLE) {
      return res.status(403).json({ message: 'No role in token' });
    }

    const userRole = req.user.ROLE.toLowerCase();

    if (userRole !== allowedRole.toLowerCase()) {
      return res.status(403).json({
        message: 'Forbidden: role mismatch',
        role: userRole
      });
    }

    next();
  };
};
