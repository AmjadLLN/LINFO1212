# Hôtel Louvain – Application de Réservation  
Projet Final – LINFO1212 (Groupe PF04)

## 📌 Description du projet
Cette application web permet à un utilisateur de consulter les chambres disponibles d’un hôtel, d’afficher les détails de chaque chambre, de filtrer l’affichage, puis d’effectuer une réservation.  
Un système d’authentification est intégré afin de permettre la création de compte, la connexion, ainsi que l’accès à l’historique des réservations.

Le projet repose sur les technologies abordées dans le cadre du cours LINFO1212 :
- Node.js (Express)
- MongoDB (Mongoose)
- EJS (templates dynamiques)
- Sessions utilisateur
- Tests avec Jest et Supertest

---

## 🛠 Technologies utilisées

- **Node.js + Express** — Serveur HTTP, logique métier et gestion des routes
- **MongoDB + Mongoose** — Base de données et modèles
- **EJS** — Génération de pages HTML dynamiques
- **express-session** — Gestion des sessions utilisateur
- **Jest & Supertest** — Tests unitaires et tests d’intégration
- **CSS** — Mise en forme du site

---

## 📁 Structure du projet

```
hotel_louvain_project/
│
├── models/              # Modèles Mongoose (User, Room, Reservation)
├── views/               # Vues EJS (HTML dynamique)
├── public/              # Fichiers statatiques (CSS, images)
├── features/            # Fichiers Gherkin (spécifications utilisateur)
├── tests/               # Tests Jest et Supertest
│
├── server.js            # Serveur Express
├── db.js                # Connexion à MongoDB
├── seed_rooms.js        # Script d’initialisation des chambres
├── package.json         # Dépendances et scripts
```

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone <URL_DU_REPO>
cd hotel_louvain_project
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Démarrer MongoDB  
Assurez-vous que MongoDB tourne localement :

```
mongodb://localhost:27017
```

---

## 🛑 Initialisation de la base de données

Avant de lancer l’application, insérez les chambres de test :

```bash
node seed_rooms.js
```

---

## ▶️ Lancer l’application

```bash
node server.js
```

Puis visiter :

```
http://localhost:3000
```

---

## 🧪 Lancer les tests

```bash
npm test
```

Les tests utilisent la base :

```
hotel_louvain_test
```

Ils couvrent les modèles, la validation et les routes principales.

---

## 📌 Fonctionnalités principales

- Création et connexion d’un compte  
- Consultation et filtrage des chambres  
- Page détaillée d’une chambre  
- Réservation (dates + invités)  
- Historique des réservations  
- Interface simple via EJS et CSS  

---

## 📦 Scripts utiles

| Commande | Description |
|---------|-------------|
| `npm install` | Installe les dépendances |
| `node seed_rooms.js` | Initialise la base |
| `node server.js` | Lance le serveur |
| `npm test` | Exécute les tests |

---

