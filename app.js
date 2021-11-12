if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose')
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressErrors');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const apartmentRoutes = require('./routes/apartments');
const reviewRoutes = require('./routes/reviews');
const MongoDBStore = require('connect-mongo')(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/reopolis';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected')
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'atopsecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log('SESSION STORE ERROR')
})

const sessionConfig = {
    store,
    name: 'reo',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [];
const fontSrcUrls = [];
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
                "https://res.cloudinary.com/dnuompa9x/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://cdn-icons.flaticon.com/",
                "https://media.istockphoto.com/",
                "https://www.freepik.com/",
                "https://www.flaticon.com/",
                "https://cdn-icons-png.flaticon.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.navSearch = false;
    if (req.url === "/apartments" && req.method === "GET") {
        res.locals.navSearch = true;
    } else {
        res.locals.navSearch = false;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/apartments', apartmentRoutes);
app.use('/apartments/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

