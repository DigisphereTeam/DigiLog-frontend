import { useState, useMemo } from "react";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCheck,
} from "react-icons/fi";

import StatCard from "../../../components/StatCard/StatCard";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import DataTable from "../../../components/DataTable/DataTable";
import Badge from "../../../components/Badge/Badge";
import TablePagination from "../../../components/TablePagination/TablePagination";
import CommonModal from "../../../components/CommonModal/CommonModal";
import Button from "../../../components/Button/Button";

import { useAuth } from "../../../features/auth/context/AuthContext";

import {
  getCurrentFinancialYear,
  generateFinancialYears,
  getFinancialYearRange,
} from "../../../utils/financialYear";

import { useEmployeeLeaves, useApplyLeave } from "../api/leaveApi";

import "./EmployeeLeaves.css";

const PAGE_SIZE = 10;

const LEAVE_TYPES = [
  { id: "Sick Leave", name: "Sick Leave" },
  { id: "Casual Leave", name: "Casual Leave" },
  { id: "Optional Holidays", name: "Optional Holidays" },
];

const INITIAL_FORM_STATE = {
  leaveType: "Sick Leave",
  startDate: "",
  endDate: "",
  dayType: "full",
  reason: "",
};

const formatDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) return "N/A";

  const start = new Date(fromDate).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });

  const end = new Date(toDate).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return `${start} – ${end}`;
};

const formatAppliedOn = (dateStr) => {
  if (!dateStr) return "N/A";

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getBadgeVariant = (status) => {
  switch (status) {
    case "Approved":
      return "info";
    case "Pending":
      return "warning";
    case "Rejected":
      return "danger";
    default:
      return "default";
  }
};

const EmployeeLeaves = ({ currentEmployeeId, isHRView = false }) => {
  const { user } = useAuth();

  // If currentEmployeeId is passed, use that employee.
  // Otherwise, use the currently logged-in employee.
  const activeEmployeeId =
    currentEmployeeId || user?.employee_id || user?.id || user?.employeeId;

  const { data: apiResponse, isLoading } = useEmployeeLeaves(activeEmployeeId);

  const applyLeaveMutation = useApplyLeave();

  const rawLeaves = apiResponse?.leaves || [];
  const dashboardStats = apiResponse?.dashboard || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const currentFY = useMemo(() => getCurrentFinancialYear(), []);
  const financialYearOptions = useMemo(() => generateFinancialYears(5), []);

  const [filterValues, setFilterValues] = useState({
    search: "",
    leaveType: "",
    status: "",
    financialYear: currentFY,
  });

  const [page, setPage] = useState(1);

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({
      search: "",
      leaveType: "",
      status: "",
      financialYear: currentFY,
    });

    setPage(1);
  };

  // --- Modal Handlers ---
  const handleOpenAdd = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "reason" && value.length > 300) return;

    setFormData((prev) => {
      const nextForm = { ...prev, [name]: value };

      if (
        name === "startDate" &&
        prev.endDate &&
        new Date(value) > new Date(prev.endDate)
      ) {
        nextForm.endDate = value;
      }

      return nextForm;
    });
  };

  const calculateTotalDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    const diffTime = end.getTime() - start.getTime();

    if (diffTime < 0) return 0;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return formData.dayType === "half" ? diffDays * 0.5 : diffDays;
  };

  const totalDays = calculateTotalDays();

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const payload = {
      employee_id: activeEmployeeId,
      from_date: formData.startDate,
      to_date: formData.endDate,
      leave_type: formData.leaveType,
      duration: totalDays,
      description: formData.reason,
    };

    applyLeaveMutation.mutate(payload, {
      onSuccess: () => {
        handleModalClose();
      },
    });
  };

  // --- Filtering & Pagination ---
  const leavesInSelectedFY = useMemo(() => {
    const range = getFinancialYearRange(filterValues.financialYear);

    if (!range) return rawLeaves;

    return rawLeaves.filter((leave) => {
      const leaveStartDate = leave.from_date
        ? leave.from_date.split("T")[0]
        : "";

      return leaveStartDate >= range.start && leaveStartDate <= range.end;
    });
  }, [rawLeaves, filterValues.financialYear]);

  const filteredLeaves = useMemo(() => {
    const search = filterValues.search.toLowerCase();

    return leavesInSelectedFY.filter((leave) => {
      const reason = leave.description || "";
      const leaveType = leave.leave_type || "";

      const matchesSearch =
        !search ||
        reason.toLowerCase().includes(search) ||
        leaveType.toLowerCase().includes(search);

      const matchesLeaveType =
        !filterValues.leaveType || leave.leave_type === filterValues.leaveType;

      const matchesStatus =
        !filterValues.status || leave.status === filterValues.status;

      return matchesSearch && matchesLeaveType && matchesStatus;
    });
  }, [
    leavesInSelectedFY,
    filterValues.search,
    filterValues.leaveType,
    filterValues.status,
  ]);

  const paginatedLeaves = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;

    return filteredLeaves.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLeaves, page]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / PAGE_SIZE));

  const columns = useMemo(
    () => [
      {
        key: "leave_type",
        header: "LEAVE TYPE",
        render: (row) => (
          <div className="leave-type-cell">
            <div className="leave-icon-badge">
              <FiCalendar />
            </div>

            <div>
              <div className="leave-title">{row.leave_type}</div>
            </div>
          </div>
        ),
      },
      {
        key: "duration",
        header: "DURATION",
        render: (row) => (
          <span className="text-bold">
            {row.duration} {Number(row.duration) === 1 ? "day" : "days"}
          </span>
        ),
      },
      {
        key: "dateRange",
        header: "DATE RANGE",
        render: (row) => (
          <span className="text-bold">
            {formatDateRange(row.from_date, row.to_date)}
          </span>
        ),
      },
      {
        key: "description",
        header: "REASON / NOTES",
        render: (row) => (
          <span className="text-muted">{row.description || "N/A"}</span>
        ),
      },
      {
        key: "created_at",
        header: "APPLIED ON",
        render: (row) => (
          <span className="text-muted">{formatAppliedOn(row.created_at)}</span>
        ),
      },
      {
        key: "status",
        header: "STATUS",
        render: (row) => (
          <Badge variant={getBadgeVariant(row.status)}>
            <span className="status-dot">●</span> {row.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  const filterConfig = useMemo(
    () => [
      {
        type: "search",
        name: "search",
        placeholder: "Search leave reason or type...",
      },
      {
        type: "select",
        name: "leaveType",
        placeholder: "All Leave Types",
        options: [
          {
            label: "Sick Leave",
            value: "Sick Leave",
          },
          {
            label: "Casual Leave",
            value: "Casual Leave",
          },
          {
            label: "Optional Holidays",
            value: "Optional Holidays",
          },
        ],
      },
      {
        type: "select",
        name: "status",
        placeholder: "All Status",
        options: [
          {
            label: "Pending",
            value: "Pending",
          },
          {
            label: "Approved",
            value: "Approved",
          },
          {
            label: "Rejected",
            value: "Rejected",
          },
        ],
      },
      {
        type: "select",
        name: "financialYear",
        placeholder: "Select FY",
        options: financialYearOptions,
      },
    ],
    [financialYearOptions],
  );

  return (
    <div className="department-management">
      {!isHRView && (
        <div className="department-content-header">
          <div>
            <h1>My Leaves</h1>
            <p>Track your leave history and submit new leave requests.</p>
          </div>

          <Button icon={FiPlus} onClick={handleOpenAdd}>
            Apply Leave
          </Button>
        </div>
      )}

      <div className="leaves-stats-grid">
        <StatCard
          title="TOTAL LEAVES"
          value={dashboardStats.total_leaves ?? 0}
          icon={FiCalendar}
        />

        <StatCard
          title="AVAILABLE LEAVES"
          value={dashboardStats.available_leaves ?? 0}
          icon={FiClock}
        />

        <StatCard
          title="PENDING REQUESTS"
          value={dashboardStats.pending_requests ?? 0}
          icon={FiCheckCircle}
        />

        <StatCard
          title="CONSUMED LEAVES"
          value={dashboardStats.consumed_leaves ?? 0}
          icon={FiXCircle}
        />
      </div>

      <div className="leaves-table-card">
        <TableToolbar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {isLoading ? (
          <div className="text-center py-5 text-muted">
            {isHRView ? "Loading employee leaves..." : "Loading my leaves..."}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedLeaves}
              rowKey="leave_id"
            />

            <TablePagination
              page={page}
              totalPages={totalPages}
              totalRecords={filteredLeaves.length}
              pageSize={PAGE_SIZE}
              onPrevious={() => setPage((p) => Math.max(p - 1, 1))}
              onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
            />
          </>
        )}
      </div>

      {/* Apply Leave Modal - Employee only */}
      {!isHRView && (
        <CommonModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title="Apply for Leave"
          subtitle="Submit a new leave request for approval"
        >
          <form onSubmit={handleFormSubmit}>
            <div className="d-flex flex-column gap-3">
              {/* Leave Type */}
              <div>
                <label className="form-label fw-semibold small text-secondary mb-1">
                  Leave Type <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select shadow-none"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleFormChange}
                  required
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold small text-secondary mb-1">
                    Start Date <span className="text-danger">*</span>
                  </label>

                  <div className="position-relative">
                    <FiCalendar className="date-icon" />

                    <input
                      type="date"
                      className="form-control ps-5 shadow-none"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold small text-secondary mb-1">
                    End Date <span className="text-danger">*</span>
                  </label>

                  <div className="position-relative">
                    <FiCalendar className="date-icon" />

                    <input
                      type="date"
                      className="form-control ps-5 shadow-none"
                      min={formData.startDate}
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Day Type */}
              <div className="bg-light border rounded p-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex gap-3">
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input shadow-none"
                      type="radio"
                      name="dayType"
                      id="fullDay"
                      value="full"
                      checked={formData.dayType === "full"}
                      onChange={handleFormChange}
                    />

                    <label
                      className="form-check-label small fw-medium text-secondary"
                      htmlFor="fullDay"
                    >
                      Full Day
                    </label>
                  </div>

                  <div className="form-check mb-0">
                    <input
                      className="form-check-input shadow-none"
                      type="radio"
                      name="dayType"
                      id="halfDay"
                      value="half"
                      checked={formData.dayType === "half"}
                      onChange={handleFormChange}
                    />

                    <label
                      className="form-check-label small fw-medium text-secondary"
                      htmlFor="halfDay"
                    >
                      Half Day
                    </label>
                  </div>
                </div>

                <span className="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">
                  Total: {totalDays}{" "}
                  {totalDays === 1 ? "Working Day" : "Working Days"}
                </span>
              </div>

              {/* Reason */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold small text-secondary mb-0">
                    Reason for Leave <span className="text-danger">*</span>
                  </label>

                  <span className="text-muted fs-xs">
                    {formData.reason.length} / 300
                  </span>
                </div>

                <textarea
                  className="form-control shadow-none"
                  rows={3}
                  name="reason"
                  placeholder="Enter details regarding your leave request..."
                  value={formData.reason}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="pt-3 d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleModalClose}
                disabled={applyLeaveMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                icon={FiCheck}
                disabled={applyLeaveMutation.isPending}
              >
                {applyLeaveMutation.isPending
                  ? "Submitting..."
                  : "Submit Request"}
              </Button>
            </div>
          </form>
        </CommonModal>
      )}
    </div>
  );
};

export default EmployeeLeaves;
