import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { User } from "../entities/user/userEntity";
import { UserRole } from "../entities/Role/roleEntity";
import { HttpStatusCode } from "./errorMiddlware";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

interface DecodedToken {
  userId: string;
  exp: number;
}
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: "Unauthorized: Missing authorization token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as DecodedToken;
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTimeStamp) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Token expired" });
    }

    req.body.user = { userId: decoded.userId };
    next();
  } catch (error) {
    logger.error("Error while authenticating user", error);
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: "Unauthorized: Invalid token" });
  }
};

// export const checkAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { userId } = req.body.user;

//     const user = await User.findOne({
//       where: { userId },
//       relations: ["roles"],
//     });
//     if (!user) {
//       return res.status(HttpStatusCode.UNAUTHORIZED).json({
//         message: "User not found",
//       });
//     }

//     if (!user.roles || !Array.isArray(user.roles)) {
//       return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
//         message: "User roles are not properly defined",
//       });
//     }
//     const isAdmin = user.roles.some((role) => role.roleName === UserRole.ADMIN);

//     if (isAdmin) {
//       req.body.user = { ...req.body.user, role: UserRole.ADMIN };
//       return next();
//     }

//     return res.status(HttpStatusCode.UNAUTHORIZED).json({
//       message: "You are not authorized to perform this action",
//     });
//   } catch (error) {
//     console.error("Error in checkAdmin middleware:", error);
//     return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
//       message: "An error occurred while checking admin status",
//     });
//   }
// };
