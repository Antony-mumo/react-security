import User from "../models/user.model";
import userCtrl from "./user.controller";

const userProfile = (req, resp, next) => {
  if (req.auth) {
    User.findById(req.auth.id)
      .then(user => {
        return resp.json(req.profile.getProfilePacket(user));
      })
      .catch(next);
  } else {
    return resp.status(200).json(req.profile.getProfilePacket(req.profile));
  }
};

const follow = (req, resp, next) => {
  if (!req.auth) userCtrl.userNotAuthorized(resp);
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized(resp);
      user
        .follow(req.profile.id)
        .then(function() {
          return resp.status(200).json(req.profile.getProfilePacket(user));
        })
        .catch(next);
    })
    .catch(next);
};

const unfollow = (req, resp, next) => {
  if (!req.auth) userCtrl.userNotAuthorized(resp);
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized(resp);
      user
        .unfollow(req.profile.id)
        .then(function() {
          return resp.status(200).json(req.profile.getProfilePacket(user));
        })
        .catch(next);
    })
    .catch(next);
};

export default {
  userProfile,
  follow,
  unfollow
};
