import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { formatToUTCDate, formatToUTCTime } from "../../../utils/dateUtils";

// Endpoint constants
const BIOMETRIC_ENDPOINTS = {
  ENROLL_FINGER: "/device/enroll-finger",
  CONFIRM_ENROLLMENT: "/device/confirm-enrollment",
};

// Raw fetchers
export const enrollFinger = async (payload) => {
  const { data } = await axiosInstance.post(
    BIOMETRIC_ENDPOINTS.ENROLL_FINGER,
    payload
  );
  return data;
};

export const confirmEnrollment = async (payload) => {
  const { data } = await axiosInstance.post(
    BIOMETRIC_ENDPOINTS.CONFIRM_ENROLLMENT,
    payload
  );
  return data;
};

// React Query Hooks
export const useEnrollFinger = () => useMutation({ mutationFn: enrollFinger });

export const useConfirmEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const getDashboardAttendanceHistory = async (params) => {
  // Only pass query parameters supported by your backend endpoint
  const queryParams = {
    search: params.search || undefined,
    status: params.status || undefined,
    from_date: params.startDate || undefined,
    to_date: params.endDate || undefined,
    employee_id: params.empId || undefined,
  };

  const { data } = await axiosInstance.get("/dashboard/attendencehistory", {
    params: queryParams,
  });
  return data;
};

export const useAttendanceHistory = (filters = {}) => {
  return useQuery({
    queryKey: ["attendanceHistory", filters],
    queryFn: () => getDashboardAttendanceHistory(filters),
    select: (response) => {
      const rawList = response?.data || response?.leaves || [];

      let formattedList = rawList.map((item, index) => {
        const targetDate = item.date || item.punchIn;

        return {
          id: item.id || `${item.employeeId || "emp"}-${index}`,
          date: formatToUTCDate(targetDate),
          empId: item.employeeId || item.employee_id,
          empName: item.employeeName || item.employee_name || "N/A",
          deptId: item.deptId || item.department_id || item.departmentId || item.department?.id,
          dept: typeof item.department === "string" 
            ? item.department 
            : item.department?.name || item.department_name || "Unassigned",
          punchIn: formatToUTCTime(item.punchIn),
          punchOut: formatToUTCTime(item.punchOut),
          workingHours: item.workingHours || "—",
          status: item.status || "Present",
        };
      });

      // Frontend Department Filter (Matches either ID or Department Name)
      if (filters.dept) {
        const selectedDept = String(filters.dept).trim().toLowerCase();
        formattedList = formattedList.filter((item) => {
          const matchesId = item.deptId && String(item.deptId).toLowerCase() === selectedDept;
          const matchesName = item.dept && item.dept.toLowerCase() === selectedDept;
          return matchesId || matchesName;
        });
      }

      // Frontend Employee ID Filter
      if (filters.empId) {
        formattedList = formattedList.filter(
          (item) => String(item.empId) === String(filters.empId)
        );
      }

      return formattedList;
    },
  });
};