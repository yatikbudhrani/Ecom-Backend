import express from 'express';
import { registerUser, verifyUser, loginUser, logOutUser, verifyemail, sendOtp, isUserLoggedIn, fetchUsers, validateOtp, changePassword } from '../Controllers/userController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import multer from 'multer';

// Multer setup to process files in memory only
const storage = multer.memoryStorage();
const uploadPicsCloud = multer({ storage });

const UserRouter = express.Router();

// Route for signing up a user
UserRouter.post('/register', uploadPicsCloud.single('profilePic'), registerUser);
UserRouter.get('/verifyuser', verifyUser);
// Route for getting a user
UserRouter.post('/login', loginUser);
UserRouter.get("/loggedIn", authMiddleware, isUserLoggedIn);
UserRouter.post('/logoutuser', logOutUser);
UserRouter.post('/forgotpassword/verifyemail', verifyemail);
UserRouter.post('/forgotpassword/sendotp', sendOtp);
UserRouter.post('/forgotpassword/validateotp', validateOtp);
UserRouter.post('/forgotpassword/changepassword', changePassword);
UserRouter.post('/updateuser', uploadPicsCloud.single('profilePic'), registerUser);
UserRouter.delete('/deleteuser', registerUser);
UserRouter.get('/fetchusers', fetchUsers)


export default UserRouter;
