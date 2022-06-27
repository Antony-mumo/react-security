import agent from "../utils/agent";
import Header from "./Header";
import React from "react";
import { connect } from "react-redux";
import { APP_LOAD, REDIRECT } from "../utils/actionTypes";
import { Route, Switch } from "react-router-dom";
import Article from "./Article";
import Editor from "./Editor";
import Home from "./Home";
import Login from "./Login";
import Profile from "./Profile";
import ProfileFavorites from "./ProfileFavorites";
import Register from "./Register";
import Settings from "./Settings";
import { store } from "../store";
import { push } from "react-router-redux";
import { withBasename } from "../utils/params";

const mapStateToProps = state => {
  return {
    appLoaded: state.common.appLoaded,
    appName: state.common.appName,
    currentUser: state.common.currentUser,
    redirectTo: state.common.redirectTo
  };
};

const mapDispatchToProps = dispatch => ({
  onLoad: (payload, token) =>
    dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
  onRedirect: () => dispatch({ type: REDIRECT })
});

class App extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.redirectTo) {
      // this.context.router.replace(nextProps.redirectTo);
      store.dispatch(push(nextProps.redirectTo));
      this.props.onRedirect();
    }
  }

  componentWillMount() {
    const token = window.localStorage.getItem("socblog_jwt");
    if (token) {
      agent.setToken(token);
    }

    this.props.onLoad(token ? agent.Auth.current() : null, token);
  }

  render() {
    if (this.props.appLoaded) {
      return (
        <div>
          <Header
            appName={this.props.appName}
            currentUser={this.props.currentUser}
          />
          <Switch>
            <Route exact path={withBasename("/")} component={Home} />
            <Route path={withBasename("/login")} component={Login} />
            <Route path={withBasename("/register")} component={Register} />
            <Route path={withBasename("/editor/:slug")} component={Editor} />
            <Route path={withBasename("/editor")} component={Editor} />
            <Route path={withBasename("/article/:id")} component={Article} />
            <Route path={withBasename("/settings")} component={Settings} />
            <Route path={withBasename("/@:username/favorites")} component={ProfileFavorites} />
            <Route path={withBasename("/@:username")} component={Profile} />
          </Switch>
        </div>
      );
    }
    return (
      <div>
        <Header
          appName={this.props.appName}
          currentUser={this.props.currentUser}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
