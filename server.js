//its good to have anything related to express in one file(app.js) and anything related to the swrver in other file(here) so this file will be
// our starting file whre everything starts and here we ware listening to our server

//in this file we will just connect to db. everythong about the models themself will in one of the files of the models folder.
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtExeption', err => { // for example we added console.log(x) at line 21 in app.js
    console.log('UNCAUGHT EXEPTION!  shutting down...');
    console.log(err.name, err.message);
    process.exit(1);// it's an error we cant fix do exit prog (right away!)
});

dotenv.config({ path: './config.env' });
const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
//const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DATABASE>', process.env.DATABASE_NAME);

//console.log(process.env);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() =>
    console.log('DB connection successful'));


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', err => { // for example we changes the password in config.env
    console.log(err.name, err.message);
    console.log('UNHANDLER REJECTION!  shutting down...');
    server.close(() => {// finish open/hanging requests
        process.exit(1);// it's an error we cant fix do exit prog
    })
});


