import { useState, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ConfirmDialogProvider } from './contexts/ConfirmDialog'
import './App.css'

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <ConfirmDialogProvider>
      <RouterProvider router={router} />
    </ConfirmDialogProvider>
  )
}

export default App
