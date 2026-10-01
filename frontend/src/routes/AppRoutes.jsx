import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import ProtectedRoute
  from './ProtectedRoute'

import PublicRoute
  from './PublicRoute'

import MainLayout
  from '../Layouts/MainLayout'

import Login
  from '../features/auth/Login'

import Dashboard
  from '../features/dashboard/Dashboard'

import Inventory
  from '../features/inventory/Inventory'

import Companies
  from '../features/companies/Companies'

import Operations
  from '../features/operations/Operations'

import Orders
  from '../features/operations/Orders'

import Quality
  from '../features/quality/Quality'

import Invoice
  from '../features/invoice/Invoice'

import SupplyChain
  from '../features/supplyChain/SupplyChain'

import WorkspaceSelection
  from '../features/workspace/WorkspaceSelection'

import HrDashboard
  from '../features/hrms/HrDashboard'

import Employees
  from '../features/hrms/Employees'

import Attendance
  from '../features/hrms/Attendance'

import Leave
  from '../features/hrms/Leave'

import Holidays
  from '../features/hrms/Holidays'

import Shifts
  from '../features/hrms/Shifts'

import Designations
  from '../features/hrms/Designations'

import Payroll
  from '../features/hrms/Payroll'

import HrReports
  from '../features/hrms/HrReports'

import Profile
  from '../features/profile/Profile'


export default function AppRoutes() {

  return (

    <Routes>

      {/* ROOT */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* PUBLIC */}

      <Route
        element={
          <PublicRoute />
        }
      >

        <Route
          path="/login"
          element={
            <Login />
          }
        />

      </Route>


      {/* PROTECTED */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          path="/workspace-select"
          element={
            <WorkspaceSelection />
          }
        />


        <Route
          element={
            <MainLayout />
          }
        >

          {/* PROFILE */}

          <Route
            path="/profile"
            element={
              <Profile />
            }
          />


          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />


          {/* USER MANAGEMENT */}

          <Route
            path="/companies"
            element={
              <Companies />
            }
          />


          {/* INVENTORY */}

          <Route
            path="/inventory/*"
            element={
              <Inventory />
            }
          />


          {/* OPERATIONS */}

          <Route
            path="/operations"
            element={
              <Operations />
            }
          />


          <Route
            path="/orders"
            element={
              <Orders />
            }
          />


          <Route
            path="/quality"
            element={
              <Quality />
            }
          />


          <Route
            path="/invoices"
            element={
              <Invoice />
            }
          />


          <Route
            path="/supply-chain"
            element={
              <SupplyChain />
            }
          />

          <Route
            path="/customer-management"
            element={
              <Operations
                standaloneCustomers
              />
            }
          />


          {/* HRMS */}

          <Route
            path="/hrms"
            element={
              <HrDashboard />
            }
          />


          <Route
            path="/hrms/employees"
            element={
              <Employees />
            }
          />


          <Route
            path="/hrms/attendance"
            element={
              <Attendance />
            }
          />


          <Route
            path="/hrms/leave"
            element={
              <Leave />
            }
          />


          <Route
            path="/hrms/holidays"
            element={
              <Holidays />
            }
          />


          <Route
            path="/hrms/shifts"
            element={
              <Shifts />
            }
          />


          <Route
            path="/hrms/designations"
            element={
              <Designations />
            }
          />


          <Route
            path="/hrms/payroll"
            element={
              <Payroll />
            }
          />


          <Route
            path="/hrms/reports"
            element={
              <HrReports />
            }
          />

        </Route>

      </Route>


      {/* FALLBACK */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>

  )

}