import { useState, useEffect } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import CommonModal from "../../../components/CommonModal/CommonModal";
import "./EmployeeModal.css";

const EmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  departmentOptions = [],
  isEditing = false,
  isSubmitting = false,
}) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Employee" : "Add Employee"}
      subtitle="Fill in employee personal, professional, salary, and bank details."
      primaryLabel={isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Save Employee"}
      primaryIcon={FiCheck}
      formId="employee-form"
      secondaryLabel="Cancel"
      onSecondaryClick={onClose}
      maxWidth="620px"
    >
      <form id="employee-form" onSubmit={handleSubmit}>
        
        {/* --- SECTION 1: EMPLOYEE DETAILS --- */}
        <div className="emp-section-title">
          EMPLOYEE DETAILS <span className="emp-section-badge">Personal & Job Info</span>
        </div>
        
        <div className="emp-form-grid">
          <div className="emp-form-group">
            <label htmlFor="name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData?.name || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="empCode">
              Employee Code <span className="required-star">*</span>
            </label>
            <input
              id="empCode"
              name="empCode"
              type="text"
              placeholder="e.g. EMP1001"
              value={formData?.empCode || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="email">
              Email <span className="required-star">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. employee@example.com"
              value={formData?.email || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="department">
              Department <span className="required-star">*</span>
            </label>
            <div className="emp-select-wrapper">
              <select
                id="department"
                name="department"
                value={formData?.department || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departmentOptions.map((dept) => (
                  <option key={dept.value || dept.id} value={dept.value || dept.id}>
                    {dept.label || dept.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="emp-select-icon" />
            </div>
          </div>

          <div className="emp-form-group">
            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              type="text"
              placeholder="e.g. Software Developer"
              value={formData?.designation || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="phone">
              Mobile Number <span className="required-star">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={formData?.phone || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="dob">
              Date of Birth <span className="required-star">*</span>
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData?.dob || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="joiningDate">
              Joining Date <span className="required-star">*</span>
            </label>
            <input
              id="joiningDate"
              name="joiningDate"
              type="date"
              value={formData?.joiningDate || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="status">Status</label>
            <div className="emp-select-wrapper">
              <select
                id="status"
                name="status"
                value={formData?.status || "Active"}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <FiChevronDown className="emp-select-icon" />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: SALARY DETAILS --- */}
        <div className="emp-section-title" style={{ marginTop: "22px" }}>
          SALARY DETAILS <span className="emp-section-badge">Earnings & Deductions</span>
        </div>

        <div className="emp-form-grid">
          <div className="emp-form-group">
            <label htmlFor="basicSalary">
              Basic Salary <span className="required-star">*</span>
            </label>
            <input
              id="basicSalary"
              name="basicSalary"
              type="number"
              placeholder="e.g. 30000"
              value={formData?.basicSalary || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="hra">HRA</label>
            <input
              id="hra"
              name="hra"
              type="number"
              placeholder="e.g. 10000"
              value={formData?.hra || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="travelAllowance">Travel Allowance</label>
            <input
              id="travelAllowance"
              name="travelAllowance"
              type="number"
              placeholder="e.g. 3000"
              value={formData?.travelAllowance || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="otherAllowances">Other Allowances</label>
            <input
              id="otherAllowances"
              name="otherAllowances"
              type="number"
              placeholder="e.g. 5000"
              value={formData?.otherAllowances || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="pfDeduction">PF Deduction</label>
            <input
              id="pfDeduction"
              name="pfDeduction"
              type="number"
              placeholder="e.g. 1800"
              value={formData?.pfDeduction || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="professionalTax">Professional Tax</label>
            <input
              id="professionalTax"
              name="professionalTax"
              type="number"
              placeholder="e.g. 200"
              value={formData?.professionalTax || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          <div className="emp-form-group">
            <label htmlFor="professionalTax">Other Deductions</label>
            <input
              id="otherDeductions"
              name="otherDeductions"
              type="number"
              placeholder="e.g. 200"
              value={formData?.otherDeductions || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* --- SECTION 3: BANK DETAILS --- */}
        <div className="emp-section-title" style={{ marginTop: "22px" }}>
          BANK DETAILS <span className="emp-section-badge">Payout Info</span>
        </div>

        <div className="emp-form-grid">
          <div className="emp-form-group">
            <label htmlFor="accountHolderName">
              Account Holder Name <span className="required-star">*</span>
            </label>
            <input
              id="accountHolderName"
              name="accountHolderName"
              type="text"
              placeholder="e.g. Ravi Kumar"
              value={formData?.accountHolderName || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="bankName">
              Bank Name <span className="required-star">*</span>
            </label>
            <input
              id="bankName"
              name="bankName"
              type="text"
              placeholder="e.g. State Bank of India"
              value={formData?.bankName || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="accountNumber">
              Account Number <span className="required-star">*</span>
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              placeholder="e.g. 123456789012"
              value={formData?.accountNumber || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="ifscCode">
              IFSC Code <span className="required-star">*</span>
            </label>
            <input
              id="ifscCode"
              name="ifscCode"
              type="text"
              placeholder="e.g. SBIN0001234"
              value={formData?.ifscCode || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="emp-form-group">
            <label htmlFor="branchName">Branch Name</label>
            <input
              id="branchName"
              name="branchName"
              type="text"
              placeholder="e.g. Main Branch"
              value={formData?.branchName || ""}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

      </form>
    </CommonModal>
  );
};

export default EmployeeModal;