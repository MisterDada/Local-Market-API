import jwt from "jsonwebtoken";
import User from '../models/UserSchema.js'

const VerifyToken = async (req, res, next) => {
  let token;
  let authheaders = req.headers.authorization || req.headers.Authorization;

  if (authheaders && authheaders.startsWith("Bearer")) {
    token = authheaders.split(" ")[1];

    if (!token) {
      res
        .status(400)
        .json({
          message:
            "Access denied, You are not permitted to perform this action",
        });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decode.id).select("name email role");
      console.log(decode);
      next();
    } catch (error) {
      res.status(400).json({ message: "error verifying token", error });
      console.error(error);
    }
  } else {
    res.status(400).json({ message: "Authorization missing" });
  }
};

export default VerifyToken;
