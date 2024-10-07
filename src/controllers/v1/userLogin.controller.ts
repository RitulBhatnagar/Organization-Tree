import { Request, Response } from "express";
import APIError, { HttpStatusCode } from "../../middleware/errorMiddlware";
import { localConstant } from "../../utils/constant";
import { UserLoginService } from "../../services/v1/userLogin.service";
import logger from "../../utils/logger";

const userLoginService = new UserLoginService();

export class UserLoginController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || email.trim() === "" || typeof email !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing or invalid email in request body" });
    }
    if (!password || password.trim() === "" || typeof password !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing or invalid password in request body" });
    }
    try {
      const user = await userLoginService.login(email, password);
      return res.status(200).json(user);
    } catch (error) {
      logger.error("Error while login", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_LOGIN,
      });
    }
  }

  async signup(req: Request, res: Response) {
    const { email, password, name } = req.body;
    if (!email || email.trim() === "" || typeof email !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing or invalid email in request body" });
    }
    if (!password || password.trim() === "" || typeof password !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing or invalid password in request body" });
    }
    if (!name || name.trim() === "" || typeof name !== "string") {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Missing or invalid password in request body" });
    }
    try {
      const user = await userLoginService.signup(email, password, name);
      return res.status(200).json(user);
    } catch (error) {
      logger.error("Error while login", error);
      if (error instanceof APIError) {
        return res.status(error.httpCode).json({
          message: error.message,
        });
      }
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: localConstant.ERROR_LOGIN,
      });
    }
  }
}
