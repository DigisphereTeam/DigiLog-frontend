import React, { forwardRef } from "react";
import logo from "../../../assets/digishperelogo.png";

const Payslip = forwardRef(({ data }, ref) => {
  const {
    month = "N/A",
    employeeName = "N/A",
    employeeNumber = "N/A",
    dateOfJoining = "N/A",
    department = "N/A",
    designation = "N/A",
    paymentMode = "Bank Transfer",
    bankName = "N/A",
    bankIfsc = "N/A",
    bankAccount = "N/A",
    actualPayableDays = 0,
    totalWorkingDays = 0,
    lossOfDays = 0,
    daysPayable = 0,
    earnings = [],
    deductions = [],
    totalEarnings = "₹0.00",
    totalDeductions = "₹0.00",
    netSalaryPayable = "₹0.00",
    netSalaryInWords = "N/A",
  } = data || {};

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#ffffff",
        padding: "40px",
        fontFamily: "Inter, sans-serif",
        color: "#111827",
        boxSizing: "border-box",
        fontSize: "12px",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 8px 0",
              letterSpacing: "0.5px",
            }}
          >
            PAYSLIP {month}
          </h1>
          <div style={{ color: "#4B5563", lineHeight: "1.5", fontSize: "11px" }}>
            <p style={{ margin: 0, fontWeight: "600" }}>Vijayawada Office</p>
            <p style={{ margin: 0 }}>502, 5th Floor, Veerachaneni Residency,</p>
            <p style={{ margin: 0 }}>
              Ramavarapadu Ring Road, Andhra Pradesh – 521108
            </p>
          </div>
        </div>
        <div>
          {/* Company Logo */}
          <img
            src={logo}
            alt="Digisphere Logo"
            style={{
              height: "56px",
              maxWidth: "220px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #E5E7EB",
          margin: "16px 0",
        }}
      />

      {/* Employee Name Title */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          textTransform: "uppercase",
          margin: "0 0 16px 0",
          color: "#1F2937",
        }}
      >
        {employeeName}
      </h3>

      {/* Employee Info Grid */}
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: "4px",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        {/* Row 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderBottom: "1px solid #E5E7EB",
            padding: "10px 12px",
            backgroundColor: "#F9FAFB",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>
              Employee Number
            </div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {employeeNumber}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>
              Date Of Joining
            </div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {dateOfJoining}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>Department</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {department}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>Designation</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {designation}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderBottom: "1px solid #E5E7EB",
            padding: "10px 12px",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>Payment Mode</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {paymentMode}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>Bank</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>{bankName}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>Bank IFSC</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>{bankIfsc}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>Bank Account</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {bankAccount}
            </div>
          </div>
        </div>

        {/* Row 3
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            padding: "10px 12px",
            backgroundColor: "#F9FAFB",
          }} */}
        {/* > */}
          {/* <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>PAN</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>{pan}</div>
          </div>
          <div></div>
          <div></div>
          <div></div> */}
        {/* </div> */}
      </div>

      {/* Salary Details Section */}
      <div style={{ marginBottom: "20px" }}>
        <h4
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            margin: "0 0 10px 0",
            color: "#374151",
          }}
        >
          Salary Details
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            border: "1px solid #E5E7EB",
            borderRadius: "4px",
            padding: "12px",
            backgroundColor: "#F9FAFB",
          }}
        >
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>
              ACTUAL PAYABLE DAYS
            </div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {actualPayableDays}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>
              TOTAL WORKING DAYS
            </div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {totalWorkingDays}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>
              LOSS OF DAYS
            </div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {lossOfDays}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#6B7280" }}>DAYS PAYABLE</div>
            <div style={{ fontWeight: "600", marginTop: "2px" }}>
              {daysPayable}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings & Deductions Tables */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
          border: "1px solid #E5E7EB",
          borderRadius: "4px",
        }}
      >
        {/* Earnings */}
        <div style={{ padding: "16px", borderRight: "1px solid #E5E7EB" }}>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              margin: "0 0 12px 0",
              color: "#374151",
            }}
          >
            Earnings
          </h4>
          {earnings.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "11px",
              }}
            >
              <span style={{ color: "#4B5563" }}>{item.label}</span>
              <span style={{ fontWeight: "500" }}>{item.value}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "8px",
              borderTop: "1px solid #E5E7EB",
              fontWeight: "bold",
            }}
          >
            <span>Total Earnings</span>
            <span>{totalEarnings}</span>
          </div>
        </div>

        {/* Taxes & Deductions */}
        <div style={{ padding: "16px" }}>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              margin: "0 0 12px 0",
              color: "#374151",
            }}
          >
            Taxes & Deductions
          </h4>
          {deductions.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "11px",
              }}
            >
              <span style={{ color: "#4B5563" }}>{item.label}</span>
              <span style={{ fontWeight: "500" }}>{item.value}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "8px",
              borderTop: "1px solid #E5E7EB",
              fontWeight: "bold",
            }}
          >
            <span>Total Deductions</span>
            <span>{totalDeductions}</span>
          </div>
        </div>
      </div>

      {/* Net Salary Highlight Box */}
      <div
        style={{
          backgroundColor: "#E0F2FE",
          borderRadius: "6px",
          padding: "16px",
          marginBottom: "30px",
          border: "1px solid #BAE6FD",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontWeight: "bold", color: "#0369A1" }}>
            Net Salary Payable
          </span>
          <span
            style={{ fontWeight: "bold", fontSize: "16px", color: "#0369A1" }}
          >
            {netSalaryPayable}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: "bold", color: "#0369A1" }}>
            Net Salary In Words
          </span>
          <span style={{ fontWeight: "600", color: "#0369A1" }}>
            {netSalaryInWords}
          </span>
        </div>
      </div>

      {/* Footer Notes */}
      <div
        style={{
          fontSize: "10px",
          color: "#6B7280",
          borderTop: "1px solid #E5E7EB",
          paddingTop: "12px",
          lineHeight: "1.6",
        }}
      >
        <p style={{ margin: "0 0 4px 0" }}>
          *NOTE : all amounts displayed in this payslip are in INR
        </p>
        <p style={{ margin: 0 }}>
          *This Is System Generated Salary Slip And Does Not Require Signature
        </p>
      </div>
    </div>
  );
});

export default Payslip;