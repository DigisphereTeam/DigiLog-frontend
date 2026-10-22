import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layout/AppLayout";

import DepartmentManagement from "../features/departments/pages/DepartmentManagement";
import DepartmentEmployees from "../features/departments/pages/DepartmentEmployees";
import EmployeeManagement from "../features/employees/pages/EmployeeManagement";
import EmployeeDetails from "../features/employees/pages/EmployeeDetails";
import BiometricEnrollment from "../features/biometric/pages/BiometricEnrollment";
import AttendanceHistory from "../features/biometric/pages/AttendanceHistory";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Reports from "../features/reports/pages/Reports";
import Login from "../features/auth/pages/Login";
import LeaveManagement from "../features/leaves/pages/LeaveManagement";
import EmployeeLeaves from "../features/leaves/pages/EmployeeLeaves";
import Calendar from "../features/calendar/pages/Calendar";
import Expenditure from "../features/expenditure/pages/Expenditure";
import Shifts from "../features/shifts/pages/Shifts";

// Guards
import { ProtectedRoute, RoleGuard, RootRedirect } from "./ProtectedRoute";
import EmployeeSalary from "../features/salary/pages/EmployeeSalary";
import SalaryManagement from "../features/salary/pages/SalaryManagement";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Must be logged in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* Root Path Handler based on Role */}
          <Route path="/" element={<RootRedirect />} />

           {/* SHARED MODULES (Both Admin & Employee)  */}        
          <Route element={<RoleGuard allowedRoles={["admin", "employee"]} />}>
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/attendance-history" element={<AttendanceHistory />} />
            <Route path="/shifts" element={<Shifts />} />
          </Route>

          {/* EMPLOYEE ONLY MODULES     */}       
          <Route element={<RoleGuard allowedRoles={["employee"]} />}>
            <Route path="/leaves" element={<EmployeeLeaves />} />
            <Route path="/employee-salary" element={<EmployeeSalary />} />
          </Route>

          {/* ADMIN ONLY MODULES                                          */}
          <Route element={<RoleGuard allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<DepartmentManagement />} />
            <Route path="/departments/:departmentId/employees" element={<DepartmentEmployees />} />
            <Route path="/biometrics" element={<BiometricEnrollment />} />
            <Route path="/leave-management" element={<LeaveManagement />} />
            <Route path="/salary-management" element={<SalaryManagement />} />
            <Route path="/expenditure" element={<Expenditure />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;