import express from "express";
import { container } from "tsyringe";
import { GoogleauthController} from "../controllers/googleAuthController";
import { ROUTES } from "../../constants/Routes";

const router = express.Router();
const controller = container.resolve(GoogleauthController);

router.post(ROUTES.AUTH.GOOGLE.SIGNIN, controller.googleAuth);


export default router;
