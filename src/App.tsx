import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AddNote from './pages/AddNote'
import ViewNote from './pages/ViewNote'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return !user ? <>{children}</> : <Navigate to="/" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/add-note" element={
              <PrivateRoute>
                <AddNote />
              </PrivateRoute>
            } />
            <Route path="/notes/:id" element={
              <PrivateRoute>
                <ViewNote />
              </PrivateRoute>
            } />
          </Routes>
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App