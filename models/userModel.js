
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please tell us your Email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,

    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                //this only work when save
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date, // when someone change password this will be updated.
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
userSchema.pre('save', async function (next) { //this is a middlewear. here we encrypt(hash) the password we inserted for security
    //only run this pass if pass modified. this is the problematic code
    if (!this.isModified('password')) return next();// encrypt only if the pass hasmodified(or created)) else just next and nothing will happen
    this.password = await bcrypt.hash(this.password, 12); //12 is the solt. solt is the length of the code(string) added to the pass before encryption. now hashing is better.
    this.passwordConfirm = undefined; // now it's not true cause it not updated. it's a require input so we will have to give it a value when we sign up and it will be validate.
    next();
});

userSchema.pre('save', function (next) { // before we save at the end of reset password in auth.
    if (!this.isModified('password') || this.isNew) return next();// if pass didnt modified or new document do nothing
    this.passwordChangedAt = Date.now() - 1;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this point to current querry. before we do for example const users = await User.find() sobefore the find this middleware will run.
    // before we do any find documents we wana find onlt active ones- this why this middleware.
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) { //bool.checks if the user password(already encrypted) similar to the candidate password(WHAT WE INSERTED AS PASSWORDCONFIRM)
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) { //if exist pass been changed
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);; //it's now in seconds. parse int means make it int. base 10.
        return JWTTimestamp < changedTimestamp // JWTTimestamp is when we issued(addressed) the token if it was changed before(if changed at all) it's fine
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    //console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires 10 minutes after was reset

    return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
