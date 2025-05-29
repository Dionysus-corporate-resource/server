import jwt from "jsonwebtoken";

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(400).json({ message: "Не верно передан token" });
  }

  try {
    const decoded = jwt.verify(token, "secret123");
    req.userId = decoded._id;
    next();
  } catch (err) {
    res.status(403).json({ message: "Невалидный токен" });
  }
};

export default checkAuth;
