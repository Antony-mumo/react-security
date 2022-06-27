import jwt from "express-jwt";
const jwtSecret = "socblog_secret";

function extractToken(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

const Auth = {
  secret: jwtSecret,
  required: jwt({
    secret: jwtSecret,
    userProperty: "payload",
    getToken: extractToken
  }),
  optional: jwt({
    secret: jwtSecret,
    userProperty: "payload",
    credentialsRequired: false,
    getToken: extractToken
  })
};

export { Auth };
