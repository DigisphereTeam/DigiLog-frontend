import { useState, useMemo } from "react";
import DataTable from "../../../components/DataTable/DataTable";
import TablePagination from "../../../components/TablePagination/TablePagination";
import CommonModal from "../../../components/CommonModal/CommonModal";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "../../../components/Button/Button";
import { useAuth } from "../../auth/context/AuthContext"; 
import {
  useShifts,
  useAddShift,
  useUpdateShift,
  useDeleteShift,
} from "../api/shiftApi";

import "./ShiftManagement.css";

const SHIFT_OPTIONS = [
  { label: "General Shift", value: "General Shift" },
  { label: "Morning Shift", value: "Morning Shift" },
  { label: "Night Shift", value: "Night Shift" },
];

const EMPTY_FORM = {
  id: null,
  shiftType: "General Shift",
  fromTime: "09:30",
  toTime: "18:00",
};

const PAGE_SIZE = 5;

const Shifts = () => {
  const { isAdmin } = useAuth(); 

  const { data: shifts = [], isLoading } = useShifts();
  const { mutate: handleAddShift, isPending: isAdding } = useAddShift();
  const { mutate: handleUpdateShift, isPending: isUpdating } = useUpdateShift();
  const { mutate: handleDeleteShift, isPending: isDeleting } = useDeleteShift();

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // State for Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalRecords = shifts.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  const paginatedShifts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return shifts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [shifts, currentPage]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shift) => {
    setFormData({
      id: shift.id,
      shiftType: shift.shiftType,
      fromTime: shift.fromTime,
      toTime: shift.toTime,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(EMPTY_FORM);
  };

  // Delete Handlers
  const handleOpenDeleteDialog = (shift) => {
    setDeleteTarget(shift);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    handleDeleteShift(deleteTarget.id, {
      onSuccess: () => {
        handleCloseDeleteDialog();
      },
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const payload = {
      shift_type: formData.shiftType,
      start_time: formData.fromTime.length === 5 ? `${formData.fromTime}:00` : formData.fromTime,
      end_time: formData.toTime.length === 5 ? `${formData.toTime}:00` : formData.toTime,
    };

    if (formData.id) {
      handleUpdateShift(
        { id: formData.id, data: payload },
        {
          onSuccess: () => handleCloseModal(),
        }
      );
    } else {
      handleAddShift(payload, {
        onSuccess: () => handleCloseModal(),
      });
    }
  };

  // Dynamically generate columns based on role
  const columns = useMemo(() => {
    const cols = [
      {
        key: "shiftType",
        header: "Shift Type",
        render: (row) => <span className="shift-type-name">{row.shiftType}</span>,
      },
      {
        key: "fromTime",
        header: "From Time",
        render: (row) => <span className="shift-time-text">{row.fromTime}</span>,
      },
      {
        key: "toTime",
        header: "To Time",
        render: (row) => <span className="shift-time-text">{row.toTime}</span>,
      },
    ];

    // Only add Actions column for Admins
    if (isAdmin) {
      cols.push({
        key: "actions",
        header: "Actions",
        headerClassName: "cell-right",
        cellClassName: "cell-right",
        render: (row) => (
          <div className="shift-actions-cell">
            <button
              type="button"
              className="shift-action-btn edit-btn"
              onClick={() => handleOpenEditModal(row)}
              title="Edit Shift"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              className="shift-action-btn delete-btn"
              onClick={() => handleOpenDeleteDialog(row)}
              title="Delete Shift"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      });
    }

    return cols;
  }, [isAdmin]);

  return (
    <div className="employee-management">

      <div className="department-content-header">
        <div>
          <h1 >Shift Management</h1>
          <p >Manage schedule shift timings</p>
        </div>

        {isAdmin && (
          <Button icon={FiPlus} onClick={handleOpenCreateModal}>
            <span>New Shift</span>
          </Button>
        )}
      </div>
      

      <div className="shift-table-card">
        <DataTable
          columns={columns}
          data={paginatedShifts}
          rowKey="id"
          loading={isLoading}
          emptyMessage="No shifts available."
        />

        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={PAGE_SIZE}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      </div>

      <CommonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={formData.id ? "Edit Shift" : "Assign New Shift"}
        subtitle={
          formData.id
            ? "Update existing shift timings"
            : "Select shift type and enter timings"
        }
        primaryLabel={formData.id ? "Update Shift" : "Assign Shift"}
        secondaryLabel="Cancel"
        onSecondaryClick={handleCloseModal}
        formId="shift-form"
        isSubmitting={isAdding || isUpdating}
        maxWidth="540px"
      >
        <form id="shift-form" onSubmit={handleFormSubmit} className="shift-form">
          <div className="form-group">
            <label className="form-label">Shift Type *</label>
            <select
              className="form-control"
              value={formData.shiftType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shiftType: e.target.value }))
              }
              required
            >
              {SHIFT_OPTIONS.map((shift) => (
                <option key={shift.value} value={shift.value}>
                  {shift.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Time *</label>
              <input
                type="time"
                className="form-control"
                value={formData.fromTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fromTime: e.target.value }))
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">To Time *</label>
              <input
                type="time"
                className="form-control"
                value={formData.toTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, toTime: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </form>
      </CommonModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={Boolean(deleteTarget)}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Shift"
        message={`Are you sure you want to delete the "${deleteTarget?.shiftType || "selected"}" shift? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Shifts;