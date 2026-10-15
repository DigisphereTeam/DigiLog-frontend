import { useState, useMemo, useEffect } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";

import { useReports } from "../api/reportsApi";

import StatCard from "../../../components/StatCard/StatCard";
import DataTable from "../../../components/DataTable/DataTable";
import Avatar from "../../../components/Avatar/Avatar";
import Badge from "../../../components/Badge/Badge";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import TablePagination from "../../../components/TablePagination/TablePagination";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

import "./Reports.css";

function useDebounce(value, delay = 600) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery.trim(), 600);
  const reportParams = useMemo(
    () => ({
      search: debouncedSearch,
      month: selectedMonth,
    }),
    [debouncedSearch, selectedMonth]
  );

  const {data: response,isLoading,isFetching,isError,error,} = useReports(reportParams);

  const reportData = response?.data;

  const summary = reportData?.summary || {};

  const employees = reportData?.employees || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedMonth]);

  const stats = {
    present: summary.present || 0,
    absent: summary.absent || 0,
    late: summary.late || 0,
    hours: summary.totalWorkingHours || "0.0",
  };

  const totalRecords = employees.length;

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return employees.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [employees, currentPage]);

  const columns = useMemo(
    () => [
      {
        key: "employeeName",
        header: "EMPLOYEE",
        render: (row) => (
          <div className="employee-info">
            <Avatar
              name={row.employeeName}
              size="small"
            />

            <span>{row.employeeName}</span>
          </div>
        ),
      },

      {
        key: "department",
        header: "DEPARTMENT",
        render: (row) => (
          <Badge variant="info">
            {row.department}
          </Badge>
        ),
      },

      {
        key: "present",
        header: "PRESENT",
      },

      {
        key: "late",
        header: "LATE",
      },

      {
        key: "absent",
        header: "ABSENT",
      },

      {
        key: "hours",
        header: "HRS",
        render: (row) => (
          <strong>{row.hours}</strong>
        ),
      },
    ],
    []
  );

  const toolbarFilters = useMemo(
    () => [
      {
        type: "search",
        name: "search",
        placeholder: "Search employee...",
        col: 4,
      },

      {
        type: "month",
        name: "month",
        col: 4,
      },
    ],
    []
  );

  const toolbarValues = useMemo(
    () => ({
      search: searchQuery,
      month: selectedMonth,
    }),
    [searchQuery, selectedMonth]
  );

  const handleToolbarChange = (name, value) => {
    if (name === "search") {
      setSearchQuery(value);
    }

    if (name === "month") {
      setSelectedMonth(value);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMonth(getCurrentMonth());
    setCurrentPage(1);
  };

  if (isLoading && !response) {
    return (
      <LoadingSpinner
        message="Loading Reports"
        fullPage
      />
    );
  }

  if (isError && !response) {
    return (
      <div className="reports-container">
        <div className="text-center py-5">
          Failed to load reports.

          <br />

          {error?.response?.data?.message ||
            "Something went wrong."}
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">

      <div className="reports-header">
        <div>
          <h2>Reports</h2>

          <p className="sub-heading">
            Monthly attendance reports with employee search
          </p>
        </div>
      </div>

      <div className="toolbar-section">
        <TableToolbar
          filters={toolbarFilters}
          values={toolbarValues}
          onChange={handleToolbarChange}
          onClear={handleClearFilters}
        />
      </div>

      {isFetching && (
        <LoadingSpinner message="Loading Reports..." fullPage/>
      )}

      <div className="metrics-grid">
        <StatCard
          title="Present"
          value={stats.present}
          icon={FiCheckCircle}
        />

        <StatCard
          title="Absent"
          value={stats.absent}
          icon={FiXCircle}
        />

        <StatCard
          title="Late"
          value={stats.late}
          icon={FiClock}
        />

        <StatCard
          title="Total Working Hours"
          value={stats.hours}
          icon={FiActivity}
        />
      </div>

      <div className="reports-data-grid">
        <div className="table-panel">

          <div className="table-content-area">
            <DataTable
              columns={columns}
              data={paginatedEmployees}
              rowKey="employeeId"
              emptyMessage="No matching records found."
            />
          </div>

          {totalRecords > 0 && (
            <TablePagination
              page={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPrevious={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              onNext={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}