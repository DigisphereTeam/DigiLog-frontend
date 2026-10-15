import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiUserCheck, FiUsers } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import Avatar from "../../../components/Avatar/Avatar";
import Badge from "../../../components/Badge/Badge";
import DataTable from "../../../components/DataTable/DataTable";
import StatCard from "../../../components/StatCard/StatCard";
import TablePagination from "../../../components/TablePagination/TablePagination";

import "./DepartmentEmployees.css";
import { FaFingerprint } from "react-icons/fa";
import { useDepartments, useEmployeesByDepartment } from "../api/departmentApi";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const PAGE_SIZE = 10;

const DepartmentEmployees = () => {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { data: departments = [], isLoading: isDeptLoading } = useDepartments();
  const {
    data: employees = [],
    isLoading: isEmpLoading,
    isError,
  } = useEmployeesByDepartment(departmentId);
  const [page, setPage] = useState(1);

  const department = departments.find(
    (item) => String(item.id) === String(departmentId),
  );

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (emp) => emp.status === "Active",
  ).length;
  const fingerprintRegistered = employees.filter(
    (emp) => emp.fingerprint === "Registered",
  ).length;

  const totalPages = Math.ceil(totalEmployees / PAGE_SIZE);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return employees.slice(startIndex, endIndex);
  }, [employees, page]);
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }

    if (totalPages === 0 && page !== 1) {
      setPage(1);
    }
  }, [page, totalPages]);

  if (isDeptLoading || isEmpLoading) {
    return <LoadingSpinner message="Loading Department Details..." fullPage />;
  }

  if (isError || !department) {
    return (
      <div className="department-employees-empty">
        <h2>{isError ? "Error loading employees" : "Department not found"}</h2>

        <button type="button" onClick={() => navigate("/departments")}>
          Back to Departments
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: "employee",
      header: "Employee",
      width: "30%",
      render: (employee) => (
        <div className="department-employee-cell">
          <Avatar name={employee.name} />

          <div>
            <span className="department-employee-name">{employee.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "Emp ID",
      width: "18%",
    },
    {
        key: "empCode",
        header: "Emp Code",
      },
    {
      key: "designation",
      header: "Designation",
      width: "22%",
    },
    {
      key: "status",
      header: "Status",
      width: "15%",
      render: (employee) => (
        <Badge variant={employee.status === "Active" ? "success" : "danger"}>
          {employee.status}
        </Badge>
      ),
    },
    {
      key: "fingerprint",
      header: "Fingerprint",
      width: "15%",
      render: (employee) => (
        <Badge
          variant={employee.fingerprint === "Registered" ? "info" : "default"}
        >
          {employee.fingerprint}
        </Badge>
      ),
    },
  ];

  return (
    <div className="department-employees">
      <div className="department-employees-header">
        <h1>Department Employees</h1>

        <button
          type="button"
          className="department-back-button"
          onClick={() => navigate("/departments")}
        >
          <FiArrowLeft />
          Back to Departments
        </button>
      </div>

      <div className="department-employee-stats">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={FiUsers}
        />

        <StatCard title="Active" value={activeEmployees} icon={FiUserCheck} />

        <StatCard
          title="FP Registered"
          value={fingerprintRegistered}
          icon={FaFingerprint}
        />
      </div>

      <div className="employee-content-card">
        <DataTable columns={columns} data={paginatedEmployees} />

        <TablePagination
          page={page}
          totalPages={totalPages}
          totalRecords={totalEmployees}
          pageSize={PAGE_SIZE}
          onPrevious={() => {
            setPage((prev) => Math.max(prev - 1, 1));
          }}
          onNext={() => {
            setPage((prev) => Math.min(prev + 1, totalPages));
          }}
        />
      </div>
    </div>
  );
};

export default DepartmentEmployees;
