import User from "../models/user.model";
import _ from "lodash";
import errorHandler from "./../utils/mongodbErrorHandler";
import config from "./../config/config";
import jwt from "jsonwebtoken";

const userNotFound = resp => {
  resp.status(404);
  throw { auth: ["User not found"] };
};

const userNotAuthorized = resp => {
  resp.status(401);
  throw { auth: ["User not authorized"] };
};

const create = (req, resp, next) => {
  const user = new User(req.body.user);
  user
    .save()
    .then(function() {
      resp.status(200).json(user.signupPacket);
    })
    .catch(next);
};

const update = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userNotFound(resp);
      _.extend(user, req.body.user);
      user
        .save()
        .then(() => {
          return resp.status(200).json(user.signupPacket);
        })
        .catch(next);
    })
    .catch(next);
};

const current = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      return resp.status(200).json(user.signupPacket);
    })
    .catch(next);
};

const userById = (req, resp, next, id) => {
  User.findById(id)
    .populate("following", "_id name")
    .populate("favorites", "_id title")
    .exec((err, user) => {
      if (err || !user)
        return resp.status("400").json({
          error: "User not found"
        });
      req.profile = user;
      return next();
    });
};

const userByName = (req, resp, next, username) => {
  User.findOne({ username })
    .then(user => {
      if (!user) userNotFound(resp);
      req.profile = user;
      return next();
    })
    .catch(next);
};

export default {
  userNotFound,
  userNotAuthorized,
  create,
  userById,
  userByName,
  update,
  current
};
