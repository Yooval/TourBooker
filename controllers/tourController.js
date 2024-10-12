//const { query } = require('express');
//const { request } = require('../app');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => { // set the properties for getting those 5. this qury will reach to get all tours with this query ready to return this 5. and it will be like oridinary query there.
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });//select let us specify which fields we want(dont have it here)
// how this all work? create tour submitted in postmanand routed to create tour func which operate catchAsync(because we want to hndle errors there)
//then, new tour created in create tour func if suceed it all handled in create tour(implementation in database and cetera) if faild handled in catchAsync
exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
//exports.deleteTour = catchAsync(async (req, res, next) => {
//    const tour = await Tour.findByIdAndDelete(req.params.id); // we dont put it is in a var because we dont send anything back to client.
//    if (!tour) {
//        return next(new AppError('No tour found with that ID', 404))//will go straight to error handling middleware
//    }

//    res.status(204).json({
//        status: 'success',
//        data: null
//    });
//});

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } } //all tours with rating average >=4.5. gte(and operators like it) is mongbodb operator
        },
        {
            $group: {
                _id: '$difficulty', // _id means what do you wanna group by?(price? rating?) now we want to group all tours so the null.
                numTours: { $sum: 1 }, // we want to sum all tours so for each document(obj) add 1.
                numRatings: { $sum: '$ratingsQuantity' },// ratingsquantity is a field in each tour show how many ratings this tour has. so for each tour we add to sum this field val.
                avgRating: { $avg: '$ratingsAverage' }, //avg is mongodb
                avgPrice: { $avg: '$price' }, // price is the var
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }// 1 for accending
        },
        //{
        //   $match: { _id: { $ne: 'easy' } }
        //}
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });

});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;//2021
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`) //between the first and last day of 2021
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' }, //group by months, we need startDates becuase those months we will goup by will be taken from there.
                numTourStarts: { $sum: 1 }, //for every document(obj) in a month add 1 to the variable of this month.
                tours: { $push: '$name' } // show by month/ how much in march?february?
            }
        },
        {
            $addFields: { month: '$_id' } // add at the end month for exampli if _id=4 its adding month=4 at the end.
        },
        {
            $project: {
                _id: 0 // wont show id
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12 // give only 12 months- its everything
        }

    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });

});
//router.route('/tours-within/:distance/center/:lat lng/unit/:unit', tourController.getToursWithin);// distance- distance from whre i am. center/:lat lng - qordinates of center(whre i am). unit: km/miles cetera
// example: tours-within/233/center/-40,45/unit/mi just to know what data should look like.
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // get the radius in miles/km depends of what we defined.
    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }


    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    }); //searching for center, start points

    res.status(200).json({

        status: 'success',
        data: {
            results: tours.length, // tours contains all fitt documents.
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // convery to km/miles depends on what we specified.

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: { // whre to calc distances from? start point.
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1] //convert to num
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });

});