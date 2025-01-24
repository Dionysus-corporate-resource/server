import jwt from "jsonwebtoken";
// import UserModel from "../models/user.js";
import CompanyModel from "../models/company.js";

export const check = {
  isAuth: (req, res, next) => {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

    if (!token) {
      return res.status(403).json({
        message: "У вас нет доступа",
      });
    }

    try {
      const decoded = jwt.verify(token, "secret123");
      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({
        message: "Ошибка при расшифровываннии токена",
      });
    }
  },
//   isManager: async (req, res, next) => {
//     const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
//     console.log("isManager", token);

//     if (!token) {
//       return res.status(403).json({
//         message: "У вас нет доступа",
//       });
//     }

//     try {
//       const decoded = jwt.verify(token, "secret123");
//       req.userId = decoded._id;

//       const user = await UserModel.findById(decoded._id);
//       console.log("userId", decoded._id);
//       console.log("user", user);

//       const hasBookingRoles = user.roles.some(
//         (role) => role === "super-viser" || role === "manager",
//       );
//       console.log("role", hasBookingRoles);

//       if (!hasBookingRoles) {
//         return res.status(403).json({
//           message: "У вас нет прав для этого действия",
//         });
//       }

//       next();
//     } catch (err) {
//       return res.status(403).json({
//         message: "Ошибка при расшифровываннии токена",
//       });
//     }
//   },
//   isDispatcher: async (req, res, next) => {
//     const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
//     console.log("isDispatcher", token);

//     if (!token) {
//       return res.status(403).json({
//         message: "У вас нет доступа",
//       });
//     }

//     try {
//       const decoded = jwt.verify(token, "secret123");
//       req.userId = decoded._id;

//       const user = await UserModel.findById(decoded._id);
//       console.log("userId", decoded._id);
//       console.log("user", user);

//       const hasBookingRoles = user.roles.some(
//         (role) =>
//           role === "super-viser" || role === "dispatcher" || role === "manager",
//       );
//       console.log("role", hasBookingRoles);

//       if (!hasBookingRoles) {
//         return res.status(403).json({
//           message: "У вас нет прав для этого действия",
//         });
//       }

//       next();
//     } catch (err) {
//       return res.status(403).json({
//         message: "Ошибка при расшифровываннии токена",
//       });
//     }
//   },
  isExistingCompany: async (req, res, next) => {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    // Если token не отправлен, доступа у него нет
    if (!token) {
      return res.status(403).json({
        message: "У вас нет доступа",
      });
    }
    // Расшифровываем token
    try {
      const decoded = jwt.verify(token, "secret123");
      req.token = decoded;
      // console.log("decoded", decoded);

      // Проверка на то, что компания существует
      const existingCompany = await CompanyModel.findOne({
        _id: decoded._idCompany,
      });
      if (!existingCompany) {
        return res.status(404).json({
          message: "Такой компании уже не существует",
        });
      }

      // Проверка на то, что пользователь является частью этой компании
      const existingEmployeeInCompany = existingCompany.employees.some(
        (employee) => {
          return employee.userData._id.toString() === decoded._idLogistician;
        },
      );
      console.log(existingEmployeeInCompany);
      if (!existingEmployeeInCompany) {
        return res.status(404).json({
          message: "Пользователь не является сотрудником этой компании",
        });
      }

      // // Проверка на роль, есть у пользователя роль general_director
      // if (!decoded.rolesLogistician.includes("general_director")) {
      //   return res.status(404).json({
      //     message: "У вас нет нужной роли(",
      //   });
      // }

      next();
    } catch (err) {
      return res.status(403).json({
        message: "Ошибка при расшифровываннии токена",
      });
    }
  },
  isNeedRoles:
    (allowedRoles = []) =>
    (req, res, next) => {
      const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

      if (!token) {
        return res.status(403).json({
          message: "У вас нет доступа",
        });
      }

      try {
        const decoded = jwt.verify(token, "secret123");
        req.token = decoded;
        console.log("decoded token", decoded);

        // проверка на подходящие роли
        const isNextRole = allowedRoles.some((role) =>
          decoded.rolesLogistician.includes(role),
        );

        // Если переданы роли не подходят
        if (!isNextRole) {
          return res.status(403).json({
            message: "Недостаточно прав для доступа",
            decdedNew: "decoded",
            decoded,
          });
        }

        next(); // Переход к следующему middleware
      } catch (err) {
        return res.status(403).json({
          message: "Ошибка при расшифровывании токена",
        });
      }
    },
};
