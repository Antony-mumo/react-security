// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./components/App";
// import registerServiceWorker from "./registerServiceWorker";

// ReactDOM.render(<App />, document.getElementById("root"));
// registerServiceWorker();

import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { store, history } from "./store";
import App from "./components/App";
import { withBasename } from "./utils/params";

console.log("store: ", store);
console.log("history: ", history);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path={withBasename("/")} component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>,

  document.getElementById("root")
);
