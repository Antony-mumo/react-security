import User from "../models/user.model";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import config from "./../config/config";
import _ from "lodash";

const login = (req, resp, next) => {
  User.findOne({ email: req.body.user.email })
    .then(user => {
      if (!user || !user.passwordIsValid(req.body.user.password))
        throw { "email or password": ["is invalid"] };

      return resp.status(200).json(user.signupPacket);
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie("t");
  return res.status("200").json({ message: "signed out" });
};

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: "auth"
});

const signinIsOptional = expressJwt({
  secret: config.jwtSecret,
  userProperty: "auth",
  credentialsRequired: false
});

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth.id;
  if (!authorized) {
    throw { user: ["not authorized"] };
  }
  next();
};

export default {
  login,
  logout,
  requireSignin,
  signinIsOptional,
  hasAuthorization
};
