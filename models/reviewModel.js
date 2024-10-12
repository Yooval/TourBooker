const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema( // we are doing it with parent referrencing because we might get an enourmus array of reviews and we have data limit. so we will just have a lot of logged documents.
    {
        review: {
            type: String,
            required: [true, "Review can not be empty!"]
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },

        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: { //here iswhich tour this review abot? here we do the parent referencing - in each review we specify the parent(the tour).
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, "Review must belong to a tour."]

        },

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true } //means than when we present output(when we run in postman) all vituals properties will be presented also as on object when fields are in json.
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });// now, every user can post only one review in a single tour.


reviewSchema.pre(/^find/, function (next) {
    //this.populate({
    //    path: 'tour', //means that tour is what going to be populate- the obj we are gonna insert his data. when we hit get all reviews in each review we can see those details about the tour that was reviewed each review.
    //    select: 'name' // only want the tour name nothing else
    //    //path: 'user',
    //    //select: 'name_id'
    //}).populate({
    //    path: 'user', // when we do get all reviews we can see the details of the the user that create that including name photo if exists
    //    select: 'name photo'
    //    //path: 'tour',
    //    //select: 'name_id'
    //});
    this.populate({
        path: 'user', // when we do get all reviews we can see the details of the the user that create that including name photo if exists
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }// select the tour we actually wanna update
        },
        {
            $group: {
                _id: '$tour', // grouping all tours together by the tour(from all reviews take those with same tour)
                nRating: { $sum: 1 },// for number of rating we just add 1 for every rating we meet
                avgRating: { $avg: '$rating' } //each review has rating field and frim this field we wanna calc the avg.
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.pre('save', function () {
    //this(like this. ...) point to current review. is hppend before every save.
    this.constructor.calcAverageRatings(this.tour); // using this.constructor cause i wanna use Review but it defined only next few lines.
});
//findByIdAndUpdate/Delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne()//find the current review and than niddleware below will to what nedded to be done. we did it like this because it a pre middleware(before the save) but we no a post request(update date) so one middleware cant be both.
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
