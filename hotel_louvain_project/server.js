// server.js — Application Hôtel Louvain

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('./models/User');
const Room = require('./models/Room');
const Reservation = require('./models/Reservation');
require('./db');

const app = express();
const PORT = 3000;

// ====== Middleware & config ======
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'hotel-louvain-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/hotel_louvain'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 // 2 heures
    }
  })
);

// rendre user dispo dans les vues
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// middlewares de protection
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Accès refusé');
  }
  next();
}

// ====== Authentification ======

// Page d'inscription
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Traitement d'inscription
app.post('/register', async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password || !confirmPassword) {
    return res.render('register', { error: 'Veuillez remplir tous les champs.' });
  }
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Les mots de passe ne correspondent pas.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('register', { error: 'Un compte existe déjà avec cet email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, passwordHash });

    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin
    };

    res.redirect('/');
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.render('register', { error: 'Erreur serveur.' });
  }
});

// Page de login
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Traitement login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Email ou mot de passe incorrect.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.render('login', { error: 'Email ou mot de passe incorrect.' });
    }

    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin
    };

    res.redirect('/');
  } catch (err) {
    console.error('Erreur login:', err);
    res.render('login', { error: 'Erreur serveur.' });
  }
});

// Déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ====== Pages publiques ======

// Page d'accueil : aperçu des chambres + promos
app.get('/', async (req, res) => {
  try {
    // quelques chambres pour la page d'accueil
    const rooms = await Room.find({ isActive: true }).limit(6);
    res.render('index', { rooms });
  } catch (err) {
    console.error('Erreur chargement accueil:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Recherche avec filtres (type, prix min/max)
app.get('/rooms', async (req, res) => {
  const { type, minPrice, maxPrice } = req.query;

  const filter = { isActive: true };

  if (type && type !== 'all') {
    filter.type = type;
  }
  if (minPrice) {
    filter.pricePerNight = { ...(filter.pricePerNight || {}), $gte: Number(minPrice) };
  }
  if (maxPrice) {
    filter.pricePerNight = { ...(filter.pricePerNight || {}), $lte: Number(maxPrice) };
  }

  try {
    const rooms = await Room.find(filter).sort({ pricePerNight: 1 });
    res.render('rooms', {
      rooms,
      filters: { type: type || 'all', minPrice: minPrice || '', maxPrice: maxPrice || '' }
    });
  } catch (err) {
    console.error('Erreur recherche chambres:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Détails d'une chambre + formulaire de réservation
app.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive) return res.status(404).send('Chambre introuvable');

    res.render('room_detail', { room, error: null });
  } catch (err) {
    console.error('Erreur chargement chambre:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Création d'une réservation
app.post('/rooms/:id/reserve', requireAuth, async (req, res) => {
  const { checkIn, checkOut, guests } = req.body;

  if (!checkIn || !checkOut || !guests) {
    const room = await Room.findById(req.params.id);
    return res.render('room_detail', {
      room,
      error: 'Veuillez remplir toutes les informations de réservation.'
    });
  }

  try {
    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive) {
      return res.status(404).send('Chambre introuvable');
    }

    // (Simplification: on ne vérifie pas ici les conflits de réservation)
    await Reservation.create({
      userId: req.session.user._id,
      roomId: room._id,
      checkIn,
      checkOut,
      guests: Number(guests)
    });

    res.redirect('/my-reservations');
  } catch (err) {
    console.error('Erreur réservation:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Historique des réservations de l'utilisateur
app.get('/my-reservations', requireAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.session.user._id })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.render('my_reservations', { reservations });
  } catch (err) {
    console.error('Erreur historique réservations:', err);
    res.status(500).send('Erreur serveur');
  }
});

// ====== Interface administrateur ======

// Dashboard principal
app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin_index');
});

// Gestion des chambres
app.get('/admin/rooms', requireAdmin, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.render('admin_rooms', { rooms });
  } catch (err) {
    console.error('Erreur admin chambres:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/admin/rooms', requireAdmin, async (req, res) => {
  const { name, type, pricePerNight, capacity, description, amenities, imageUrl } = req.body;

  try {
    await Room.create({
      name,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      description,
      amenities: amenities
        ? amenities.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      imageUrl
    });

    res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Erreur création chambre:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/admin/rooms/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).send('Chambre introuvable');

    room.isActive = !room.isActive;
    await room.save();

    res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Erreur mise à jour chambre:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/admin/rooms/:id/delete', requireAdmin, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Erreur suppression chambre:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Gestion des réservations
app.get('/admin/reservations', requireAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('userId')
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.render('admin_reservations', { reservations });
  } catch (err) {
    console.error('Erreur admin réservations:', err);
    res.status(500).send('Erreur serveur');
  }
});

// ====== Lancement serveur ======
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
