import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PublicStoryDetailPage from '../pages/PublicStoryDetailPage';
import PublicChapterDetailPage from '../pages/PublicChapterDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import StoryManagementPage from '../pages/admin/StoryManagementPage';
import StoryDetailPage from '../pages/admin/StoryDetailPage';
import StoryFormPage from '../pages/admin/StoryFormPage';
import ChapterManagementPage from '../pages/admin/ChapterManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import VipManagementPage from '../pages/admin/VipManagementPage';
import BannedWordManagementPage from '../pages/admin/BannedWordManagementPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import MainLayout from '../layouts/MainLayout';
import AdminRoute from './AdminRoute';
import SearchPage from '../pages/SearchPage/SearchPage';
import AccountSettingsPage from '../pages/AccountSettingsPage';
import BookshelfPage from '../pages/BookshelfPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentCancelPage from '../pages/PaymentCancelPage';
import OAuth2RedirectHandler from '../pages/OAuth2RedirectHandler';

const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/stories/:storyId',
        element: <PublicStoryDetailPage />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: '/account-settings',
            element: <AccountSettingsPage />,
          },
          {
            path: '/bookshelf',
            element: <BookshelfPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/stories/:storyId/chapters/:chapterId',
    element: <PublicChapterDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/oauth2/redirect',
    element: <OAuth2RedirectHandler />,
  },
  {
    path: '/payment/success',
    element: <PaymentSuccessPage />,
  },
  {
    path: '/payment/cancel',
    element: <PaymentCancelPage />,
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: '/admin/dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: '/admin/stories',
        element: <StoryManagementPage />,
      },
      {
        path: '/admin/stories/new',
        element: <StoryFormPage />,
      },
      {
        path: '/admin/stories/:storyId',
        element: <StoryDetailPage />,
      },
      {
        path: '/admin/stories/:storyId/edit',
        element: <StoryFormPage />,
      },
      {
        path: '/admin/stories/:storyId/chapters',
        element: <ChapterManagementPage />,
      },
      {
        path: '/admin/categories',
        element: <CategoryManagementPage />,
      },
      {
        path: '/admin/vip',
        element: <VipManagementPage />,
      },
      {
        path: '/admin/banned-words',
        element: <BannedWordManagementPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);