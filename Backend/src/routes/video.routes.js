import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  publishAVideo,
  togglePublishStatus,
  searchVideos,  // Import the searchVideos function from the video.controller.js file
} from "../controllers/video.controller.js";

const router = Router();

// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    verifyJWT,
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/v/:videoId")
  .get(getVideoById)
  .delete(verifyJWT, deleteVideo)
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);
router.route("/delete/:videoId").delete(deleteVideo)

// GET /api/v1/videos/search?q=term
router.get("/search", searchVideos);


export default router;