import article from "./article";
import articleList from "./articleList";
import auth from "./auth";
import { combineReducers } from "redux";
import common from "./common";
import editor from "./editor";
import home from "./home";
import profile from "./profile";
import settings from "./settings";
import { routerReducer as routing } from "react-router-redux";

export default combineReducers({
  article,
  articleList,
  auth,
  common,
  editor,
  home,
  profile,
  settings,
  routing,
  router: routing
});
