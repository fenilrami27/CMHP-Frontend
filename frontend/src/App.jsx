import {
  BrowserRouter,
} from 'react-router-dom'

import {
  AuthProvider,
} from './context/AuthProvider'

import {
  WorkspaceProvider,
} from './context/WorkspaceContext'

import AppRoutes from './routes/AppRoutes'

import './cmhp-reference.css'


export default function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <WorkspaceProvider>

          <AppRoutes />

        </WorkspaceProvider>

      </AuthProvider>

    </BrowserRouter>
  )
}