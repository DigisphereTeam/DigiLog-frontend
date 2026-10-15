import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { formatToUTCDate, formatToUTCTime } from "../../../utils/dateUtils";

const EMPLOYEE_ENDPOINTS = {
  GET_ALL: "/employee/getemployees",
  CREATE: "/employee/addemployeewithdevice",
  UPDATE: (id) => `/employee/edit-employee-with-device/${id}`,
  DELETE: (id) => `/employee/delete-employee-with-device/${id}`,
  GET_BY_ID: (employeeId) => `/attendence/monthlyattendance/${employeeId}`,
};

export const getEmployees = async () => {
  const { data } = await axiosInstance.get(EMPLOYEE_ENDPOINTS.GET_ALL);
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await axiosInstance.post(EMPLOYEE_ENDPOINTS.CREATE, payload);
  return data;
};

export const updateEmployee = async ({ id, payload }) => {
  const { data } = await axiosInstance.put(EMPLOYEE_ENDPOINTS.UPDATE(id),payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await axiosInstance.delete(EMPLOYEE_ENDPOINTS.DELETE(id), {
    data: {},
  });
  return data;
};

export const getEmployeeAttendance = async (id) => {
  const { data } = await axiosInstance.get(EMPLOYEE_ENDPOINTS.GET_BY_ID(id));
  return data;
};

// Hooks
export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    select: (response) => {
      const rawList = response?.employees || [];
      const counts = response?.counts || {
        total_employees: 0,
        active_employees: 0,
        inactive_employees: 0,
        fp_registered: 0,
        fp_not_registered: 0,
      };

      const employees = rawList.map((emp) => ({
        id: emp.employee_id,
        employeeId: `EMP-${emp.employee_id}`,
        empCode: emp.emp_code || "N/A",
        name: emp.employee_name || "N/A",
        email: emp.email || "N/A",
        departmentId: emp.department_id,
        departmentName:
          emp.department_name ||
          (emp.department_id ? `Dept #${emp.department_id}` : "Unassigned"),
        designation: emp.designation || "N/A",
        phone: emp.mobile_number || "N/A",
        status: emp.status
          ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1)
          : "Inactive",
        fingerprintRegistered:
          emp.fingerprint_status?.toLowerCase().trim() === "registered",
        raw: emp,
      }));
      return { employees, counts };
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
  });
};

export const useEmployeeAttendance = (employeeId) => {
  return useQuery({
    queryKey: ["attendance", employeeId],
    queryFn: () => getEmployeeAttendance(employeeId),
    enabled: Boolean(employeeId),
    select: (response) => {
      const resData = response?.data || response; 
      const emp = resData?.employee || {};
      const summary = resData?.summary || { present: 0, late: 0, absent: 0, total_marked_days: 0 };
      const rawList = resData?.attendance || [];

      const attendanceList = rawList.map((item, index) => ({
        id: index + 1,
        date: formatToUTCDate(item.attendance_date || item.punch_in),
        punchIn: formatToUTCTime(item.punch_in),
        punchOut: formatToUTCTime(item.punch_out),
        hrs: item.work_hours || "—",
        status: item.status || (item.is_late ? "Late" : "Present"),
      }));

      return {
        employee: {
          id: emp.employee_id,
          name: emp.employee_name || "N/A",
          empCode: emp.emp_code || "N/A",
          designation: emp.designation || "N/A",
          departmentName: emp.department_name || "Unassigned",
          phone: emp.mobile_number || "N/A",
          email: emp.email || "N/A",
          status: emp.status || "Active",
          joiningDate: formatToUTCDate(emp.joining_date) || "-",
          fingerprintRegistered: emp.fingerprint_status === "Registered",
          salary: emp.salary || {},
          bankDetails: emp.bank_details || {},
          dob: emp.date_of_birth || "-",
        },
        summary,
        attendanceList,
      };
    },
  });
};
