const express = require('express');
const tourController = require('./../controllers/tourController'); // all the func we exports in tourContoller now in this var
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();


//POST /tour/234fad4(id of tour)/reviews    do something with all the reviews of a tour
//Get /tour/234fad4(id of tour)/reviews get all reviews of a tour


router.use('/:tourId/reviews', reviewRouter); // when we get req like
//POST /tour/234fad4(id of tour)/reviews    we get actually '/:tourId/reviews' which is route to reviewRouter. we need 2 routers to implement this req.


//router.param('id', tourController.checkID);// checking only req with id. instead of cheking it manually every func we call this middlewere eery tume to check
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours); // we will use a middlewear the take those chipest from the best

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan);



router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);// distance- distance from whre i am. center/:latlng - qordinates of center(whre i am). unit: km/miles cetera
// example: tours-distance/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)// here we will calc all distances from specefic tour loc to all others.


router.route('/')
    .get(tourController.getAllTours)// we want that everyone will be able to use this func so no protect
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour); //alrady mapped to correct type(user/tour) now mapped to right func. run controller check body before func create tour which is also midllewear
//only 'admin', 'lead-guide' can make changes in tours.
router.route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),// only 'admin', 'lead-guide' can delete tours.
        tourController.deleteTour
    );


module.exports = router; // we use module.exports = router because we have only one export (routrer)