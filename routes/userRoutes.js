const express = require('express');

const userController = require('./../controllers/userController'); // all the func we exports in userContoller now in this var
const authController = require('./../controllers/authController'); // all the func we exports in userContoller now in this var

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


router.use(authController.protect)// every rout from here down need protect so instead of doing it manually one by one we just make this line a pre-middleware to all next routes.
router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);//protect make sure we are with the loged user. protect will ad the user to the current request
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin')); // only admins can do what's under that.


router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);



module.exports = router;
