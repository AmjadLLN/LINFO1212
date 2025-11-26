// models/User.js — Utilisateur de l'application (client ou admin)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false } // true pour le personnel de l'hôtel
});

module.exports = mongoose.model('User', userSchema);
