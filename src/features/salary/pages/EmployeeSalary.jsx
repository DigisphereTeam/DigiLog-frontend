import { useState, useMemo, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import StatCard from "../../../components/StatCard/StatCard";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import DataTable from "../../../components/DataTable/DataTable";
import TablePagination from "../../../components/TablePagination/TablePagination";
import Badge from "../../../components/Badge/Badge";
import CommonModal from "../../../components/CommonModal/CommonModal";
import { FiEye, FiDownload } from "react-icons/fi";
import netSalaryIcon from "../../../assets/icons/salary/net-salary-icon.svg";
import lopIcon from "../../../assets/icons/salary/lop-icon.svg";
import paidLeaves from "../../../assets/icons/salary/paid-leaves.svg";
import deductionsIcon from "../../../assets/icons/salary/deductions.svg";

import { useAuth } from "../../../features/auth/context/AuthContext";

import {
  getCurrentFinancialYear,
  generateFinancialYears,
  getFinancialYearRange,
} from "../../../utils/financialYear";

import {
  useEmployeeSalaryPayments,
  usePayslipDetails,
} from "../api/salaryApi";
import Payslip from "../components/Payslip";

const PAGE_SIZE = 5;

const EmployeeSalary = ({ currentEmployeeId, isHRView = false }) => {
  // Get logged-in user details if currentEmployeeId is not passed
  const { user } = useAuth();
  const activeEmployeeId = currentEmployeeId || user?.employee_id || user?.id || user?.employeeId;

  // 1. Fetch all monthly salary payments for the table view
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useEmployeeSalaryPayments(activeEmployeeId);

  // Extract payment records list & statistics
  const salaryData = useMemo(() => {
    const data = apiResponse?.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.payments)) return data.payments;
    return [data];
  }, [apiResponse]);

  const statistics = useMemo(() => {
    if (apiResponse?.data?.statistics) return apiResponse.data.statistics;
    const latest = salaryData[0];
    return {
      net_salary: latest?.net_amount ?? 0,
      paid_leaves: latest?.available_leaves ?? 0,
      lop_days: latest?.lop_days ?? 0,
      deductions: latest?.deductions ?? 0,
    };
  }, [apiResponse, salaryData]);

  // Selected Payment ID for Payslip API fetch
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  
  // Modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Query hook to fetch detailed payslip data by selectedPaymentId
  const {
    data: payslipResponse,
    isLoading: isPayslipLoading,
  } = usePayslipDetails(selectedPaymentId);

  const activePayslipDetail = payslipResponse?.data;

  // PDF generation setup
  const payslipRef = useRef(null);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleViewPayslip = (row) => {
    setSelectedPaymentId(row.payment_id);
    setIsModalOpen(true);
  };

  const handleDownloadPayslip = (row) => {
    setSelectedPaymentId(row.payment_id);
    setDownloadRequested(true);
  };

  // Generate PDF when activePayslipDetail data is loaded
  useEffect(() => {
    if (
      !downloadRequested ||
      !activePayslipDetail ||
      !payslipRef.current ||
      isPayslipLoading
    ) {
      return;
    }

    let cancelled = false;

    const generatePDF = async () => {
      setIsDownloading(true);

      try {
        const canvas = await html2canvas(payslipRef.current, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        if (cancelled) return;

        const image = canvas.toDataURL("image/jpeg", 0.85);
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageHeight = (canvas.height * pageWidth) / canvas.width;
        const scale = Math.min(1, pageHeight / imageHeight);

        pdf.addImage(
          image,
          "JPEG",
          0,
          0,
          pageWidth * scale,
          imageHeight * scale,
          undefined,
          "FAST"
        );

        const month = activePayslipDetail.salary_month || "payslip";
        const paymentId = activePayslipDetail.payment_id || "salary";
        const fileName = `Payslip_${month}_${paymentId}.pdf`;

        const blob = pdf.output("blob");
        const blobUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch (err) {
        console.error("Failed to generate payslip:", err);
      } finally {
        if (!cancelled) {
          setIsDownloading(false);
          setDownloadRequested(false);
        }
      }
    };

    generatePDF();

    return () => {
      cancelled = true;
    };
  }, [downloadRequested, activePayslipDetail, isPayslipLoading]);

  // Filters & Pagination setup
  const financialYearOptions = useMemo(() => generateFinancialYears(5), []);
  const defaultFy = useMemo(() => getCurrentFinancialYear(), []);

  const [filterValues, setFilterValues] = useState({
    search: "",
    status: "",
    financialYear: defaultFy,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilterValues({ search: "", status: "", financialYear: defaultFy });
    setCurrentPage(1);
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatSalaryMonth = (salaryMonth) => {
    if (!salaryMonth) return "N/A";
    const [year, month] = salaryMonth.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const toolbarFilters = [
    {
      type: "search",
      name: "search",
      placeholder: "Search month, e.g. Sep 2026...",
    },
    {
      type: "select",
      name: "status",
      placeholder: "All Status",
      options: [
        { label: "Paid", value: "PAID" },
        { label: "Pending", value: "PENDING" },
      ],
    },
    {
      type: "select",
      name: "financialYear",
      placeholder: "Select Financial Year",
      wide: true,
      options: financialYearOptions,
    },
  ];

  const filteredData = useMemo(() => {
    const fyRange = getFinancialYearRange(filterValues.financialYear);
    const search = filterValues.search.trim().toLowerCase();

    return salaryData.filter((item) => {
      const monthLabel = formatSalaryMonth(item.salary_month).toLowerCase();
      const matchesSearch = !search || monthLabel.includes(search);
      const matchesStatus =
        !filterValues.status ||
        item.status?.toUpperCase() === filterValues.status;

      const salaryDate = item.salary_month ? `${item.salary_month}-01` : "";
      const matchesFinancialYear =
        !fyRange || (salaryDate >= fyRange.start && salaryDate <= fyRange.end);

      return matchesSearch && matchesStatus && matchesFinancialYear;
    });
  }, [salaryData, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const columns = useMemo(
    () => [
      {
        key: "salary_month",
        header: "Month",
        render: (row) => (
          <span className="font-medium text-gray-900">
            {formatSalaryMonth(row.salary_month)}
          </span>
        ),
      },
      {
        key: "gross_amount",
        header: "Gross Salary",
        render: (row) => formatCurrency(row.gross_amount),
      },
      { key: "working_days", header: "Working Days" },
      { key: "days_present", header: "Present Days" },
      { key: "leaves_taken", header: "Leaves Taken" },
      { key: "lop_days", header: "LOP Days" },
      {
        key: "deductions",
        header: "Deductions",
        render: (row) => formatCurrency(row.deductions),
      },
      {
        key: "net_amount",
        header: "Net Salary",
        render: (row) => (
          <span className="font-semibold text-gray-900">
            {formatCurrency(row.net_amount)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => {
          const status = row.status?.toUpperCase();
          const variant = status === "PAID" ? "info" : "warning";
          const label = status
            ? status.charAt(0) + status.slice(1).toLowerCase()
            : "Unknown";

          return <Badge variant={variant}>{label}</Badge>;
        },
      },
      {
        key: "actions",
        header: "Actions",
        cellClassName: "text-right",
        headerClassName: "text-right",
        render: (row) => (
          <div className="salary-table-actions">
            <button
              type="button"
              title="View Details"
              className="salary-action-button"
              onClick={() => handleViewPayslip(row)}
            >
              <FiEye />
            </button>

            <button
              type="button"
              title="Download Payslip"
              aria-label="Download payslip"
              className="salary-action-button"
              disabled={isDownloading}
              onClick={() => handleDownloadPayslip(row)}
            >
              <FiDownload />
            </button>
          </div>
        ),
      },
    ],
    [isDownloading]
  );

  // structure API data
  const getPayslipProps = (detail) => {
    if (!detail) return {};
    const sDetails = detail.salary_details || {};
    const bDetails = detail.bank_details || {};

    return {
      month: detail.salary_month
        ? formatSalaryMonth(detail.salary_month).toUpperCase()
        : "N/A",
      employeeName: detail.employee_name || "Employee",
      employeeNumber: detail.emp_code || activeEmployeeId,
      dateOfJoining: detail.date_of_joining || sDetails.effective_date || "N/A",
      department: detail.department_name || "N/A",
      designation: detail.designation || "N/A",
      paymentMode: "Bank Transfer",
      bankName: bDetails.bank_name || "N/A",
      bankIfsc: bDetails.ifsc_code || "N/A",
      bankAccount: bDetails.account_number || "N/A",
      pan: detail.pan || "N/A",
      actualPayableDays: Number(detail.working_days ?? 0),
      totalWorkingDays: Number(detail.working_days ?? 0),
      lossOfDays: Number(detail.lop_days ?? 0),
      daysPayable: Number(detail.working_days ?? 0) - Number(detail.lop_days ?? 0),
      earnings: [
        { label: "Basic", value: formatCurrency(sDetails.basic_salary) },
        { label: "HRA", value: formatCurrency(sDetails.hra) },
        { label: "Other Allowance", value: formatCurrency(sDetails.other_allowances) },
        { label: "Travel Allowance", value: formatCurrency(sDetails.travel_allowance) },
      ],
      deductions: [
        { label: "Provident Fund (PF)", value: formatCurrency(sDetails.pf) },
        { label: "Professional Tax", value: formatCurrency(sDetails.professional_tax) },
        { label: "Other Deductions", value: formatCurrency(sDetails.other_deductions) },
      ],
      totalEarnings: formatCurrency(detail.gross_amount),
      totalDeductions: formatCurrency(sDetails.total_deductions),
      netSalaryPayable: formatCurrency(sDetails.net_salary),
      netSalaryInWords: "Refer to Net Salary Payable",
    };
  };

  if (!activeEmployeeId) {
    return (
      <div className="department-management">
        Unable to identify the employee. Please check employee ID.
      </div>
    );
  }

  if (isLoading) {
    return <div className="department-management">Loading salary details...</div>;
  }

  if (isError) {
    return (
      <div className="department-management">
        Failed to load salary details.
        {error?.message && <p>{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="department-management">
      {!isHRView && (
        <div className="department-content-header">
          <div>
            <h1>My Salary</h1>
            <p>My payroll details and salary records</p>
          </div>
        </div>
      )}

      <div className="leaves-stats-grid">
        <StatCard
          title="NET SALARY"
          value={formatCurrency(statistics?.net_salary)}
          icon={netSalaryIcon}
        />

        <StatCard
          title="PAID LEAVES"
          value={statistics?.paid_leaves ?? 0}
          icon={paidLeaves}
        />

        <StatCard
          title="LOP DAYS"
          value={statistics?.lop_days ?? 0}
          icon={lopIcon}
        />

        <StatCard
          title="DEDUCTIONS"
          value={formatCurrency(statistics?.deductions)}
          icon={deductionsIcon}
        />
      </div>

      <div className="employee-content-card">
        <TableToolbar
          filters={toolbarFilters}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClear}
        />

        {filteredData.length > 0 ? (
          <DataTable
            columns={columns}
            data={paginatedData}
            rowKey="payment_id"
          />
        ) : (
          <p className="p-3 text-muted">
            No salary records found for the selected filters.
          </p>
        )}

        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalRecords={filteredData.length}
          pageSize={PAGE_SIZE}
          onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />

        {/* COMMON MODAL FOR VIEWING PAYSLIP */}
        <CommonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPaymentId(null);
          }}
          title="Payslip Details"
          subtitle={
            activePayslipDetail
              ? `Salary details for ${formatSalaryMonth(activePayslipDetail.salary_month)}`
              : ""
          }
          primaryLabel="Download PDF"
          primaryIcon={FiDownload}
          onPrimaryClick={() => {
            if (activePayslipDetail) {
              setDownloadRequested(true);
            }
          }}
          secondaryLabel="Close"
          onSecondaryClick={() => {
            setIsModalOpen(false);
            setSelectedPaymentId(null);
          }}
          maxWidth="850px"
        >
          {isPayslipLoading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              Loading payslip details...
            </div>
          ) : activePayslipDetail ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Payslip data={getPayslipProps(activePayslipDetail)} />
            </div>
          ) : null}
        </CommonModal>

        {/* HIDDEN PAYSLIP CONTAINER FOR HTML2CANVAS / PDF GENERATION */}
        {activePayslipDetail && downloadRequested && (
          <div
            style={{
              position: "fixed",
              left: "-10000px",
              top: 0,
              width: "794px",
              background: "#ffffff",
              zIndex: -1,
            }}
          >
            <Payslip
              ref={payslipRef}
              data={getPayslipProps(activePayslipDetail)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSalary;