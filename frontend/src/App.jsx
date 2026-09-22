import {BrowserRouter,Routes,  Route, Navigate,} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";


function ProtectedRoute({ children }) {

  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}


function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />


        <Route
  path="/tasks/:id"
  element={
    <ProtectedRoute>
      <TaskDetails />
    </ProtectedRoute>
  }
/>


        <Route
  path="/projects/:id"
  element={
    <ProtectedRoute>
      <ProjectDetails />
    </ProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;