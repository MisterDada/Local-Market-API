import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";

export const RegisterUser = async (req, res) => {
  const { name, password, role } = req.body;

  try {

    const existingUser = await User.findOne({name})
    if(existingUser){
      res.status(400).json({message: "user already exists"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, password: hashedPassword, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    res.status(201).json({ user: { id: user._id, name, role }, token });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error in registration, please try again" });
    console.log("Error registring user", error);
  }
};

export const LoginUser = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      res.status(400).json({ message: "Passwords do not match" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    res
      .status(200)
      .json({ user: { id: user._id, name: user.name, role: user.role }, token });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error in registration, please try again" });
    console.log("Error registring user", error);
  }
};
