import jwt from "jsonwebtoken";

const VerifyToken = async (req, res, next) => {
  let token;
  let authheaders = req.headers.authorization || req.headers.Authorization;

  if (authheaders && authheaders.startsWith("Bearer")) {
    token = authheaders.split("")[1];

    if (!token) {
      res.status(400).json({ message: "Access denied, Login or register" });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
      console.log(decode);
      next();
    } catch (error) {
      res.status(400).json({ message: "error verifying token", error });
    }
  } else {
    res.status(400).json({ message: "Authorization missing" });
  }
};

export default VerifyToken;
