import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";
import { formatToUTCDate } from "../../../utils/dateUtils"; 

const SALARY_ENDPOINTS = {
    GET_ALL: "/employee/salary-details",
    GET_EMPLOYEE_SALARY_PAYMENTS: (employeeId) => `/employee/${employeeId}/salary-payments`,
    GET_EMP_LIST: "/employee/list",
    GET_EMP_INFO: "/employee/salaries/details",
    GET_PAYSLIP_DETAILS: (paymentId) => `/employee/salary-payments/${paymentId}`,
};

const getCurrentYearMonth = () => {
    const formatted = formatToUTCDate(new Date());
    return formatted !== "N/A" ? formatted.slice(0, 7) : "2026-10";
};

export const getAllSalaries = async (params = {}) => {
    const queryParams = {
        month: params.month && params.month.trim() !== "" ? params.month : getCurrentYearMonth()
    };
    const { data } = await axiosInstance.get(SALARY_ENDPOINTS.GET_ALL, { params: queryParams });
    return data;
}; 

export const useAllEmployees = (params = {}) => {
  return useQuery({
    queryKey: ["salary-details", params],
    queryFn: () => getAllSalaries(params),
    select: (response) => {
      const rawData = response?.data || [];

      const processedData = rawData.map((row) => ({
        ...row,
        isPaid: row.salary_status?.toLowerCase() === "paid",
      }));

      return {
        month: response?.month,
        workingDays: response?.working_days,
        statistics: response?.statistics || {
          total_employees: processedData.length,
          net_payroll: 0,
          lop_deductions: 0,
          pending_payments: 0,
        },
        data: processedData,
      };
    },
    keepPreviousData: true,
  });
};

export const getEmployeeSalaryPayments = async (employeeId) => {
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }
  const { data } = await axiosInstance.get(
    SALARY_ENDPOINTS.GET_EMPLOYEE_SALARY_PAYMENTS(employeeId)
  );
  return data;
};

export const useEmployeeSalaryPayments = (employeeId) => {
  return useQuery({
    queryKey: ["employee-salary-payments", employeeId],
    queryFn: () => getEmployeeSalaryPayments(employeeId),
    enabled: Boolean(employeeId),
  });
};

export const getPayslipDetails = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }
  const { data } = await axiosInstance.get(
    SALARY_ENDPOINTS.GET_PAYSLIP_DETAILS(paymentId)
  );
  return data;
};

export const usePayslipDetails = (paymentId) => {
  return useQuery({
    queryKey: ["payslip-details", paymentId],
    queryFn: () => getPayslipDetails(paymentId),
    enabled: Boolean(paymentId),
  });
};

export const getEmpList = async () => {
  const response = await axiosInstance.get(SALARY_ENDPOINTS.GET_EMP_LIST);
  return response.data?.data || []; 
};
export const useEmployeeList = (enabled = false) => {
  return useQuery({
    queryKey: ["employee-list"],
    queryFn: getEmpList,
    enabled: enabled, 
  });
};
export const getEmpInfo = async (params = {}) => {
  // Guard: If employee_id is missing or empty, do not execute the request
  if (!params.employee_id) {
    return null;
  }
  const queryParams = {
    employee_id: params.employee_id,
    month: params.month && params.month.trim() !== "" ? params.month : getCurrentYearMonth(),
  };
  const { data } = await axiosInstance.get(SALARY_ENDPOINTS.GET_EMP_INFO, { params: queryParams });
  return data?.data || null;
};

export const useEmpInfo = (employeeId, month) => {
  return useQuery({
    queryKey: ["employee-info", employeeId, month],
    queryFn: () => getEmpInfo({ employee_id: employeeId, month }),
    // Strictly ensure enabled only turns true when employeeId is valid and truthy
    enabled: Boolean(employeeId !== undefined && employeeId !== null && employeeId !== "" && month),
  });
};

export const creditSalaryApi = async ({ employeeId, payload }) => {
  const { data } = await axiosInstance.post(`/employee/${employeeId}/salary/credit`, payload);
  return data;
};

export const useCreditSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: creditSalaryApi,
    onSuccess: () => {
      // Auto-refresh the main salary list table
      queryClient.invalidateQueries(["salaries"]);
      queryClient.invalidateQueries(["employee-list"]);
    },
  });
};

