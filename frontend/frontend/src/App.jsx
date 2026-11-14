import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(getSavedUser);
  const navigate = useNavigate();

  useEffect(() => {
    function handleAuthExpired() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  function handleAuthenticated(session) {
    localStorage.setItem("token", session.token);
    localStorage.setItem("user", JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
    navigate("/workspace", { replace: true });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/workspace" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={token
          ? <Navigate to="/workspace" replace />
          : <AuthPage mode="login" onAuthenticated={handleAuthenticated} />}
      />
      <Route
        path="/register"
        element={token
          ? <Navigate to="/workspace" replace />
          : <AuthPage mode="register" onAuthenticated={handleAuthenticated} />}
      />
      <Route
        path="/workspace"
        element={token
          ? <Dashboard user={user} onLogout={handleLogout} />
          : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={token ? "/workspace" : "/login"} replace />}
      />
    </Routes>
  );
}
