import { useState, useMemo, useCallback, useEffect } from "react";
import Avatar from "../../../components/Avatar/Avatar";
import Badge from "../../../components/Badge/Badge";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import DataTable from "../../../components/DataTable/DataTable";
import TablePagination from "../../../components/TablePagination/TablePagination";
import { useAttendanceHistory } from "../api/biometricApi";
import { useDepartments } from "../../departments/api/departmentApi";
import { useAuth } from "../../auth/context/AuthContext";

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AttendanceHistory({ departments: propDepartments = [] }) {
  const { user, isAdmin, isEmployee } = useAuth();

  const currentEmployeeId =
    user?.employee_id || user?.emp_id || user?.id || user?.employeeId;

  const [filterValues, setFilterValues] = useState({
    search: "",
    dept: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(filterValues.search, 500);

  const queryFilters = useMemo(
    () => ({
      ...filterValues,
      search: debouncedSearch,
      empId: isEmployee ? currentEmployeeId : undefined,
    }),
    [filterValues, debouncedSearch, isEmployee, currentEmployeeId]
  );

  const { data: historyList = [], isLoading: isLoadingHistory } =
    useAttendanceHistory(queryFilters);

  const { data: fetchedDepartments = [], isLoading: isLoadingDepts } =
    useDepartments();
  const departmentsList =
    propDepartments.length > 0 ? propDepartments : fetchedDepartments;

  const handleFilterChange = useCallback((name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterValues({
      search: "",
      dept: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  }, []);

  const filterConfig = useMemo(() => {
    const filters = [];

    if (isAdmin) {
      filters.push(
        {
          name: "search",
          type: "search",
          placeholder: "Search employee...",
        },
        {
          name: "dept",
          type: "select",
          placeholder: isLoadingDepts
            ? "Loading departments..."
            : "All Departments",
          options: departmentsList.map((d) => {
            const deptName = d.name || d.department_name;
            return {
              label: deptName,
              value: deptName,
            };
          }),
        }
      );
    }

    filters.push(
      {
        name: "status",
        type: "select",
        placeholder: "All Status",
        options: [
          { label: "Present", value: "Present" },
          { label: "Late", value: "Late" },
          { label: "Absent", value: "Absent" },
        ],
      },
      {
        name: "startDate",
        type: "date",
      },
      {
        name: "endDate",
        type: "date",
      }
    );

    return filters;
  }, [isAdmin, departmentsList, isLoadingDepts]);

  const totalRecords = historyList.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return historyList.slice(start, start + pageSize);
  }, [historyList, currentPage, pageSize]);

  const columns = useMemo(() => {
    const cols = [{ key: "date", header: "DATE" }];

    if (isAdmin) {
      cols.push(
        {
          key: "empName",
          header: "EMPLOYEE",
          render: (row) => (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar name={row.empName} size="small" />
              <span style={{ fontWeight: 500, color: "#101828" }}>
                {row.empName}
              </span>
            </div>
          ),
        },
        {
          key: "dept",
          header: "DEPARTMENT",
          render: (row) => <Badge variant="info">{row.dept}</Badge>,
        }
      );
    }

    cols.push(
      {
        key: "punchIn",
        header: "PUNCH IN",
        render: (row) => row.punchIn || "—",
      },
      {
        key: "punchOut",
        header: "PUNCH OUT",
        render: (row) => row.punchOut || "—",
      },
      {
        key: "workingHours",
        header: "WORKING HRS",
        render: (row) => row.workingHours || "—",
      },
      {
        key: "status",
        header: "STATUS",
        render: (row) => {
          let variant = "success";
          if (row.status === "Late") variant = "warning";
          if (row.status === "Absent") variant = "danger";

          return <Badge variant={variant}>{row.status}</Badge>;
        },
      }
    );

    return cols;
  }, [isAdmin]);

  return (
    <div className="attendance-history-card">
      <div className="department-content-header">
        <div>
          <h1>
            {isAdmin ? "Attendance History" : "My Attendance History"}
          </h1>
          <p>
            {isAdmin
              ? "Employee-wise and department-wise attendance records"
              : "View your personal attendance history and clock-in logs"}
          </p>
        </div>
      </div>

      <TableToolbar
        filters={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {isLoadingHistory ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary me-2" role="status" />
          Loading attendance history...
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={paginatedData}
            rowKey="id"
            emptyMessage="No attendance records found matching your query."
          />

          {totalRecords > 0 && (
            <TablePagination
              page={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            />
          )}
        </>
      )}
    </div>
  );
}