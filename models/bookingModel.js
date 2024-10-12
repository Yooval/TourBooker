const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: { // which tour was booked?
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: { // which user booked it?
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: { // what's the price of the booked tour? price can be changed so it's important
    type: Number,
    require: [true, 'Booking must have a price.']
  },
  createdAt: { // when was booked?
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function (next) { //populate tour and user automaticly when there is a query here. so we can see them in those querry.
  this.populate('user').populate({
    path: 'tour', // populate all usre object
    select: 'name' // populate just the name
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;