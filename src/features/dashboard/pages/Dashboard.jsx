import { useEffect, useMemo } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";
import toast from "react-hot-toast";

import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaFingerprint,
} from "react-icons/fa";

import { useDashboard } from "../api/dashboardApi";

import StatCard from "../../../components/StatCard/StatCard";
import Avatar from "../../../components/Avatar/Avatar";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

const statIcons = [FaUsers, FaUserCheck, FaUserTimes, FaUserClock];

const departmentColors = [
  "#0F3460",
  "#00B4D8",
  "#12B76A",
  "#F79009",
  "#F04438",
];

const Dashboard = () => {
  const { data: response, isLoading, isError, error } = useDashboard();

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data.",
      );
    }
  }, [isError, error]);

  const dashboardData = response?.data;

  const summary = dashboardData?.summary || {};
  const weeklyTrend = dashboardData?.weeklyTrend || [];
  const departmentStrength = dashboardData?.departmentStrength || [];
  const punchActivity = dashboardData?.punchActivity || [];

  const statsData = [
    { title: "Total Employees", value: summary.totalEmployees || 0 },
    { title: "Present Today", value: summary.presentToday || 0 },
    { title: "Absent Today", value: summary.absentToday || 0 },
    { title: "Late Arrivals", value: summary.lateArrivals || 0 },
  ];

  const weeklyChartData = useMemo(
    () => ({
      labels: weeklyTrend.map((item) => item.day),
      datasets: [
        {
          label: "Present",
          data: weeklyTrend.map((item) => item.present),
          backgroundColor: "#10B981",
        },
        {
          label: "Absent",
          data: weeklyTrend.map((item) => item.absent),
          backgroundColor: "#EF4444",
        },
        {
          label: "Late",
          data: weeklyTrend.map((item) => item.late),
          backgroundColor: "#F59E0B",
        },
      ],
    }),
    [weeklyTrend],
  );

  const departmentChartData = useMemo(
    () => ({
      labels: departmentStrength.map((item) => item.department),
      datasets: [
        {
          data: departmentStrength.map((item) => item.count),
          backgroundColor: departmentColors,
          borderWidth: 0,
        },
      ],
    }),
    [departmentStrength],
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading Dashboard data" fullPage />;
  }

  if (isError) {
    return (
      <div className="employee-management">
        <div className="error-card">Failed to fetch data</div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      {/* 1. STATS ROW */}
      <div className="stats-grid">
        {statsData.map((item, idx) => {
          const IconComponent = statIcons[idx % statIcons.length];

          return (
            <StatCard
              key={idx}
              title={item.title}
              value={item.value}
              icon={() => (
                <div className="stat-icon-wrapper">
                  <IconComponent className="stat-icon" />
                </div>
              )}
            />
          );
        })}
      </div>

      {/* 2. FULL WIDTH WEEKLY TREND CHART */}
      <div className="full-width-chart-row">
        <div className="card-box">
          <h3 className="card-heading">Weekly Attendance Trend</h3>
          <p className="card-subtext">
            Present vs Absent vs Late — last 7 days
          </p>
          <div className="chart-wrapper">
            <Bar
              data={weeklyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: TODAY'S PUNCH ACTIVITY & DEPARTMENT-WISE STRENGTH */}
      <div className="bottom-activity-grid">
        {/* TODAY'S PUNCH ACTIVITY */}
        <div className="card-box">
          <div className="panel-header">
            <h3 className="card-heading">Today's Punch Activity</h3>
            <span className="live-badge">
              <FaFingerprint /> Live Feed
            </span>
          </div>
          <div className="punch-feed">
            {punchActivity.length > 0 ? (
              punchActivity.map((item, idx) => (
                <div key={`${item.employeeId}-${idx}`} className="punch-item">
                  <Avatar name={item.employeeName} size="small" />

                  <div className="punch-info">
                    <strong>{item.employeeName}</strong>
                    <p>
                      {item.department} • {item.punchInTime}
                    </p>
                  </div>

                  <span
                    className={`punch-status-badge badge-${item.status.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="card-subtext">No punch activity available.</p>
            )}
          </div>
        </div>

        <div className="card-box">
          <h3 className="card-heading">Department-wise Strength</h3>
          <p className="card-subtext">Employee distribution</p>

          <div className="doughnut-wrapper">
            <Doughnut
              data={departmentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                plugins: { legend: { display: false } },
              }}
            />
          </div>

          <div className="dept-legend">
            {departmentStrength.map((item, idx) => (
              <div className="legend-item" key={item.department}>
                <span>
                  <span
                    className="dot"
                    style={{
                      backgroundColor:
                        departmentColors[idx % departmentColors.length],
                    }}
                  ></span>
                  {item.department}
                </span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
