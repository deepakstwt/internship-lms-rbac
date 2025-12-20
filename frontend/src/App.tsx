import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourse from './pages/StudentCourse';
import MentorDashboard from './pages/MentorDashboard';
import MentorCourse from './pages/MentorCourse';
import AdminDashboard from './pages/AdminDashboard';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/student" replace />;
  }
  if (user?.role === 'mentor') {
    return <Navigate to="/mentor" replace />;
  }
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <LandingPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/course/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCourse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/course/:courseId"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorCourse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

