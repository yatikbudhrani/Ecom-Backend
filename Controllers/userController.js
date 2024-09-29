
import { userModel } from '../Models/UserModel.js';
import dotenv from 'dotenv/config';
import bcrypt from "bcrypt";
import sendEmail from '../Services/sendEmail.js'
import uploadToCloudinary from '../Services/uploadToCloudinary.js'
import jwt from 'jsonwebtoken';
import { generateToken } from "../Services/tokenGenerate.js";

// Signup route
export const registerUser = async (req, res) => {
  try {
    let { firstname, lastname, email, password, role } = req.body;
    let profilePicUrl = 'default.jpg';
    // Check if a file was uploaded
    if (req.file) {
      console.log('File received, starting Cloudinary upload');
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        profilePicUrl = uploadResult.secure_url;
        console.log('profilepicurl', profilePicUrl)
      } catch (uploadError) {
        console.error('Error during Cloudinary upload:', uploadError);
        return res.status(500).send('Error uploading image to Cloudinary');
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;
    console.log('profilepicurl', profilePicUrl)
    const user = new userModel(
      {
        profilePic: profilePicUrl,
        firstname,
        lastname,
        email,
        password,
        role,
        isVerified: false,
      });
    const jwtToken = generateToken(user);
    const verificationLink = `${process.env.FRONTEND_URL}/verifyemail?token=${jwtToken}`;
    await sendEmail(email, firstname, lastname, null, verificationLink);
    await user.save();
    console.log('User registered successfully');
    res.status(201).send('User signed up successfully! Please check your email to verify your account.');
  } catch (error) {
    console.error('Error in saving user:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const verifyUser = async (req, res) => {
  const { token } = req.query;
  console.log('you are going to verify ', token)
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.userID;

    // Update user's verification status
    await userModel.updateOne({ _id: userId }, { isVerified: true });
    console.log('User verified successfully', userId);
    res.send('Email verified successfully! You can now log in.');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).send('Invalid or expired token');
  }
};

export const loginUser = async (req, res) => {
  console.log('we get Your req and processing it ')
  const { email, password } = req.body;
  try {
    const checkUser = await userModel.findOne({ email: email }).exec();
    console.log(checkUser)

    if (!checkUser) {
      return res.status(404).json({ message: 'User not found or invalid credentials' });
    }
    const check = await bcrypt.compare(password, checkUser.password);
    console.log(check)
    if (!check) return res.status(401).json({ message: "Invalid Credentials" });
    if (!checkUser.isVerified) {
      return res.status(404).json({ error: "Please verify your email first" });
    }

    const jwtToken = generateToken(checkUser);
    console.log(generateToken(checkUser))

    res
      .cookie("auth_token", jwtToken, {
        httpOnly: true,
        secure: false, //as we are working with localhost, which runs on http, not on https
        sameSite: "strict",
        maxAge: 3600000,
      })
      .status(200)
      .json({
        message: "Login Successful",
        firstname: checkUser.firstname,
        lastname: checkUser.lastname,
        userEmail: checkUser.email,
        profilePic: checkUser.profilePic,
        role: checkUser.role,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

export const logOutUser = async (req, res) => {
  console.log("now you are going to logged out")
  try {
    res.clearCookie("auth_token").status(200).json({ message: "Logout successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}


export const verifyemail = async (req, res) => {
  console.log("now you are going to verify your email")
  const { email } = req.body
  console.log(email)
  try {
    const checkUser = await userModel.findOne({ email: email }).exec();
    if (!checkUser) {
      return res.status(404).json({ message: 'User not found for the given Email' });
    }
    res.status(200).json({ message: "user found successfully" });
  } catch (err) {
    res.status(404).json({ message: "user not found or invalid credentials" });
  }
}
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
}
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(email)
  console.log('now you are going to send otp')
  try {
    const user = await userModel.findOne({ email }).exec();
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found with the given email.' });
    }
    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    const { firstname, lastname } = user;
    await sendEmail(email, firstname, lastname, otp);
    // Step 6: Respond with success message
    return res.status(200).json({ message: 'OTP sent successfully to your email address.' });

  } catch (err) {
    console.error('Error in sendOtp:', err);
    // Step 7: Handle any errors and respond with appropriate error message
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};
export const validateOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, otp)
  try {
    const user = await userModel.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found with the given email.' });
    }
    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP. Please try again.' });
    }
    if (user.otpExpiry < Date.now()) {
      return res.status(401).json({ message: 'OTP has expired. Please try again.' });
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (err) {
    console.error('Error in validateOtp:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }

}
export const changePassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body
  console.log(email, newPassword, confirmPassword)
  try {
    const user = await userModel.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found with the given email.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Error in changePassword:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
}

export function isUserLoggedIn(req, res) {
  res.json({ user: req.user });
}

export const fetchUsers = async (req, res) => {
  console.log("you are fetching all the users ")
  try {
    const allUsers = await userModel.find();
    console.log(allUsers)
    res.status(200).json({ message: "users fetched successfully", allUsers });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}