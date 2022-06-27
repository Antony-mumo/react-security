import express from "express";
import authCtrl from "../controllers/auth.controller";
import userCtrl from "../controllers/user.controller";
import profilesCtrl from "../controllers/profiles.controller";
import authCtrll from "../controllers/auth.controller";

const router = express.Router();

router.param("userName", userCtrl.userByName);

router.post(
  "/profiles/:userName/follow",
  authCtrl.requireSignin,
  profilesCtrl.follow
);

router.get(
  "/profiles/:userName",
  authCtrl.signinIsOptional,
  profilesCtrl.userProfile
);

router.delete(
  "/profiles/:userName/follow",
  authCtrl.requireSignin,
  profilesCtrl.unfollow
);

export default router;
