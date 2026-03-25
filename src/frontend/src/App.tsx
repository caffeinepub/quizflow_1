import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import HomePage from "./pages/HomePage";
import QuizTakingPage from "./pages/QuizTakingPage";
import ResultsPage from "./pages/ResultsPage";
import SubmissionsPage from "./pages/SubmissionsPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$id",
  component: QuizTakingPage,
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$id/results",
  component: ResultsPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const createQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/quiz/new",
  component: CreateQuizPage,
});

const submissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/quiz/$id/submissions",
  component: SubmissionsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  quizRoute,
  resultsRoute,
  adminLoginRoute,
  adminRoute,
  createQuizRoute,
  submissionsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
