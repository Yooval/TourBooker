module.exports = fn => { // calling create tour
    return (req, res, next) => {
        fn(req, res, next).catch(next); // we need next to pass the error into it
    };
};