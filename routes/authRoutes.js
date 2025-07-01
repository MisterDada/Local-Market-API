import { RegisterUser, LoginUser } from "../controllers/authController.js";
import express from "express";

const Router = express.Router();

//Register route

Router.post("/Register", RegisterUser);

//Login route

Router.post("/login", LoginUser);

export default Router;
