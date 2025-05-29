import jwt from "jsonwebtoken";

const checkRoleUser = {
  isAdmin: (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(404).json({ message: "Не верно передан token" });
    }

    try {
      const decoded = jwt.verify(token, "secret123");
      const userRole = decoded.role;

      if (userRole !== "admin") {
        return res
          .status(400)
          .json({ message: "У вас нет нужной роли, в доступе отказано" });
      }
      next();
    } catch (err) {
      res.status(403).json({ message: "Невалидный токен" });
    }
  },
};

export default checkRoleUser;
