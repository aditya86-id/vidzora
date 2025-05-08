// routes/watch.js
import express from "express";
import {
  reportProgress,
  getWatchHistory,
} from "../controllers/watchController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
//import protect from "../middlewares/auth.middleware.js"; // adds req.user

const router = express.Router();

router.post("/progress",verifyJWT, reportProgress);
router.get("/history", verifyJWT,getWatchHistory);

export default router;
