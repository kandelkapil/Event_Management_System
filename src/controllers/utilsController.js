import multer from "multer";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
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

const imageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    // Assuming you want to send the filename in the response
    res.json({
      success: true,
      filename: req.file.originalname,
      path: `/upload/image/${req.file.originalname}`,
      message: "Image upload success",
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    res
      .status(500)
      .json({ success: false, message: "Upload failed", stack: err.stack });
  }
};

export { upload, imageUpload };
