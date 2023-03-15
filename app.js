if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}  


const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const expressError = require('./utilities/expresserror');
const methodOverride = require('method-override');
const express = require('express');
const path = require('path');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')
const passport = require('passport')
const localstrategy = require('passport-local')
const user = require('./models/user')
const userRoutes = require('./routes/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoDBStore = require('connect-mongo')(session)
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelpcamp"
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
//const = dbUrl ="mongodb://127.0.0.1:27017/yelpcamp"
///mongodb+srv://levani:levani@yelpcamp.nqajw5l.mongodb.net/?retryWrites=true&w=majority

mongoose.connect(dbUrl)
  .then(() => {
    console.log('MONGO ITS RUNNING');
  })
  .catch((err) => {
    console.log("oh no monginio")
    console.log(err)
  });

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
replaceWith: '_'
}))

const secret = process.env.SECRET ||'thisshouldbeabetterpassword'

const store = new MongoDBStore({
url: dbUrl,
secret,
touchAfter: 24 * 3600
});

store.on('eror', function(e){
console.log('SESSION ERORR', e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    ///secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
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
                "https://res.cloudinary.com/dgcb6jium/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
helmet.crossOriginEmbedderPolicy({
policy: 'credentialless'})
);



app.use(passport.initialize());
app.use(passport.session())
passport.use(new localstrategy(user.authenticate()))

passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())

app.use((req, res, next) => {

  res.locals.currentuser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


app.use('/', userRoutes)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
  res.render('home')
});


app.all('*', (req, res, next) => {
  next(new expressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', { err })
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`)
})