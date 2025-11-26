// models/Room.js — Chambre d'hôtel

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },        // ex: "Chambre 101"
  type: {
    type: String,
    enum: ['single', 'double', 'suite'],
    required: true
  },
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, required: true },    // nombre de personnes max
  description: String,
  amenities: [String],                           // ex: ["WiFi", "TV", "Petit-déjeuner"]
  imageUrl: String,
  isActive: { type: Boolean, default: true }     // si la chambre est proposée ou pas
});

module.exports = mongoose.model('Room', roomSchema);
