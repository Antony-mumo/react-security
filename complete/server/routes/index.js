import express from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import tagsRoutes from "./tags.routes";
import profilesRoutes from "./profiles.routes";
import articlesRoutes from "./articles.routes";

const router = express.Router();

router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", tagsRoutes);
router.use("/", profilesRoutes);
router.use("/", articlesRoutes);

router.use(function(err, req, res, next) {
  console.log("faulty url: ", req.originalUrl);
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(err.errors[key].message);

        return errors;
      }, {})
    });
  }

  return next(err);
});

export default router;
