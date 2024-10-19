// it's here because we gonna return controller
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => { 
    const doc = await Model.findByIdAndDelete(req.params.id); 
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))//will go straight to error handling middleware
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {//we can do it right away with mongoose. we update an i item by it id(req.params.id).
        new: true, // the new updated document(object) is the one we will return.
        runValidators: true // validate the new document.
    });

    if (!doc) {
        return next(new AppError('No doc found with that ID', 404))//will go straight to error handling middleware
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc // when the property name has the same name as the value we can write "tour" instead of "tour:tour"
        }
    });

});

exports.createOne = Model => catchAsync(async (req, res, next) => { //create loop is the async func
    const doc = await Model.create(req.body); //new tour is the promise. async func wait till create ends.
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });


exports.getAll = Model => catchAsync(async (req, res, next) => { // we need to use many exports because we export a lot of things(funcs) not only one object/func. as we can see there is no any additional definition in this file execpt all funcs.
    // to allow for nested Get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; // if there is actualyy a tour id likr in req give it's reviews else empty

    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query; // before executing this we wiil do the pre-query middleware
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});
