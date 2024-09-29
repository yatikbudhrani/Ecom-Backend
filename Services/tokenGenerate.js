import jwt from "jsonwebtoken";
import "dotenv/config";
import { generateCrypto } from "../Utils/generateRandomCrypto.js";

export function generateToken(user) {
  return jwt.sign(
    {
      userID: user._id,
      userEmail: user.email,
      isVerified: user.isVerified
    },
    process.env.SECRET,
    { expiresIn: "1h" }
  );
}