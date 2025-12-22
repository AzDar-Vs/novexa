const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password wajib' });
    }

    // dummy user (nanti ganti DB)
    const user = {
      ID_USER: 1,
      EMAIL: email,
      ROLE: 'seller'
    };

    const token = jwt.sign(
      {
        ID_USER: user.ID_USER,
        ROLE: user.ROLE,
        EMAIL: user.EMAIL
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error' });
  }
};

exports.register = async (req, res) => {
  res.json({ message: 'register ok' });
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};
