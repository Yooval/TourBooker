const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'], // the string is for if  we dont send the require thing.
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters '],
        minlength: [10, 'A tour name must have more or equal then 10 characters ']
    },
    slug: String, // to include the slug part downstairse with "save"
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty is either: easy, medium, difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must above 1.0 or equal'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) { //val is the actual price discount
                // this only points to current document on NEW document creation(relevant only when crating tour)
                return val < this.price; // discount smaller than actual price

            },
            message: 'Discout price ({VALUE}) should be bellow regular price'
        }
    },
    summary: {
        type: String,
        trim: true, // remove whitespaces at beginning and in the end.
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String, // name of image
        required: [true, 'A tour must have a description']
    },
    images: [String],//it's gonna be an array of strings
    createdAt: {
        type: Date,
        default: Date.now(), // mongose do it and give as the correct actual time we created it.
        select: false //dont show it
    },
    startDates: [Date], // aray of all creations dates
    secretTour: {
        type: Boolean,
        default: false // usully tours are not secret.
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId, // think about how it should lok like. a field with an id( id reffered to the guide object). this field is actually an objectid so thats the type.
            ref: 'User' // each object  references a document from User.
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true } //means than when we present output(when we run in postman) all vituals properties will be presented also as on object when fields are in json.
    }
);

//tourSchema.index({ price: 1 })//now in db the tours will be sorted by price to if we look for example for all prices les than 100 with 1(acending) we will query the database as long as all tours belongs(when we did it the num of res was equal to name of docs exemained(checked)). 1 acending -1 decending
tourSchema.index({ price: 1, ratingsAverage: -1 }); //now we want prices less than and ratinf more than.
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });// must define it to use geospatial.


tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7; // it's not instead of duration it's in addition to. the duration is days devided by 7 now it represent duration in weeks. duration in weeks is not in the database but when we can the data of the general durations it's aotumaticly by devided by 7.
});


//virtual populate
tourSchema.virtual('reviews', { // creating a virtual field called reviews in the Tour schema. This virtual field is not stored in the database but can be populated with related data from the Review model.
    ref: 'Review',//  This specifies that the virtual field reviews will refer to the Review model.
    foreignField: 'tour', // This indicates that in the Review model, the tour field holds the reference to the Tour document (i.e., the foreign key).
    localField: '_id' // This tells Mongoose that the _id field of the Tour document should be matched against the tour field in the Review model.
});


//DOCUMENT MIDDLEWARE: runs before the save command and the .create() command.
tourSchema.pre('save', function (next) {//pre-midlewear. means going to run before an actuall event. in that case it's the save event. thr function will(near 'save') will be called before saving to the database.
    this.slug = slugify(this.name, { lower: true }); // means before save the document to db lowercase everything it's operate on-here it on the name.
    next();
});
//---------------the embeded way---
//tourSchema.pre('save', async function (next) {
//    this.guides = await User.find({ _id: { $in: this.guides } });
//    next();
//});

//QUERY MIDDLEWARE- means it run before any query from db we do.
tourSchema.pre(/^find/, function (next) {// using ^find means this middleware will work for all find funcs: find, findById, findByIdAndUpdate and cetera. this mean that every relevant request in postman(update/get all/get one tour) willuse this middleware.
    this.find({ secretTour: { $ne: true } })//we want tosee only not secret(not set to false just no true)
    this.start = Date.now();
    next();
})


tourSchema.pre(/^find/, function (next) { // this always point to current query
    this.populate({//with populate we fill the this tour with the data inpopultaes('guides'). when we do guides: [{type: mongoose.Schema.ObjectId, ref: 'User'}] it's just the reference to the actual data but with populdate we actually inset this data. but we fell only in this specific query. not in the database forever there.
        // so when we run get tour in postman we wiil see full description of those guids and also in get all tours.

        path: 'guides', // do the populate on this.
        select: '-__v -passwordChangedAt' // dont show this fields
    });// the find we look for is fore example like findById.

    next();
})




// AGGREGATION MIDDLEWARE- take care of the aggregation of the request. the problem- we choose to not show the secret tour but when we sidply tour but difficulty it's also there, it's difficulty is calculated
//tourSchema.pre('aggregate', function (next) {
//    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // means take only those where secret tour isn't true
//    next();
//});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; // we can do just one export in the end because we exporting only one module do a lot of funcs.
// we wiil import it in tour controller