import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./App.css";

import { setCurrentUser } from "./actions/authActions";
import autoLogOutIfNeeded from "./validation/autoLogOut";

import PrivateRoute from "./components/common/PrivateRoute";

import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

import DashBoard from "./components/dashboard/Dashboard";
import AddEvent from "./components/events/AddEvent";

import Landing from "./components/layout/Landing";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

//Auto setCurrentUser or logoutUser
if (localStorage.user) {
  autoLogOutIfNeeded();
  store.dispatch(setCurrentUser(JSON.parse(localStorage.user)));
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div
            style={{
              backgroundColor: "lightblue",
              height: "100vh",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Navbar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Switch>
              <PrivateRoute exact path="/dashboard" component={DashBoard} />
              <PrivateRoute exact path="/event/add" component={AddEvent} />
            </Switch>
            <div style={{ flex: 1 }} />
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
