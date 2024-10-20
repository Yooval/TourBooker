class AppError extends Error { //appError inherites from error
    constructor(message, statusCode) {
        super(message); // super calls the parent contructor(error)

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // all errors we create in this class are operetional error.

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
