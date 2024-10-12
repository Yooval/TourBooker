const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes'); // get what exported in tourRoutes
const userRouter = require('./routes/userRoutes'); // get what exported in userRoutes
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');


const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))
//1. GLOBAL middlewears. everythimg that stands between req and res in middlewear.
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
//set security http headers
// Set security HTTP Headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                'worker-src': ['blob:'],
                'child-src': ['blob:', 'https://js.stripe.com/'],
                'img-src': ["'self'", 'data: image/webp'],
                'script-src': [
                    "'self'",
                    'https://api.mapbox.com',
                    'https://cdnjs.cloudflare.com',
                    'https://js.stripe.com/v3/',
                    "'unsafe-inline'",
                ],
                'connect-src': [
                    "'self'",
                    'ws://localhost:*',
                    'ws://127.0.0.1:*',
                    'http://127.0.0.1:*',
                    'http://localhost:*',
                    'https://*.tiles.mapbox.com',
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                ],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

//development logging
if (process.env.NODE_ENV === 'development') { //make sure that process.env.NODE_ENV is like we defined in config.env only when we are still in development. means this stage happen only when development stage.
    app.use(morgan('dev')); // dev is just the style of what will be printed how it looks(middlweare 1) affect on res so middlewear.
}

// limit requests from the same api
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requsets from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from the body into req.body. 10kb max data can be sent
app.use(express.json({ limit: '10kb' })); //(middlweare 2). we need this. this is a midlewear for the post func. it's stands between the request and response.the post request requrst some data. and this middlewear ensure we get the data before procesing the get request
//app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data sanitization againt noSQL query injection
app.use(mongoSanitize());// mongoSanitize() is a func that we will call and it will return a middleware function which we can then use. and this process wiil prevent those noSQL query injection.

// Data sanitization againt XSS(Cross-Site Scripting) attacks.
app.use(xss()); // xss() will clean any user input from all malicious html code.

//prevent paraneters pollution for examle sort=duration&sort=price is polluted because doesnt know how to sort with 2 parameters(it's not inner sort) so now only last sort will be relevant- price here.
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'] // in whitelist there are all the fields that allow duplicates. we can get all tours with duration 9/5.
}));


// just test middleware
app.use((req, res, next) => { //in a midlewear we will always have req and res cause we are between them here we also have next as 3thrd arguement.
    req.requestTime = new Date().toISOString;
    console.log(req.cookies);
    //console.log(x);
    next(); // we use next to move on. do the next thing. send back the response to the client.
});



// route handlers



/*app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);*/




//3. routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // map tour requests. all this app.use is a middlewear because the raute stands between the req and res.
app.use('/api/v1/users', userRouter); // map user requests.
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => { //if we got here we didnt catch the url so the url is bad
    //const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    //err.status = 'fail';
    //err.statusCode = 404;
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // when we pass any var in the next it's automaticly recignized as an error(the var) and then it's will skip all other middleware in the midllewares stack and will sent this error to the global error handling middleware and there it will be executed.
});

app.use(globalErrorHandler);

//4. start server

module.exports = app; // export because server.js needs app

