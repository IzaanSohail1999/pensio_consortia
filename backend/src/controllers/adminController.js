const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.registerAdmin = async (req, res) => {
  const { email, password, username, fullName } = req.body;

  try {
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      username,
      fullName,
      password: hashedPassword,
    });

    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });

  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password'); // exclude password field
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getOneAdmin = async (req, res) => {
  const { username } = req.params;
  try {
    const admin = await Admin.findOne({ username }).select('-password');
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.updateAdmin = async (req, res) => {
  const { username } = req.params;
  const { email, fullName, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email) admin.email = email;
    if (fullName) admin.fullName = fullName;
    if (password) admin.password = password;

    await admin.save();

    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { username } = req.params;

  try {
    const admin = await Admin.findOneAndDelete({ username });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};