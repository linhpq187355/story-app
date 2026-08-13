import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './App.css'

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'))

  return <RouterProvider router={router} />
}

export default App
