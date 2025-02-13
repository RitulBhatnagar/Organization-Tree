import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

import { HttpStatusCode } from "./errorMiddlware";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface AuthenticateRequest extends Request {
  user?: {
    userId: string;
  };
}
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

    req.user = req.user || {}; // Initialize req.user if it doesn't exist
    req.user.userId = decoded.userId; // Assign userId directly

    next();
  } catch (error) {
    logger.error("Error while authenticating user", error);
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: "Unauthorized: Invalid token" });
  }
};
