if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/expressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

// Modelos
const Biblioteca = require('./modelos/biblioteca');
const Review = require('./modelos/reviews');
const Usuario = require('./modelos/usuario');
const Libro = require('./modelos/libro');

// Conexión a MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/publiclib';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Configuración de EJS
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
const secret = process.env.SECRET || 'chisme';


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});


store.on('error', function (e) {
    console.log('Session store error', e)
})


const sessionSetup = {
    store: store,
    name: 'lp_11_10', //nombre del coockie de sessionId, para esconderlo por seguridad
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};
app.use(session(sessionSetup));

app.use(mongoSanitize());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [
    'https://cdn.jsdelivr.net/npm/bootstrap-icons/'
];


// aca configuramos Helmet con las URL que definimos anteriormente
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dj9swckra/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
                "*.maptiler.com"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(Usuario.authenticate()));
passport.serializeUser(Usuario.serializeUser());
passport.deserializeUser(Usuario.deserializeUser());

// Middleware para mensajes flash
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Rutas
const bibliotecas = require('./routes/bibliotecas');
const reviews = require('./routes/reviews');
const usuarios = require('./routes/usuarios');
const libros = require('./routes/libros');
const info = require('./routes/info')
app.use('/bibliotecas', bibliotecas);
app.use('/bibliotecas/:id/reviews', reviews);
app.use('/', usuarios);
//app.use('/bibliotecas/:id/libros', libros); // Rutas específicas para libros de cada biblioteca

// Ruta para el catálogo general de libros
app.use('/libros', libros); // Esta podría ser la ruta general para acceder a todos los libros
app.use('/info', info);

app.locals.title = 'Bibliotecas Populares Córdoba';  // Establece un valor por defecto global para todas las vistas 

app.get('/', (req, res) => {
    res.render('home', { title: 'Bibliotecas Populares Córdoba' });
});

// Middleware para manejar rutas no encontradas
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Manejo de errores
app.use((err, req, res, next) => {
    // req.flash('error', 'Se encontraron datos erróneos en la búsqueda');
    // return res.redirect('/bibliotecas');
    const { statusCode = 500 } = err;
    res.status(statusCode).render('error',{ err });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('App running on port 3000');
});




