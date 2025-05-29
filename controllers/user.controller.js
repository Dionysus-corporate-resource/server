import User from "../models/user.model.js";

export const userControllers = {
  editProfile: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {
          userName: req.body.userName,
          phone: req.body.phone,
          roles: req.body.roles,
          companyName:
            req.body.roles === "customer" ? req.body.companyName : null,
        },
        { new: true },
      );
      if (!updatedUser) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      res.status(200).json({
        updatedUser,
        message: "Даннык пользователя обновлены",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при обновлении данных профиля" });
    }
  },
};
