import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import queryClient from "../lib/queryClient";
import { AuthProvider } from "../features/auth/context/AuthContext";

const Providers = ({ children }) => {
  return (
    <BrowserRouter basename="/attendance">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default Providers;