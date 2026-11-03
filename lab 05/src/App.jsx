import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";

// These pages are downloaded only when the user first opens them.
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PetsPage = lazy(() => import("./pages/PetsPage"));
const PetDetailsPage = lazy(() => import("./pages/PetDetailsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="pets">
          <Route index element={<PetsPage />} />
          <Route path=":id" element={<PetDetailsPage />} />
        </Route>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
