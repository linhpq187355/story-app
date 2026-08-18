import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import PublicStoryDetailPage from '../pages/PublicStoryDetailPage'
import PublicChapterDetailPage from '../pages/PublicChapterDetailPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import StoryManagementPage from '../pages/admin/StoryManagementPage'
import StoryDetailPage from '../pages/admin/StoryDetailPage'
import StoryFormPage from '../pages/admin/StoryFormPage'
import ChapterManagementPage from '../pages/admin/ChapterManagementPage'
import CategoryManagementPage from '../pages/admin/CategoryManagementPage'
import AdminRoute from './AdminRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/stories/:storyId',
    element: <PublicStoryDetailPage />,
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
    element: <AdminRoute />,
    children: [
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
        element: <StoryFormPage />, // Route cho trang Sửa truyện (lấy ID từ URL)
      },
      {
        path: '/admin/stories/:storyId/chapters',
        element: <ChapterManagementPage />,
      },
      {
        path: '/admin/categories',
        element: <CategoryManagementPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
])