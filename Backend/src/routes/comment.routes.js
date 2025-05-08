import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments,addComment } from "../controllers/comment.controller.js";

const router=Router()

router.route("/:videoId").get(getVideoComments)
router.route("/comment/:videoId").post(verifyJWT,addComment);

export default router