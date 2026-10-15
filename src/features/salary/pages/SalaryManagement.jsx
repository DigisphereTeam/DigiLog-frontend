import { FaClock, FaUsers } from "react-icons/fa";
import Button from "../../../components/Button/Button";
import StatCard from "../../../components/StatCard/StatCard";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import DataTable from "../../../components/DataTable/DataTable";
import TablePagination from "../../../components/TablePagination/TablePagination";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { FiCheck, FiEdit2, FiEye } from "react-icons/fi";
import AddSalaryModal from "../components/AddSalaryModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Salary.css";

const StaticSalaryData = {
  TotalEmployees: 13,
  NetPayroll: 315000,
  LOPDeductions: 7680,
  PendingPayments: 5,
};
const mockSalaryData = [
  {
    id: 1,
    employeeName: "Sravani Kotha",
    employeeCode: "240701",
    monthlyCTC: 50000,
    workingDays: 27,
    presentDays: 26,
    leavesTaken: 1,
    balanceLeft: 3.5,
    lopDays: 0,
    deductions: 0,
    totalSalary: 50000,
    status: "paid",
  },
  {
    id: 2,
    employeeName: "Ravi Teja Pasam",
    employeeCode: "240702",
    monthlyCTC: 40000,
    workingDays: 27,
    presentDays: 26,
    leavesTaken: 1,
    balanceLeft: 0,
    lopDays: 0,
    deductions: 0,
    totalSalary: 40000,
    status: "paid",
  },
  {
    id: 3,
    employeeName: "Lakshmi Prasanna",
    employeeCode: "240703",
    monthlyCTC: 33000,
    workingDays: 27,
    presentDays: 27,
    leavesTaken: 0,
    balanceLeft: 3,
    lopDays: 0,
    deductions: 0,
    totalSalary: 33000,
    status: "pending",
  },
  {
    id: 4,
    employeeName: "Ashokteja Ande",
    employeeCode: "240705",
    monthlyCTC: 45000,
    workingDays: 27,
    presentDays: 25,
    leavesTaken: 2,
    balanceLeft: 0,
    lopDays: 2,
    deductions: 2903,
    totalSalary: 42097,
    status: "pending",
  },
  {
    id: 5,
    employeeName: "Prasad Meragala",
    employeeCode: "240708",
    monthlyCTC: 40000,
    workingDays: 27,
    presentDays: 26,
    leavesTaken: 1,
    balanceLeft: 1,
    lopDays: 0,
    deductions: 0,
    totalSalary: 40000,
    status: "pending",
  },
  {
    id: 3,
    employeeName: "Lakshmi Prasanna",
    employeeCode: "240703",
    monthlyCTC: 33000,
    workingDays: 27,
    presentDays: 27,
    leavesTaken: 0,
    balanceLeft: 3,
    lopDays: 0,
    deductions: 0,
    totalSalary: 33000,
    status: "pending",
  },
  {
    id: 4,
    employeeName: "Ashokteja Ande",
    employeeCode: "240705",
    monthlyCTC: 45000,
    workingDays: 27,
    presentDays: 25,
    leavesTaken: 2,
    balanceLeft: 0,
    lopDays: 2,
    deductions: 2903,
    totalSalary: 42097,
    status: "pending",
  },
  {
    id: 5,
    employeeName: "Prasad Meragala",
    employeeCode: "240708",
    monthlyCTC: 40000,
    workingDays: 27,
    presentDays: 26,
    leavesTaken: 1,
    balanceLeft: 1,
    lopDays: 0,
    deductions: 0,
    totalSalary: 40000,
    status: "pending",
  },
];

const SalaryManagement = () => {
  const [data, setData] = useState(mockSalaryData);
  const [filters, setFilters] = useState({
    search: "",
    month: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();

  const handleOpenAddModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setSelectedRecord(employee);
    setIsModalOpen(true);
  };

  const handleSaveSalary = (salaryPayload) => {
    setData((prevData) => {
      const existingIndex = prevData.findIndex(
        (item) => item.employeeCode === salaryPayload.employeeCode,
      );

      if (existingIndex > -1) {
        // Update existing record
        const updated = [...prevData];
        updated[existingIndex] = {
          ...updated[existingIndex],
          deductions:
            salaryPayload.otherDeductions || updated[existingIndex].deductions,
          totalSalary:
            salaryPayload.netSalary || updated[existingIndex].totalSalary,
          status: "paid", // Mark as paid when processed
        };
        return updated;
      } else {
        // Add new record
        const newEntry = {
          id: Date.now(),
          employeeName: salaryPayload.employeeName || "Harsha Vardhan",
          employeeCode: salaryPayload.employeeCode,
          monthlyCTC: 25000,
          workingDays: 27,
          presentDays: 26.5,
          leavesTaken: 0.5,
          balanceLeft: 1,
          lopDays: salaryPayload.noLop ? 0 : 0,
          deductions: salaryPayload.otherDeductions || 0,
          totalSalary: salaryPayload.netSalary || 25000,
          status: "paid",
        };
        return [newEntry, ...prevData];
      }
    });

    setIsModalOpen(false);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      month: "",
      status: "",
    });
    setPage(1);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        row.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
        row.employeeCode.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status
        ? row.status === filters.status
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [data, filters]);

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  const toolbarFilters = [
    {
      name: "search",
      type: "search",
      Placeholder: "Type employee name or code...",
    },
    {
      name: "month",
      type: "month",
    },
    {
      name: "status",
      type: "select",
      Placeholder: "All Status",
      options: [
        {
          label: "Paid",
          value: "paid",
        },
        {
          label: "Pending",
          value: "pending",
        },
      ],
    },
  ];

  const handleViewSalary = (employee) => {
    navigate(`/employee-salary/${employee.id}`, { state: { employee } });
  };

  const handleEditSalary = (employee) => {
    handleOpenEditModal(employee);
  };

  const handleCreditSalary = (employee) => {
    if (employee.status === "active") {
      toast.error(`$(employee.employeeName)'s salary is already credited!`);
      return;
    }
    handleOpenEditModal(employee);
  };

  const salaryColumns = [
    {
      key: "employeeName",
      header: "EMPLOYEE",
      width: "200px",
      render: (row) => (
        <div className="salary-employee-cell">
          <div className="salary-employee-name">{row.employeeName}</div>

          <div className="salary-employee-code">Code: {row.employeeCode}</div>
        </div>
      ),
    },

    {
      key: "monthlyCTC",
      header: "MONTHLY CTC",
      width: "140px",
      render: (row) => formatCurrency(row.monthlyCTC),
    },

    {
      key: "workingDays",
      header: "WORKING DAYS",
      width: "130px",
    },

    {
      key: "presentDays",
      header: "PRESENT DAYS",
      width: "130px",
    },

    {
      key: "leavesTaken",
      header: "LEAVES TAKEN",
      width: "120px",
    },

    {
      key: "balanceLeft",
      header: "BALANCE LEFT",
      width: "120px",
    },

    {
      key: "lopDays",
      header: "LOP DAYS",
      width: "100px",
      render: (row) => (
        <span
          className={
            row.lopDays > 0
              ? "salary-lop-value salary-lop-value--danger"
              : "salary-lop-value"
          }
        >
          {row.lopDays}
        </span>
      ),
    },

    {
      key: "deductions",
      header: "DEDUCTIONS",
      width: "120px",
      render: (row) => (
        <span
          className={
            row.deductions > 0
              ? "salary-deduction-value"
              : "salary-deduction-value salary-deduction-value--zero"
          }
        >
          {row.deductions > 0
            ? `- ${formatCurrency(row.deductions)}`
            : formatCurrency(0)}
        </span>
      ),
    },

    {
      key: "totalSalary",
      header: "TOTAL SALARY",
      width: "130px",
      render: (row) => (
        <strong className="salary-total-value">
          {formatCurrency(row.totalSalary)}
        </strong>
      ),
    },

    {
      key: "status",
      header: "STATUS",
      width: "110px",
      render: (row) => (
        <span
          className={`salary-status-badge salary-status-badge--${row.status}`}
        >
          <span className="salary-status-dot">•</span>
          {row.status === "paid" ? "Paid" : "Pending"}
        </span>
      ),
    },

    {
      key: "actions",
      header: "ACTIONS",
      width: "130px",
      render: (row) => (
        <div className="salary-table-actions">
          <button
            type="button"
            className="salary-action-button"
            title="View salary"
            onClick={() => handleViewSalary(row)}
          >
            <FiEye />
          </button>

          <button
            type="button"
            className="salary-action-button"
            title="Edit salary"
            onClick={() => handleEditSalary(row)}
          >
            <FiEdit2 />
          </button>

          <button
            type="button"
            className="salary-action-button"
            title="Credit salary"
            onClick={() => handleCreditSalary(row)}
          >
            <FiCheck />
          </button>
        </div>
      ),
    },
  ];

  

  return (
    <div className="employee-management">
      <div className="department-content-header">
        <div>
          <h1>Salary Management</h1>
          <p>Manage employee salaries, payroll details, and salary records.</p>
        </div>
        <Button onClick={handleOpenAddModal}>Credit Salary</Button>
      </div>
      <div className="leaves-stats-grid">
        <StatCard
          title="Total Employees"
          value={StaticSalaryData.TotalEmployees}
          icon={FaUsers}
        />
        <StatCard title="Net Payroll" value={StaticSalaryData.NetPayroll} />
        <StatCard
          title="LOP Deductions"
          value={StaticSalaryData.LOPDeductions}
        />
        <StatCard
          title="Pending Payments"
          value={StaticSalaryData.PendingPayments}
          icon={FaClock}
        />
      </div>
      <div className="employee-content-card">
        <TableToolbar
          filters={toolbarFilters}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
        <DataTable columns={salaryColumns} data={paginatedData} rowKey="id" />
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </div>
      <AddSalaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSalary}
        employeeData={selectedRecord}
        employeesList={data}
      />
    </div>
  );
};

export default SalaryManagement;
