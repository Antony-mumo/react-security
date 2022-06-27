import express from "express";
import tagsCtrl from "../controllers/tags.controller";

const router = express.Router();

router.route("/tags").get(tagsCtrl.tags);

export default router;
