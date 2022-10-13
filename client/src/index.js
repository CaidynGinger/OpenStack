import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./components/Pages/Login/Login";
import QuestionPortal from "./components/Pages/QuestionPortal/QuestionPortal";
import Register from "./components/Pages/Register/Register";
import App from "./App";

import { LandingPage } from "./components/Pages/LandingPage/LandingPage";
import { ResultsPage } from "./components/Pages/ResultsPage/ResultsPage";
import "./index.scss";
import Playground from "./components/Pages/Register Redo/Playground";
import IndividualQuestion from "./components/Pages/IndividualQuestion/IndividualQuestion";
import UserSettings from "./components/Pages/UserSettings/UserSettings";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/question-portal" element={<QuestionPortal />} />
        <Route path="/resultsPage" element={<ResultsPage />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/individual-question" element={<IndividualQuestion />} />
        <Route path="/UserSettings" element={<UserSettings />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
