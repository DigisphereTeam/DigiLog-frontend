import { NavLink } from "react-router-dom";
import { FiBarChart2, FiCalendar, FiGrid, FiLayers, FiRepeat, FiUsers, FiX } from "react-icons/fi";
import { FaCalendarTimes, FaClipboardCheck, FaFingerprint } from "react-icons/fa";
import { useAuth } from "../features/auth/context/AuthContext";
import logo from "../assets/logo-digi.png";
import { FaIndianRupeeSign } from "react-icons/fa6";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FiGrid,
    allowedRoles: ["admin"],
  },
  {
    label: "Employee Management",
    path: "/employees",
    icon: FiUsers,
    allowedRoles: ["admin"],
  },
  {
    label: "Department Management",
    path: "/departments",
    icon: FiLayers,
    allowedRoles: ["admin"],
  },
  // {
  //   label: "Biometric Enrollment",
  //   path: "/biometrics",
  //   icon: FaFingerprint,
  //   allowedRoles: ["admin"],
  // },
  {
    label: "Attendance History",
    path: "/attendance-history",
    icon: FaClipboardCheck,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "Leave Management",
    path: "/leave-management",
    icon: FaCalendarTimes,
    allowedRoles: ["admin"],
  },
  {
    label: "My Leaves",
    path: "/leaves",
    icon: FaCalendarTimes,
    allowedRoles: ["employee"],
  },
  {
    label: "Shift Management",
    path: "/shifts",
    icon: FiRepeat,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "Expenditure",
    path: "/expenditure",
    icon: FaIndianRupeeSign,
    allowedRoles: ["admin"],
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: FiCalendar,
    allowedRoles: ["admin", "employee"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FiBarChart2,
    allowedRoles: ["admin"],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const userRole = role?.toLowerCase();
 
  const filteredNav = navigation.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <>
      <aside className={`app-sidebar ${isOpen ? "show" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img src={logo} alt="Digilog-logo" className="brand-logo " />
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ textAlign: "center" }}>© 2026 Digisphere</div>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
};

export default Sidebar;