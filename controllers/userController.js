const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


const filterObj = (obj, ...allowedFields) => { 
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]; // in newOnj is all permitted fields
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};


exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) create an error if user tries to update the passwors(not doing it here)
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update, please use updateMyPassword', 400)
        );
    }
    // 2) Filtered out unwanted fields names that arr not allowed to be updated.

    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, //return new doc
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false }); 

    res.status(204).json({
        status: 'success',
        data: null
    });
});


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'Please use sign up instead.'
    });
};
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// do not update passwords with it!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
