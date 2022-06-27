import React from "react";
import { Link } from "react-router-dom";
import { withBasename } from "../utils/params";

const LoggedOutView = props => {
  if (!props.currentUser) {
    return (
      <ul className="nav navbar-nav pull-xs-right">
        <li className="nav-item">
          <Link to={withBasename("/")} className="nav-link" id="home">
            Home
          </Link>
        </li>

        <li className="nav-item">
          <Link to={withBasename("/login")} className="nav-link">
            Sign in
          </Link>
        </li>

        <li className="nav-item">
          <Link to={withBasename("/register")} className="nav-link">
            Sign up
          </Link>
        </li>
      </ul>
    );
  }
  return null;
};

const LoggedInView = props => {
  if (props.currentUser) {
    return (
      <ul className="nav navbar-nav pull-xs-right">
        <li className="nav-item">
          <Link to={withBasename("/")} className="nav-link" id="home">
            Home
          </Link>
        </li>

        <li className="nav-item">
          <Link to={withBasename("/editor")} className="nav-link">
            <i className="ion-compose" id="new_post"></i>&nbsp;New Post
          </Link>
        </li>

        <li className="nav-item">
          <Link to={withBasename("/settings")} className="nav-link" id="settings">
            <i className="ion-gear-a"></i>&nbsp;Settings
          </Link>
        </li>

        <li className="nav-item">
          <Link
            to={withBasename(`/@${props.currentUser.username}`)}
            className="nav-link"
            id="my_profile"
          >
            <img
              src={props.currentUser.image}
              className="user-pic"
              alt={props.currentUser.username}
            />
            {props.currentUser.username}
          </Link>
        </li>
      </ul>
    );
  }

  return null;
};

class Header extends React.Component {
  render() {
    return (
      <nav className="navbar navbar-light">
        <div className="container">
          <Link to={withBasename("/")} className="navbar-brand">
            {this.props.appName}
          </Link>

          <LoggedOutView currentUser={this.props.currentUser} />

          <LoggedInView currentUser={this.props.currentUser} />
        </div>
      </nav>
    );
  }
}

export default Header;
