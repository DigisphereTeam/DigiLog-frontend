import StatCard from "../../../components/StatCard/StatCard"
import TableToolbar from "../../../components/TableToolbar/TableToolbar"
import DataTable from "../../../components/DataTable/DataTable"
import TablePagination from "../../../components/TablePagination/TablePagination"


const EmployeeSalary = () => {
  return (
    <div className="employee-management">
            <div className="department-content-header">
                <div>
                    <h1>My Salary</h1>
                    <p>My payroll details and salary records</p>
                </div>
            </div>
            <div className="leaves-stats-grid">
                <StatCard
                  title="Net Salary"
                  value="30000"
                />
                <StatCard
                    title="Paid Leaves"
                    value="1"
                />
                <StatCard
                    title="LOP Days"
                    value="1"
                />
                <StatCard
                    title="Deductions"
                    value="1000"
                />
            </div>
            <div className="employee-content-card">
                <TableToolbar />
                <DataTable />
                <TablePagination />
            </div>
        </div>
  )
}

export default EmployeeSalary