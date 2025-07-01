const onlyAllow = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(400).json({ message: "Please, Login" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(req.user);
      return res.status(400).json({ message: "You are not authorized" });
    }
    next();
  };
};

export default onlyAllow;
