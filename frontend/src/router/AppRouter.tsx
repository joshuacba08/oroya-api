import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Fields, Home, Login, NotFound, Onboarding, Projects } from "../pages";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/entities" element={<Home />} />
        <Route
          path="/projects/:projectId/entities/:entityId/fields"
          element={<Fields />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
