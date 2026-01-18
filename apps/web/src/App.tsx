import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './lib/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import TagPage from './pages/TagPage';
import TagsPage from './pages/TagsPage';
import AuthorPage from './pages/AuthorPage';
import AuthorsPage from './pages/AuthorsPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import { api } from './lib/api';
import ProtectedRoute from './components/ProtectedRoute';
import { UserPrivate, Role } from '@systemink/shared';

function App() {
  const { setUser, setTokens, isDarkMode } = useAuthStore();

  useEffect(() => {
    // Initialize dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Check auth on mount
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      api
        .get<UserPrivate>('/auth/me')
        .then((user) => {
          setUser(user);
          const token = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          if (token && refreshToken) {
            setTokens(token, refreshToken);
          }
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setTokens(null, null);
        });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/post/:slug" element={<PostPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/tag/:slug" element={<TagPage />} />
        <Route path="/authors" element={<AuthorsPage />} />
        <Route path="/author/:username" element={<AuthorPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/new"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role={Role.ADMIN}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
