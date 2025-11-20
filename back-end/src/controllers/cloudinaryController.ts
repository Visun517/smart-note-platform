import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";

export const imageUpload = async (req: AuthRequest, res: Response) => {
  try {
    let imageUrl = "";

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStreame = cloudinary.uploader.upload_stream(
          { folder: "images" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result)
          }
        );
        uploadStreame.end(req.file?.buffer);
      })

      imageUrl = result.secure_url;
      res.status(200).json({ imageUrl });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cloudinary upload failed" });
  }
}

export const pdfUpload = async (req: AuthRequest, res: Response) => {
  try {
    let pdfUrl = "";
    console.log(req.file)

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStreame = cloudinary.uploader.upload_stream(
          { folder: "pdf" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result)
          }
        );
        uploadStreame.end(req.file?.buffer);
      })

      pdfUrl = result.secure_url;
      res.status(200).json({ pdfUrl });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cloudinary upload failed" });
  }
}