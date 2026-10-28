import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { container } from 'tsyringe';
import { TOKENS } from '../../constants/Tokens';
import { ROUTES } from '../../constants/Routes';
const router = express.Router();
export const authController=container.resolve<AuthController>(TOKENS.AUTH_CONTROLLER)  
router  
  .post(ROUTES.AUTH.REFRESH_TOKEN, authController.refreshToken.bind(authController))
  .post(ROUTES.AUTH.FORGOT_PASSWORD, authController.forgotPassword.bind(authController))  
  .post(ROUTES.AUTH.RESET_PASSWORD,authController.resetPassword.bind(authController))
  .patch(ROUTES.AUTH.CHANGE_PASSWORD,authController.ChangePassword.bind(authController))
   .post(ROUTES.AUTH.LOGOUT,authController.logout.bind(authController))
export default router;
