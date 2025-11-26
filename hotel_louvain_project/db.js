// db.js — connexion à MongoDB pour Hôtel Louvain

const mongoose = require('mongoose');

const dbURL =
  process.env.NODE_ENV === 'test'
    ? 'mongodb://127.0.0.1:27017/hotel_louvain_test'
    : 'mongodb://127.0.0.1:27017/hotel_louvain';

mongoose
  .connect(dbURL)
  .then(() => {
    console.log(`Connected to MongoDB at ${dbURL}`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

module.exports = mongoose;
