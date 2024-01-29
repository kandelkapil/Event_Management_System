import multer from "multer";
import path from "path";
import { Request, Response } from "express";

const __filename = new URL(import.meta?.url)?.pathname;
const __dirname = path.dirname(__filename);

const storage: any = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = path.join(__dirname, "..", "uploads");
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

const imageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      path: `/upload/image/${req.file.originalname}`,
      message: "Image upload success",
    });
  } catch (err: any) {
    console.error("Error uploading image:", err);
    res
      .status(500)
      .json({ success: false, message: "Upload failed", stack: err.stack });
  }
};

export { upload, imageUpload };
