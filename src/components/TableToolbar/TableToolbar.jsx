import { useState, useRef, useEffect, useCallback } from "react";
import { FiCalendar, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import "./TableToolbar.css";
 
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec",
];
 
const getCurrentYYYYMM = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};
 
const getYearsList = () => {
  const startYear = 2000;
  const endYear = 2100;
 
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  );
};
 
const MonthPickerField = ({ filter, values, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  // Fallback to control value, default filter value, or dynamic current year-month
  const rawValue = values[filter.name] || filter.defaultValue || getCurrentYYYYMM();
 
  // Safely parse Year and Month
  const [yearStr, monthStr] = rawValue.split("-");
  const parsedYear = parseInt(yearStr, 10);
  const parsedMonth = parseInt(monthStr, 10);
 
  const currentYear = !isNaN(parsedYear) ? parsedYear : new Date().getFullYear();
  const currentMonthIdx =
    !Number.isNaN(parsedMonth) &&
    parsedMonth >= 1 &&
    parsedMonth <= 12
      ? parsedMonth - 1
      : new Date().getMonth();
 
 
  const yearsList = filter.years || getYearsList();
 
  const handleClose = useCallback(() => setIsOpen(false), []);
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };
 
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
 
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
 
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);
 
  const handleSelectMonth = (monthIndex) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, "0");
    onChange(filter.name, `${currentYear}-${formattedMonth}`);
    setIsOpen(false);
  };
 
  const handleSelectYear = (year) => {
    const formattedMonth = String(currentMonthIdx + 1).padStart(2, "0");
    onChange(filter.name, `${year}-${formattedMonth}`);
  };
 
  const displayLabel = `${MONTHS[currentMonthIdx]}, ${currentYear}`;
 
  return (
    <div className="toolbar-month-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`toolbar-month-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="month-trigger-content">
          <FiCalendar className="toolbar-date-icon" />
          <span>{displayLabel}</span>
        </span>
        <FiChevronDown className="toolbar-select-icon" />
      </button>
 
      {isOpen && (
        <div className="month-picker-popover" role="dialog" aria-label="Month Picker">
          <div className="year-display-header">{currentYear}</div>
          <div className="months-grid">
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                type="button"
                className={`month-cell ${idx === currentMonthIdx ? "selected" : ""}`}
                onClick={() => handleSelectMonth(idx)}
              >
                {m}
              </button>
            ))}
          </div>
 
          <div className="years-scroll-list">
            {yearsList.map((y) => (
              <button
                key={y}
                type="button"
                className={`year-row ${y === currentYear ? "active" : ""}`}
                onClick={() => handleSelectYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
 
const TableToolbar = ({
  filters = [],
  values = {},
  onChange,
  onClear,
  actions,
}) => {
  const handleChange = (name, value) => {
    onChange?.(name, value);
  };
 
  return (
    <div className="table-toolbar">
      <div className="table-toolbar-filters">
        {filters.map((filter) => {
          if (filter.type === "search") {
            return (
              <div className="toolbar-search" key={filter.name}>
                <FiSearch className="toolbar-search-icon" />
                <input
                  type="text"
                  value={values[filter.name] || ""}
                  placeholder={filter.placeholder || "Search..."}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                />
              </div>
            );
          }
 
          if (filter.type === "select") {
            return (
              <div
                className={`toolbar-select-wrapper ${filter.wide ? "toolbar-select-wrapper--wide" : ""}`}
                key={filter.name}
              >
                <select
                  className="toolbar-select"
                  value={values[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                >
                  <option value="">
                    {filter.placeholder || "Select"}
                  </option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="toolbar-select-icon" />
              </div>
            );
          }
 
          if (filter.type === "date") {
            return (
              <div className="toolbar-date-wrapper" key={filter.name}>
                <FiCalendar className="toolbar-date-icon" />
                <input
                  type="date"
                  className="toolbar-date"
                  value={values[filter.name] || ""}
                  onChange={(e) => handleChange(filter.name, e.target.value)}
                />
              </div>
            );
          }
 
          if (filter.type === "month") {
            return (
              <MonthPickerField
                key={filter.name}
                filter={filter}
                values={values}
                onChange={handleChange}
              />
            );
          }
 
          return null;
        })}
 
        {onClear && (
          <button
            type="button"
            className="toolbar-clear-button"
            onClick={onClear}
          >
            <FiX />
            Clear
          </button>
        )}
      </div>
 
      {actions && <div className="table-toolbar-actions">{actions}</div>}
    </div>
  );
};
 
export default TableToolbar;
 

 