import { FaClock, FaUsers } from "react-icons/fa";
import Button from "../../../components/Button/Button";
import StatCard from "../../../components/StatCard/StatCard";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import DataTable from "../../../components/DataTable/DataTable";
import TablePagination from "../../../components/TablePagination/TablePagination";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { FiCheck, FiEdit2, FiEye } from "react-icons/fi";
import netSalaryIcon from "../../../assets/icons/salary/net-salary-icon.svg"
import lopIcon from "../../../assets/icons/salary/lop-icon.svg"
import AddSalaryModal from "../components/AddSalaryModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAllEmployees, useCreditSalary,  } from "../api/salaryApi";
import "./Salary.css";

const SalaryManagement = () => {
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

  // Fetch data using the custom hook with filters
  const { data: apiResponse, isLoading, isError } = useAllEmployees(filters);

  // Extract processed data and statistics safely from the hook result
  const rawData = apiResponse?.data || [];
  const statistics = apiResponse?.statistics || {
    total_employees: 0,
    net_payroll: 0,
    lop_deductions: 0,
    pending_payments: 0,
  };

  const creditSalaryMutation = useCreditSalary();

  const handleSaveSalary = (employeeId, salaryPayload) => {
    creditSalaryMutation.mutate(
      { employeeId, payload: salaryPayload },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Salary credited successfully!");
          setIsModalOpen(false); // Close modal on success
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to credit salary.");
        },
      }
    );
  };

  const handleOpenAddModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setSelectedRecord(employee);
    setIsModalOpen(true);
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

  // Client-side filtering fallback for search/status if needed
  const filteredData = useMemo(() => {
    return rawData.filter((row) => {
      const name = row.employee_name || "";
      const code = row.emp_code || "";
      const matchesSearch =
        name.toLowerCase().includes(filters.search.toLowerCase()) ||
        code.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status
        ? row.salary_status?.toLowerCase() === filters.status.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [rawData, filters]);

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
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
      ],
    },
  ];

  const handleViewSalary = (employee) => {
    navigate(`/employee-salary/${employee.employee_id}`, { state: { employee } });
  };

  const handleEditSalary = (employee) => {
    handleOpenEditModal(employee);
  };

  const handleCreditSalary = (employee) => {
    if (employee.salary_status?.toLowerCase() === "paid") {
      toast.error(`${employee.employee_name}'s salary is already credited!`);
      return;
    }
    handleOpenEditModal(employee);
  };

  const salaryColumns = [
    {
      key: "employee_name",
      header: "EMPLOYEE",
      width: "200px",
      render: (row) => (
        <div className="salary-employee-cell">
          <div className="salary-employee-name">{row.employee_name}</div>
          <div className="salary-employee-code">Code: {row.emp_code || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "monthly_ctc",
      header: "MONTHLY CTC",
      width: "140px",
      render: (row) => formatCurrency(row.monthly_ctc),
    },
    {
      key: "working_days",
      header: "WORKING DAYS",
      width: "130px",
    },
    {
      key: "present_days",
      header: "PRESENT DAYS",
      width: "130px",
    },
    {
      key: "leaves_taken",
      header: "LEAVES TAKEN",
      width: "120px",
    },
    {
      key: "available_leaves",
      header: "BALANCE LEFT",
      width: "120px",
    },
    {
      key: "lop_days",
      header: "LOP DAYS",
      width: "100px",
      render: (row) => (
        <span
        className={
            row.lop_days > 0
              ? "salary-lop-value salary-lop-value--danger"
              : "salary-lop-value"
          }
        >
          {row.lop_days}
        </span>
      ),
    },
    {
      key: "deduction",
      header: "DEDUCTIONS",
      width: "120px",
      render: (row) => (
        <span
          className={
            row.deduction > 0
              ? "salary-deduction-value"
              : "salary-deduction-value salary-deduction-value--zero"
          }
        >
          {row.deduction > 0
            ? `- ${formatCurrency(row.deduction)}`
            : formatCurrency(0)}
        </span>
      ),
    },
    {
      key: "net_amount",
      header: "TOTAL SALARY",
      width: "130px",
      render: (row) => (
        <strong className="salary-total-value">
          {formatCurrency(row.net_amount)}
        </strong>
      ),
    },
    {
      key: "salary_status",
      header: "STATUS",
      width: "110px",
      render: (row) => {
        const isPaid = row.salary_status?.toLowerCase() === "paid";
        return (
          <span className={`salary-status-badge salary-status-badge--${isPaid ? "paid" : "pending"}`}>
            <span className="salary-status-dot">•</span>
            {isPaid ? "Paid" : "Pending"}
          </span>
        );
      },
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
          value={isLoading ? "..." : statistics.total_employees}
          icon={FaUsers}
        />
        <StatCard
          title="Net Payroll"
          value={isLoading ? "..." : formatCurrency(statistics.net_payroll)}
          icon={netSalaryIcon}
        />
        <StatCard
          title="LOP Deductions"
          value={isLoading ? "..." : formatCurrency(statistics.lop_deductions)}
          icon={lopIcon}
        />
        <StatCard
          title="Pending Payments"
          value={isLoading ? "..." : statistics.pending_payments}
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
        
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading salary records...
          </div>
        ) : (
          <DataTable columns={salaryColumns} data={paginatedData} rowKey="employee_id" />
        )}

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
      />
    </div>
  );
};

export default SalaryManagement;