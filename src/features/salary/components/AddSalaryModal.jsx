import { useState, useEffect, useRef, useCallback } from "react";
import { FiCheck, FiCalendar, FiChevronDown } from "react-icons/fi";
import CommonModal from "../../../components/CommonModal/CommonModal";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useEmployeeList, useEmpInfo } from "../api/salaryApi";
import toast from "react-hot-toast";
import "./AddSalaryModal.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getYearsList = () => {
  const startYear = 2000;
  const endYear = 2100;
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  );
};

const parseMonthLabelToYYYYMM = (label) => {
  try {
    const [monthStr, yearStr] = label.split(" ");
    const monthIdx = MONTHS.indexOf(monthStr);
    if (monthIdx !== -1 && yearStr) {
      return `${yearStr}-${String(monthIdx + 1).padStart(2, "0")}`;
    }
  } catch (e) {}
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const parseYYYYMMToLabel = (yyyymm) => {
  try {
    const [yearStr, monthStr] = yyyymm.split("-");
    const monthIdx = parseInt(monthStr, 10) - 1;
    if (!isNaN(monthIdx) && MONTHS[monthIdx]) {
      return `${MONTHS[monthIdx]} ${yearStr}`;
    }
  } catch (e) {}
  return "Sep 2026";
};

const AddSalaryModal = ({ isOpen, onClose, onSave, employeeData = null }) => {
  const [month, setMonth] = useState("Sep 2026");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [noLop, setNoLop] = useState(false);
  const [approveFutureDays, setApproveFutureDays] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [reason, setReason] = useState("");

  // API 1: Lazy load employee list ONLY when dropdown is clicked
  const [hasOpenedEmpDropdown, setHasOpenedEmpDropdown] = useState(false);
  const { data: employeesList = [], isLoading: isEmpListLoading } =
    useEmployeeList(hasOpenedEmpDropdown);

  // Popover States & Refs
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const empDropdownRef = useRef(null);

  const rawYYYYMM = parseMonthLabelToYYYYMM(month); // e.g., "2026-09"
  const [yearStr, monthStr] = rawYYYYMM.split("-");
  const currentYear = parseInt(yearStr, 10) || new Date().getFullYear();
  const currentMonthIdx = parseInt(monthStr, 10) - 1 || 0;
  const yearsList = getYearsList();

  // API 2: Fetch specific employee details when ID or month changes
  const { data: empInfo, isLoading: isEmpInfoLoading } = useEmpInfo(
    selectedEmpId,
    rawYYYYMM,
  );

  const handleCloseDropdowns = useCallback(() => {
    setIsMonthPickerOpen(false);
    setIsEmpDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        empDropdownRef.current &&
        !empDropdownRef.current.contains(event.target)
      ) {
        handleCloseDropdowns();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleCloseDropdowns();
    };

    if (isMonthPickerOpen || isEmpDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMonthPickerOpen, isEmpDropdownOpen, handleCloseDropdowns]);

  const handleSelectMonth = (monthIndex) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, "0");
    setMonth(parseYYYYMMToLabel(`${currentYear}-${formattedMonth}`));
    setIsMonthPickerOpen(false);
  };

  const handleSelectYear = (year) => {
    const formattedMonth = String(currentMonthIdx + 1).padStart(2, "0");
    setMonth(parseYYYYMMToLabel(`${year}-${formattedMonth}`));
  };

  const resetForm = () => {
    setSelectedEmpId("");
    setNoLop(false);
    setApproveFutureDays(0);
    setOtherDeductions(0);
    setReason("");
    setMonth("Sep 2026");
    setHasOpenedEmpDropdown(false);
  };
  // Inside useEffect when editing/opening modal:
  useEffect(() => {
    if (employeeData) {
      // Ensure we capture employee_id correctly (fallback to id if needed)
      setSelectedEmpId(employeeData.employee_id || employeeData.id || "");
      setOtherDeductions(employeeData.deductions || 0);
      if (employeeData.month) setMonth(employeeData.month);
    } else {
      resetForm();
    }
  }, [employeeData, isOpen]);

  // Map API 2 response fields with fallbacks
  const monthlyCtc = empInfo?.current_ctc || 0;
  const annualCtc = empInfo?.annual_ctc || monthlyCtc * 12;
  const workingDays = empInfo?.working_days || 0;
  const presentDays = empInfo?.present_days || 0;
  const absentDays = empInfo?.absent_days || 0;
  const leavesTaken = empInfo?.leaves_taken || 0;
  const balanceLeft = empInfo?.available_leaves || 0;
  const baseLopDays = empInfo?.lop_days_before_hr || 0;

  const perDaySalary =
    workingDays > 0 ? Math.round(monthlyCtc / workingDays) : 0;
  const lopDays = noLop ? 0 : baseLopDays;
  const lopDeduction = lopDays * perDaySalary;
  const netSalary = monthlyCtc - lopDeduction - Number(otherDeductions || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetEmpId = selectedEmpId || employeeData?.employee_id;

    if (!targetEmpId) {
      toast.error("Please select an employee");
      return;
    }

    const payload = {
      salary_month: `${rawYYYYMM}-01`,
      working_days: workingDays,
      days_present: presentDays,
      leaves_taken: leavesTaken,
      available_leaves: balanceLeft,
      lop_days: lopDays,
      gross_amount: monthlyCtc,
      deductions: Number(otherDeductions || 0),
      hr_reason:
        reason ||
        "Approved leave days are within the employee's available leave balance.",
    };

    // Simply hand the data up to the parent component
    onSave(targetEmpId, payload);
  };

  const selectedEmployeeObj = (
    Array.isArray(employeesList) ? employeesList : []
  ).find((e) => String(e.employee_id) === String(selectedEmpId));

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeData ? "Edit Salary" : "Credit Salary"}
      subtitle="Pick an employee. Salary, attendance, and leave data are fetched automatically."
      primaryLabel="Save Salary"
      primaryIcon={FiCheck}
      formId="add-salary-form"
      secondaryLabel="Cancel"
      onSecondaryClick={onClose}
      maxWidth="620px"
    >
      <form
        id="add-salary-form"
        onSubmit={handleSubmit}
        className="salary-modal-form"
      >
        <div className="salary-modal-row">
          {/* Month Picker */}
          <div className="salary-form-group">
            <label className="salary-label">
              Salary Month <span className="required-star">*</span>
            </label>
            <div className="modal-month-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className={`modal-month-trigger ${isMonthPickerOpen ? "active" : ""}`}
                onClick={() => setIsMonthPickerOpen((prev) => !prev)}
              >
                <span className="month-trigger-content">
                  <FiCalendar className="modal-date-icon" />
                  <span>{month}</span>
                </span>
                <FiChevronDown className="modal-select-icon" />
              </button>

              {isMonthPickerOpen && (
                <div
                  className="month-picker-popover"
                  role="dialog"
                  aria-label="Month Picker"
                >
                  <div className="year-display-header">{currentYear}</div>
                  <div className="months-grid">
                    {MONTHS.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        className={`month-cell ${idx === currentMonthIdx ? "selected" : ""}`}
                        onClick={() => handleSelectMonth(idx)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="years-scroll-list">
                    {yearsList.map((y) => (
                      <button
                        key={y}
                        type="button"
                        className={`year-row ${y === currentYear ? "active" : ""}`}
                        onClick={() => handleSelectYear(y)}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Dropdown with Scroller (API 1 Lazy Loaded) */}
          <div className="salary-form-group">
            <label className="salary-label">
              Employee <span className="required-star">*</span>
            </label>
            <div className="modal-month-wrapper" ref={empDropdownRef}>
              <button
                type="button"
                className={`modal-month-trigger ${isEmpDropdownOpen ? "active" : ""}`}
                onClick={() => {
                  if (!employeeData) {
                    setHasOpenedEmpDropdown(true); // Triggers API 1 fetch on click
                    setIsEmpDropdownOpen((prev) => !prev);
                  }
                }}
                disabled={Boolean(employeeData)}
                style={{ cursor: employeeData ? "not-allowed" : "pointer" }}
              >
                <span className="month-trigger-content">
                  <span>
                    {selectedEmployeeObj
                      ? `${selectedEmployeeObj.employee_name} (${selectedEmployeeObj.employee_id})`
                      : isEmpListLoading
                        ? "Loading employees..."
                        : "Select Employee"}
                  </span>
                </span>
                <FiChevronDown className="modal-select-icon" />
              </button>

              {isEmpDropdownOpen && (
                <div
                  className="month-picker-popover employee-dropdown-popover"
                  role="dialog"
                >
                  <div
                    className="years-scroll-list"
                    style={{ maxHeight: "220px", overflowY: "auto" }}
                  >
                    <button
                      type="button"
                      className={`year-row ${!selectedEmpId ? "active" : ""}`}
                      onClick={() => {
                        setSelectedEmpId("");
                        setIsEmpDropdownOpen(false);
                      }}
                    >
                      Select Employee
                    </button>
                    {(Array.isArray(employeesList) ? employeesList : []).map(
                      (emp) => (
                        <button
                          key={emp.employee_id}
                          type="button"
                          className={`year-row ${String(emp.employee_id) === String(selectedEmpId) ? "active" : ""}`}
                          onClick={() => {
                            setSelectedEmpId(emp.employee_id);
                            setIsEmpDropdownOpen(false);
                          }}
                        >
                          {emp.employee_name} ({emp.employee_id})
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="salary-fetch-status">
          <span>
            {isEmpInfoLoading
              ? "Fetching attendance & salary records..."
              : "✓ Records updated"}
          </span>
        </div>

        {/* Salary Section */}
        <div className="section-title">SALARY</div>
        <div className="grid-2-cols mb-14">
          <div className="info-card">
            <small className="info-card-label">Annual CTC</small>
            <div className="info-card-value">{formatCurrency(annualCtc)}</div>
          </div>
          <div className="info-card">
            <small className="info-card-label">Monthly CTC</small>
            <div className="info-card-value">{formatCurrency(monthlyCtc)}</div>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="section-title">ATTENDANCE - {month.toUpperCase()}</div>
        <div className="grid-3-cols mb-14">
          <div className="info-card">
            <small className="info-card-label">Working days</small>
            <div className="info-card-value">{workingDays}</div>
          </div>
          <div className="info-card">
            <small className="info-card-label">Present days</small>
            <div className="info-card-value">{presentDays}</div>
          </div>
          <div className="info-card">
            <small className="info-card-label">Absent days</small>
            <div className="info-card-value">{absentDays}</div>
          </div>
        </div>

        {/* Leaves Section */}
        <div className="section-title">LEAVES - {month.toUpperCase()}</div>
        <div className="grid-3-cols mb-14">
          <div className="info-card">
            <small className="info-card-label">Leaves taken</small>
            <div className="info-card-value">{leavesTaken}</div>
          </div>
          <div className="info-card">
            <small className="info-card-label">Available Leaves</small>
            <div className="info-card-value">{balanceLeft}</div>
          </div>
          <div className="info-card">
            <small className="info-card-label">LOP days (before HR)</small>
            <div className="info-card-value">{baseLopDays}</div>
          </div>
        </div>

        {/* HR Adjustments */}
        <div className="section-title">HR ADJUSTMENT</div>
        <div className="hr-adjustment-box">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={noLop}
              onChange={(e) => setNoLop(e.target.checked)}
            />
            <span>
              No LOP for this month
              <small className="checkbox-subtext">
                No salary is deducted for unpaid leave.
              </small>
            </span>
          </label>
        </div>

        <div className="salary-modal-row">
          <div className="salary-form-group">
            <label className="salary-input-label">
              Approve future leave days
            </label>
            <input
              type="number"
              value={approveFutureDays}
              onChange={(e) => setApproveFutureDays(e.target.value)}
              placeholder="0"
              className="salary-input"
            />
          </div>
          <div className="salary-form-group">
            <label className="salary-input-label">
              Other deductions (₹), optional
            </label>
            <input
              type="number"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(e.target.value)}
              placeholder="0"
              className="salary-input"
            />
          </div>
        </div>

        <div className="salary-form-group mb-14">
          <label className="salary-input-label">Reason for HR approval</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required when No LOP or future leave is used"
            rows="2"
            className="salary-textarea"
          />
        </div>

        {/* Salary Summary */}
        <div className="section-title">SALARY SUMMARY</div>
        <div className="summary-box">
          <div className="summary-row">
            <span>Per-day salary</span>
            <strong>{formatCurrency(perDaySalary)}</strong>
          </div>
          <div className="summary-row">
            <span>LOP deduction</span>
            <strong>{formatCurrency(lopDeduction)}</strong>
          </div>
          <div className="summary-row">
            <span>Other deductions</span>
            <strong>{formatCurrency(otherDeductions || 0)}</strong>
          </div>
          <hr className="summary-divider" />
          <div className="summary-total-row">
            <span>Net salary</span>
            <span>{formatCurrency(netSalary)}</span>
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default AddSalaryModal;
