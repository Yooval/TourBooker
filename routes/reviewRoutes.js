const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const router = express.Router({ mergeParams: true }); // why use mergeParams? we want to have access to the
//route router.use('/:tourId/reviews', reviewRouter);  but there no tourId parameter in the router here(we are in review routes(no Tour), and each router has access only to his parameter's routes)
// so we can use mergeParams so we will have access to parameters of other routes and now we will have to tourId parameter and we will be able to
// actually use the route router.use('/:tourId/reviews', reviewRouter);

router.use(authController.protect)

//POST /tour/234fad4(id of tour)/reviews we got here from tour routes after matching  /:tourId/reviews' and now we access the .route('/') with access to the id in the req.
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIDs,
        reviewController.createReview
    ); //protect means only autenticated users can get there. restrictTo means only users can get there to this func


router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);
module.exports = router;