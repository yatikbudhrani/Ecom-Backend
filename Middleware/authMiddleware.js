import jwt from "jsonwebtoken";
import { userModel } from "../Models/UserModel.js";

async function authMiddleware(req, res, next) {
  try {
    console.log("your auth middleware is going to process")
    const { auth_token } = req.cookies;
    const decoded_token = jwt.verify(auth_token, process.env.SECRET);
    const loggedInUser = await userModel.findById(decoded_token.userID);
    if (!loggedInUser) return res.status(401).json({ message: "User not found" });

    req.user = loggedInUser;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Unauthorized" });
  }
}
export default authMiddleware;