import { Router } from "express";
import { UserLoginController } from "../../controllers/v1/userLogin.controller";

const router = Router();

const userLoginController = new UserLoginController();

router.post("/login", userLoginController.login);
router.post("/singup", userLoginController.signup);

export default router;
