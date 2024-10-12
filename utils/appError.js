class AppError extends Error { //appError inherites from error
    constructor(message, statusCode) {
        super(message); // super calls the parent contructor(error)

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';// if the status code startwith 4 it must be a fail and otherewise it's an error.
        this.isOperational = true; // all errors we create in this class are operetional error meaning an error that let as now what's wrong for example- user creating tour without a required field. we want to mark this kind of error with this property. if we would like to get all relevant errors it will let us

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;