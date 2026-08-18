if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const ExpressError = require('./utilities/expressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const cors = require('cors');

// Modelos (used by passport)
const Usuario = require('./modelos/usuario');

// Conexión a MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/publiclib';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// Trust proxy (required for secure cookies behind Render's reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Serve React build output
app.use(express.static(path.join(__dirname, 'client-dist')));

// CORS configuration for development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
}

const secret = process.env.SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('SECRET environment variable is required in production');
}
const sessionSecret = secret || 'chisme';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: sessionSecret,
  },
});

store.on('error', function (e) {
  console.log('Session store error', e);
});

const sessionSetup = {
  store: store,
  name: 'lp_11_10',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionSetup));

app.use(mongoSanitize());
app.use(helmet());
const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
  'https://cdn.maptiler.com/',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net',
  'https://cdn.maptiler.com/',
];
const connectSrcUrls = ['https://api.maptiler.com/'];
const fontSrcUrls = ['https://cdn.jsdelivr.net/npm/bootstrap-icons/'];

// aca configuramos Helmet con las URL que definimos anteriormente
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dj9swckra/',
        'https://images.unsplash.com/',
        'https://api.maptiler.com/',
        '*.maptiler.com',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(Usuario.authenticate()));
passport.serializeUser(Usuario.serializeUser());
passport.deserializeUser(Usuario.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// API Routes (for React SPA)
const apiBibliotecas = require('./routes/api/bibliotecas');
const apiLibros = require('./routes/api/libros');
const apiUsuarios = require('./routes/api/usuarios');
const apiReviews = require('./routes/api/reviews');
const apiInfo = require('./routes/api/info');
app.use('/api/bibliotecas', apiBibliotecas);
app.use('/api/libros', apiLibros);
app.use('/api', apiUsuarios);
app.use('/api/bibliotecas/:id/reviews', apiReviews);
app.use('/api/info', apiInfo);

app.locals.title = 'Bibliotecas Populares Córdoba';

// Catch-all: serve React app for any non-API route
app.get('*', (req, res, next) => {
  // Skip API routes — they handle their own responses
  if (req.path.startsWith('/api')) return next();
  
  // Serve React SPA for all other routes
  res.sendFile(path.join(__dirname, 'client-dist', 'index.html'));
});

// Middleware para manejar rutas no encontradas
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Manejo de errores
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Error interno del servidor' } = err;
  if (req.path.startsWith('/api')) {
    return res.status(statusCode).json({ error: message, statusCode });
  }
  res.status(statusCode).sendFile(path.join(__dirname, 'client-dist', 'index.html'));
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});