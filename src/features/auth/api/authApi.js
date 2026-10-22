import axiosInstance from "../../../lib/axios";

const AUTH_ENDPOINTS = {
  ADMIN_LOGIN: "/user/login",
  EMPLOYEE_LOGIN: "/user/loginemployee",
};

export const loginAdmin = async (payload) => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.ADMIN_LOGIN, payload);
  return data;
};

export const loginEmployee = async (payload) => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.EMPLOYEE_LOGIN, {...payload });
  return data;
};