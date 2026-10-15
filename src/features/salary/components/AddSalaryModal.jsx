import { useState, useEffect } from "react";
import { FiRefreshCw, FiCheck } from "react-icons/fi";
import CommonModal from "../../../components/CommonModal/CommonModal";
import { formatCurrency } from "../../../utils/formatCurrency";

const AddSalaryModal = ({ isOpen, onClose, onSave, employeeData = null, employeesList = [] }) => {
  const [month, setMonth] = useState("Oct 2026");
  const [selectedEmpCode, setSelectedEmpCode] = useState("");
  const [noLop, setNoLop] = useState(false);
  const [approveFutureDays, setApproveFutureDays] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [reason, setReason] = useState("");

  // Find currently selected employee object from list
  const activeEmployee = employeesList.find(
    (emp) => emp.employeeCode === selectedEmpCode || emp.id === selectedEmpCode
  ) || employeeData || {};

  // Populate data when editing an existing record or opening modal
  useEffect(() => {
    if (employeeData) {
      setSelectedEmpCode(employeeData.employeeCode || "");
      setNoLop(employeeData.lopDays === 0 && employeeData.deductions > 0 ? false : employeeData.noLop || false);
      setApproveFutureDays(employeeData.extra || 0);
      setOtherDeductions(employeeData.deductions || 0);
      setReason(employeeData.reason || "");
    } else {
      resetForm();
    }
  }, [employeeData, isOpen]);

  const resetForm = () => {
    setSelectedEmpCode("");
    setNoLop(false);
    setApproveFutureDays(0);
    setOtherDeductions(0);
    setReason("");
  };

  // Dynamic calculations based on selected employee data
  const monthlyCtc = activeEmployee.monthlyCTC || 0;
  const annualCtc = monthlyCtc * 12;
  const workingDays = activeEmployee.workingDays || 27;
  const presentDays = activeEmployee.presentDays || 27;
  const leavesTaken = activeEmployee.leavesTaken || 0;
  const balanceLeft = activeEmployee.balanceLeft ?? 3;
  
  const perDaySalary = workingDays > 0 ? Math.round(monthlyCtc / workingDays) : 0;
  const lopDays = noLop ? 0 : (activeEmployee.lopDays || 0);
  const lopDeduction = lopDays * perDaySalary;
  const netSalary = monthlyCtc - lopDeduction - Number(otherDeductions || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      employeeCode: activeEmployee.employeeCode,
      employeeName: activeEmployee.employeeName,
      month,
      noLop,
      approveFutureDays,
      otherDeductions: Number(otherDeductions),
      netSalary,
    };
    onSave(payload);
    onClose();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeData ? "Edit Salary" : "Add Salary"}
      subtitle="Pick an employee. Salary, attendance, and leave data are fetched automatically."
      primaryLabel={employeeData ? "Save Changes" : "Save Salary"}
      primaryIcon={FiCheck}
      formId="add-salary-form"
      secondaryLabel="Cancel"
      onSecondaryClick={onClose}
      maxWidth="620px"
    >
      <form id="add-salary-form" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "12.5px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
              Salary Month <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #e3e9f0", padding: "0 10px" }}
            >
              <option value="Oct 2026">Oct 2026</option>
              <option value="Sep 2026">Sep 2026</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12.5px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
              Employee <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={selectedEmpCode}
              onChange={(e) => setSelectedEmpCode(e.target.value)}
              disabled={Boolean(employeeData)}
              style={{ width: "100%", height: "38px", borderRadius: "8px", border: "1px solid #e3e9f0", padding: "0 10px" }}
            >
              <option value="">Select Employee</option>
              {employeesList.map((emp) => (
                <option key={emp.id || emp.employeeCode} value={emp.employeeCode}>
                  {emp.employeeName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#0b5ca8", marginBottom: "14px" }}>
          <span>✓ Fetched just now</span>
          <button type="button" style={{ border: "none", background: "none", color: "#0b5ca8", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <FiRefreshCw /> Refresh data
          </button>
        </div>

        {/* Salary Section */}
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#5b6f86", marginBottom: "6px" }}>
          SALARY <span style={{ background: "#d9f3f7", color: "#1aa6bd", padding: "2px 6px", borderRadius: "10px", fontSize: "10px" }}>Employee module</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Annual CTC</small>
            <div style={{ fontWeight: "700", fontSize: "15px" }}>{formatCurrency(annualCtc)}</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Monthly CTC</small>
            <div style={{ fontWeight: "700", fontSize: "15px" }}>{formatCurrency(monthlyCtc)}</div>
          </div>
        </div>

        {/* Attendance Section */}
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#5b6f86", marginBottom: "6px" }}>
          ATTENDANCE - {month.toUpperCase()} <span style={{ background: "#d9f3f7", color: "#1aa6bd", padding: "2px 6px", borderRadius: "10px", fontSize: "10px" }}>Attendance module</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Working days</small>
            <div style={{ fontWeight: "700" }}>{workingDays}</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Present days</small>
            <div style={{ fontWeight: "700" }}>{presentDays}</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Absent days</small>
            <div style={{ fontWeight: "700" }}>{workingDays - presentDays}</div>
          </div>
        </div>

        {/* Leaves Section */}
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#5b6f86", marginBottom: "6px" }}>
          LEAVES - {month.toUpperCase()} <span style={{ background: "#d9f3f7", color: "#1aa6bd", padding: "2px 6px", borderRadius: "10px", fontSize: "10px" }}>Leave module</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Leaves taken</small>
            <div style={{ fontWeight: "700" }}>{leavesTaken}</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>Paid leave available</small>
            <div style={{ fontWeight: "700" }}>{balanceLeft}</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "8px 12px" }}>
            <small style={{ color: "#5b6f86", fontSize: "11px" }}>LOP days (before HR)</small>
            <div style={{ fontWeight: "700" }}>{activeEmployee.lopDays || 0}</div>
          </div>
        </div>

        {/* HR Adjustment */}
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#5b6f86", marginBottom: "6px" }}>HR ADJUSTMENT</div>
        <div style={{ border: "1px solid #e3e9f0", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px" }}>
          <label style={{ display: "flex", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
            <input type="checkbox" checked={noLop} onChange={(e) => setNoLop(e.target.checked)} />
            <span>
              No LOP for this month
              <small style={{ display: "block", color: "#5b6f86", fontWeight: "400", fontSize: "11px" }}>
                No salary is deducted for unpaid leave. The days still count against the leave balance.
              </small>
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Approve future leave days</label>
            <input
              type="number"
              value={approveFutureDays}
              onChange={(e) => setApproveFutureDays(e.target.value)}
              placeholder="0"
              style={{ width: "100%", height: "36px", borderRadius: "6px", border: "1px solid #e3e9f0", padding: "0 10px" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Other deductions (₹), optional</label>
            <input
              type="number"
              value={otherDeductions}
              onChange={(e) => setOtherDeductions(e.target.value)}
              placeholder="0"
              style={{ width: "100%", height: "36px", borderRadius: "6px", border: "1px solid #e3e9f0", padding: "0 10px" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Reason for HR approval</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required when No LOP or future leave is used"
            rows="2"
            style={{ width: "100%", borderRadius: "6px", border: "1px solid #e3e9f0", padding: "8px 10px" }}
          />
        </div>

        {/* Salary Summary */}
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#5b6f86", marginBottom: "6px" }}>SALARY SUMMARY</div>
        <div style={{ background: "#f8fafc", border: "1px solid #e3e9f0", borderRadius: "8px", padding: "10px 12px", fontSize: "12.5px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Per-day salary (Monthly CTC ÷ {workingDays} days)</span>
            <strong>{formatCurrency(perDaySalary)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>LOP days after HR adjustment</span>
            <strong>{lopDays}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>LOP deduction</span>
            <strong>{formatCurrency(lopDeduction)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Other deductions</span>
            <strong>{formatCurrency(otherDeductions || 0)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span>Leave balance carried to next month</span>
            <strong>{balanceLeft}</strong>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #e3e9f0", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700", color: "#0b5ca8" }}>
            <span>Net salary</span>
            <span>{formatCurrency(netSalary)}</span>
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default AddSalaryModal;