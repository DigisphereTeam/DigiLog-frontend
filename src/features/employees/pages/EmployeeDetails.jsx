import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Badge from "../../../components/Badge/Badge";
import StatCard from "../../../components/StatCard/StatCard";
import DataTable from "../../../components/DataTable/DataTable";
import TablePagination from "../../../components/TablePagination/TablePagination";
import { useEmployeeAttendance } from "../api/employeeApi";
import "./EmployeeDetails.css";

const PAGE_SIZE = 5;

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("employeeDetails"); // "employeeDetails" | "attendance" | "salaryBank"

  // Fetch data using the custom hook
  const { data: attendanceData, isLoading, isError } = useEmployeeAttendance(id);

  const { employee = {}, summary = { present: 0, late: 0, absent: 0 }, attendanceList = [] } = attendanceData || {};

  const {
    name = "N/A",
    empCode = "N/A",
    email = "N/A",
    designation = "N/A",
    departmentName = "N/A",
    phone = "N/A",
    dob = "N/A",
    status = "Active",
    joiningDate = "-",
    fingerprintRegistered = false,
    salary = {},
    bankDetails = {},
  } = employee;

  // Table Columns for Attendance
  const attendanceColumns = useMemo(
    () => [
      { key: "date", header: "DATE" },
      { key: "punchIn", header: "PUNCH IN" },
      { key: "punchOut", header: "PUNCH OUT" },
      { key: "hrs", header: "HRS" },
      {
        key: "status",
        header: "STATUS",
        render: (row) => {
          const variant =
            row.status === "Present"
              ? "success"
              : row.status === "Late"
                ? "warning"
                : "danger";
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
    ],
    [],
  );

  // Pagination Logic
  const totalRecords = attendanceList.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  const paginatedAttendanceHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return attendanceList.slice(startIndex, startIndex + PAGE_SIZE);
  }, [attendanceList, currentPage]);

  if (isLoading) {
    return (
      <div className="p-5 text-center bg-light min-vh-100">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading employee details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-5 text-center bg-light min-vh-100 text-danger">
        <p>Failed to load employee details. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="employee-details-container p-4 bg-light min-vh-100">
      {/* Top Header Title & Back Button */}
      <div className="department-employees-header mb-3">
        <h2 className="fw-bold text-dark mb-1">
          {name} ({empCode})
        </h2>
        <button
          type="button"
          className="department-back-button btn btn-link text-decoration-none p-0 mb-3"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="me-1" />
          Back to Employees
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="employee-tabs border-bottom mb-4">
        <ul className="nav nav-tabs border-0 gap-4">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link border-0 bg-transparent pb-3 fw-medium ${
                activeTab === "employeeDetails" ? "active text-dark border-bottom border-primary border-3" : "text-muted"
              }`}
              onClick={() => setActiveTab("employeeDetails")}
            >
              Employee Details
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link border-0 bg-transparent pb-3 fw-medium ${
                activeTab === "attendance" ? "active text-dark border-bottom border-primary border-3" : "text-muted"
              }`}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link border-0 bg-transparent pb-3 fw-medium ${
                activeTab === "salaryBank" ? "active text-dark border-bottom border-primary border-3" : "text-muted"
              }`}
              onClick={() => setActiveTab("salaryBank")}
            >
              Salary & Bank Details
            </button>
          </li>
        </ul>
      </div>

      {/* TAB 1: EMPLOYEE DETAILS */}
      {activeTab === "employeeDetails" && (
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
              <h6 className="text-uppercase text-muted small fw-bold mb-4 tracking-wider">
                Personal & Contact
              </h6>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Email</span>
                <span className="fw-medium text-dark">{email}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Phone</span>
                <span className="fw-medium text-dark">{phone}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Date of Birth</span>
                <span className="fw-medium text-dark">{dob}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Address</span>
                <span className="fw-medium text-dark">Vijayawada</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
              <h6 className="text-uppercase text-muted small fw-bold mb-4 tracking-wider">
                Job Profile
              </h6>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Employee Code</span>
                <span className="fw-medium text-dark">{empCode}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Designation</span>
                <span className="fw-medium text-dark">{designation}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Department</span>
                <span className="fw-medium text-dark">{departmentName}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Joining Date</span>
                <span className="fw-medium text-dark">{joiningDate}</span>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0 rounded-4 p-4 shadow-sm bg-white">
              <h6 className="text-uppercase text-muted small fw-bold mb-4 tracking-wider">
                Account Status
              </h6>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Status</span>
                <Badge variant={status === "Active" ? "success" : "danger"}>
                  {status}
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Fingerprint</span>
                <Badge variant={fingerprintRegistered ? "info" : "default"}>
                  {fingerprintRegistered ? "Registered" : "Not Registered"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="d-flex flex-column gap-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <StatCard title="Present" value={String(summary.present ?? 0)} />
            </div>
            <div className="col-12 col-md-4">
              <StatCard title="Late" value={String(summary.late ?? 0)} />
            </div>
            <div className="col-12 col-md-4">
              <StatCard title="Absent" value={String(summary.absent ?? 0)} />
            </div>
          </div>

          <div className="card border-0 rounded-4 p-4 shadow-sm bg-white overflow-hidden">
            <h5 className="fw-bold text-dark mb-3">Attendance History</h5>
            <DataTable
              columns={attendanceColumns}
              data={paginatedAttendanceHistory}
              rowKey="id"
              emptyMessage="No attendance history found."
            />
            <TablePagination
              page={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={PAGE_SIZE}
              onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            />
          </div>
        </div>
      )}

      {/* TAB 3: SALARY & BANK DETAILS */}
      {activeTab === "salaryBank" && (
        <div className="d-flex flex-column gap-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <StatCard 
                title="Net Salary" 
                value={`₹ ${Number(salary.net_salary || 0).toLocaleString()}`} 
              />
            </div>
            <div className="col-12 col-md-4">
              <StatCard 
                title="Basic Salary" 
                value={`₹ ${Number(salary.basic_salary || 0).toLocaleString()}`} 
              />
            </div>
            <div className="col-12 col-md-4">
              <StatCard 
                title="Deductions" 
                value={`₹ ${Number(salary.total_deductions || 0).toLocaleString()}`} 
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
                <h6 className="text-uppercase text-muted small fw-bold mb-4">Salary Structure</h6>
                <div className="d-flex justify-content-between mb-3 text-secondary">
                  <span>Basic Salary</span>
                  <span className="fw-medium text-dark">₹ {Number(salary.basic_salary || 0).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-secondary">
                  <span>Allowances (HRA + Travel + Other)</span>
                  <span className="fw-medium text-dark">
                    ₹ {Number((salary.hra || 0) + (salary.travel_allowance || 0) + (salary.other_allowances || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-secondary">
                  <span>Deductions</span>
                  <span className="fw-medium text-danger">- ₹ {Number(salary.total_deductions || 0).toLocaleString()}</span>
                </div>
                <hr className="my-3 text-muted" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-dark">Net Salary</span>
                  <span className="fw-bold text-success fs-5">₹ {Number(salary.net_salary || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 rounded-4 p-4 shadow-sm bg-white h-100">
                <h6 className="text-uppercase text-muted small fw-bold mb-4">Bank Details</h6>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Account Holder</span>
                  <span className="fw-medium text-dark">{bankDetails.account_holder_name || name}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Bank Name</span>
                  <span className="fw-medium text-dark">{bankDetails.bank_name || "-"}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Account Number</span>
                  <span className="fw-medium text-dark">{bankDetails.account_number || "-"}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">IFSC Code</span>
                  <span className="fw-medium text-dark">{bankDetails.ifsc_code || "-"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Branch</span>
                  <span className="fw-medium text-dark">{bankDetails.branch_name || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;