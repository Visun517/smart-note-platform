import { Router } from "express";
import { imageUpload, pdfUpload } from "../controllers/cloudinaryController";
import { authenticate } from "../middleware/authMiddleware";
import { uploadMulter } from "../middleware/multerMiddleware";

const cloudinaryRouter = Router();

cloudinaryRouter.post(
    '/image',
    authenticate,
    uploadMulter.single("file"),
    imageUpload
)

cloudinaryRouter.post(
    '/pdf',
    authenticate,
    uploadMulter.single("file"),
    pdfUpload
)

export default cloudinaryRouter;
