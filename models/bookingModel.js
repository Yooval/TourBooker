const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: { // which tour was booked?
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function (next) { //populate tour and user automaticly when there is a query here.
  this.populate('user').populate({
    path: 'tour',
    select: 'name' 
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
