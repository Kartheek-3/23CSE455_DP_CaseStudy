import { Router, Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { FileController } from "../controllers/FileController";
import { ROUTES } from "../../constants/Routes";

const router = Router();
const fileController = container.resolve(FileController);

router.get(ROUTES.FILES.SIGNED_URL, (req: Request, res: Response, next: NextFunction) => {
  fileController.getSignedUrl(req, res, next);
});

export default router;
