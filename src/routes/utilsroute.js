import express from "express";
import path from "path";
import { upload, imageUpload } from "../controllers/utilsController.js";

const router = express.Router();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Use express.static within the router for the "/image" route
router.use("/image", express.static(path.join(__dirname, "uploads")));

// Handle the "/image" route separately with the upload and imageUpload middleware
router.route("/image").post(upload.single("image"), imageUpload);

router.route("/image/:filename").get((req, res) => {
  const { filename } = req.params;

  // Construct the path to the image
  const imagePath = path.resolve(__dirname, "..", "uploads", filename);

  // Send the image as a response
  res.sendFile(imagePath);
});

export default router;
