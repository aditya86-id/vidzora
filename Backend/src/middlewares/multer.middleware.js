import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/temp"); // ✅ Just this
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Add `limits` here
export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 5 MB limit
  },
});
