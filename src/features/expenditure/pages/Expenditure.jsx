import { useMemo, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FiPlus, FiCheck, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

import TablePagination from "../../../components/TablePagination/TablePagination";
import TableToolbar from "../../../components/TableToolbar/TableToolbar";
import DataTable from "../../../components/DataTable/DataTable";
import CommonModal from "../../../components/CommonModal/CommonModal";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import Button from "../../../components/Button/Button";

import {
  useExpenditures,
  useAddExpenditure,
  useUpdateExpenditure,
  useDeleteExpenditure,
} from "../api/expenditureApi";

const PAYMENT_METHODS = ["UPI", "Bank Transfer", "Cash"];

const EMPTY_FORM = {
  id: null,
  title: "",
  amount: "",
  paymentMethod: "UPI",
  date: "",
  purpose: "",
};

const Expenditure = () => {
  const { data: rawExpenditures = [], isLoading } = useExpenditures();
  const { mutate: handleAdd, isPending: isAdding } = useAddExpenditure();
  const { mutate: handleUpdate, isPending: isUpdating } = useUpdateExpenditure();
  const { mutate: handleDelete, isPending: isDeleting } = useDeleteExpenditure();

  const [expenditureForm, setExpenditureForm] = useState(EMPTY_FORM);
  const [expenditureModal, setExpenditureModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    paymentMethod: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Normalize backend payload structure
  const expenditures = useMemo(() => {
    return rawExpenditures.map((item) => ({
      expenditureId: item.expenditure_id,
      title: item.title,
      amount: item.amount,
      paymentMethod: item.payment_method,
      date: item.date ? item.date.split("T")[0] : "",
      purpose: item.purpose || "",
    }));
  }, [rawExpenditures]);

  // Form input handler
  const handleExpenditureChange = (e) => {
    const { name, value } = e.target;
    setExpenditureForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modal actions
  const handleOpenCreateModal = () => {
    setExpenditureForm(EMPTY_FORM);
    setExpenditureModal(true);
  };

  const handleOpenEditModal = (row) => {
    setExpenditureForm({
      id: row.expenditureId,
      title: row.title,
      amount: row.amount,
      paymentMethod: row.paymentMethod,
      date: row.date,
      purpose: row.purpose,
    });
    setExpenditureModal(true);
  };

  const handleCloseModal = () => {
    setExpenditureModal(false);
    setExpenditureForm(EMPTY_FORM);
  };

  // Delete modal actions
  const handleOpenDeleteDialog = (row) => {
    setDeleteTarget(row);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    handleDelete(deleteTarget.expenditureId, {
      onSuccess: () => handleCloseDeleteDialog(),
    });
  };

  // Submit Handler (Create & Update)
  const handleSaveExpenditure = (e) => {
    e.preventDefault();

    if (
      !expenditureForm.title ||
      !expenditureForm.amount ||
      !expenditureForm.date ||
      !expenditureForm.paymentMethod
    ) {
      toast.error("Please fill required fields");
      return;
    }

    const numericAmount = Number(
      String(expenditureForm.amount).replace(/[^0-9.]/g, "")
    );

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const payload = {
      title: expenditureForm.title,
      amount: numericAmount,
      payment_method: expenditureForm.paymentMethod,
      date: expenditureForm.date,
      purpose: expenditureForm.purpose,
    };

    if (expenditureForm.id) {
      handleUpdate(
        { id: expenditureForm.id, data: payload },
        { onSuccess: () => handleCloseModal() }
      );
    } else {
      handleAdd(payload, {
        onSuccess: () => {
          setCurrentPage(1);
          handleCloseModal();
        },
      });
    }
  };

  // Filters and Search Logic
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: "", paymentMethod: "" });
    setCurrentPage(1);
  };

  const filteredExpenditures = useMemo(() => {
    return expenditures.filter((item) => {
      const searchValue = filters.search.trim().toLowerCase();

      const searchMatch =
        !searchValue ||
        item.title?.toLowerCase().includes(searchValue) ||
        item.paymentMethod?.toLowerCase().includes(searchValue) ||
        item.amount?.toString().includes(searchValue) ||
        item.date?.toLowerCase().includes(searchValue) ||
        item.purpose?.toLowerCase().includes(searchValue);

      const paymentMatch =
        !filters.paymentMethod ||
        item.paymentMethod === filters.paymentMethod;

      return searchMatch && paymentMatch;
    });
  }, [expenditures, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenditures.length / pageSize) || 1;
  const safeCurrentPage =
    currentPage > totalPages ? totalPages : currentPage;

  const paginatedExpenditures = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredExpenditures.slice(startIndex, startIndex + pageSize);
  }, [filteredExpenditures, safeCurrentPage, pageSize]);

  // Table Columns Setup
  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
      },
      {
        key: "amount",
        header: "Amount",
        render: (row) => (
          <span>₹ {Number(row.amount).toLocaleString("en-IN")}</span>
        ),
      },
      {
        key: "paymentMethod",
        header: "Payment Method",
      },
      {
        key: "date",
        header: "Date",
      },
      {
        key: "purpose",
        header: "Purpose",
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "cell-right",
        cellClassName: "cell-right",
        render: (row) => (
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="shift-action-btn edit-btn"
              onClick={() => handleOpenEditModal(row)}
              title="Edit Expenditure"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              className="shift-action-btn delete-btn"
              onClick={() => handleOpenDeleteDialog(row)}
              title="Delete Expenditure"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="employee-management">
      <div className="department-content-header">
        <div>
          <h1>Expenditure Management</h1>
          <p>Manage and track organization's expenditures.</p>
        </div>
        <Button icon={FiPlus} onClick={handleOpenCreateModal}>
          Add Expenditure
        </Button>
      </div>
      <div className="employee-content-card">
      <TableToolbar
        filters={[
          {
            type: "search",
            name: "search",
            placeholder: "Search expenditures...",
          },
          {
            type: "select",
            name: "paymentMethod",
            placeholder: "Payment",
            options: PAYMENT_METHODS.map((method) => ({
              value: method,
              label: method,
            })),
          },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={paginatedExpenditures}
        rowKey="expenditureId"
        loading={isLoading}
        emptyMessage="No expenditures found."
      />

      {filteredExpenditures.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredExpenditures.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      )}
      </div>

      {/* Add / Edit Expenditure Modal */}
      <CommonModal
        isOpen={expenditureModal}
        onClose={handleCloseModal}
        title={expenditureForm.id ? "Edit Expenditure" : "Add Expenditure"}
        subtitle={
          expenditureForm.id
            ? "Update existing expenditure details."
            : "Record a new organization expenditure."
        }
      >
        <form onSubmit={handleSaveExpenditure}>
          <div className="d-flex flex-column gap-3">
            {/* Title */}
            <div>
              <Form.Label className="form-label fw-semibold small text-secondary mb-1">
                Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={expenditureForm.title}
                onChange={handleExpenditureChange}
                placeholder="Add expenditure name"
                className="shadow-none"
                required
              />
            </div>

            <Row className="g-3">
              {/* Amount */}
              <Col md={6}>
                <div>
                  <Form.Label className="form-label fw-semibold small text-secondary mb-1">
                    Amount (₹) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="amount"
                    value={expenditureForm.amount}
                    onChange={handleExpenditureChange}
                    placeholder="Enter amount"
                    className="shadow-none"
                    required
                  />
                </div>
              </Col>

              {/* Payment Method */}
              <Col md={6}>
                <div>
                  <Form.Label className="form-label fw-semibold small text-secondary mb-1">
                    Payment Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={expenditureForm.paymentMethod}
                    onChange={handleExpenditureChange}
                    className="shadow-none"
                    required
                  >
                    {PAYMENT_METHODS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
            </Row>

            {/* Expense Date */}
            <div>
              <Form.Label className="form-label fw-semibold small text-secondary mb-1">
                Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={expenditureForm.date}
                onChange={handleExpenditureChange}
                className="shadow-none"
                required
              />
            </div>

            {/* Purpose / Description */}
            <div>
              <Form.Label className="form-label fw-semibold small text-secondary mb-1">
                Purpose
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="purpose"
                value={expenditureForm.purpose}
                onChange={handleExpenditureChange}
                placeholder="Add optional expense details..."
                className="shadow-none"
              />
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="pt-4 d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isAdding || isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={FiCheck}
              disabled={isAdding || isUpdating}
            >
              {expenditureForm.id ? "Update Expenditure" : "Save Expenditure"}
            </Button>
          </div>
        </form>
      </CommonModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={Boolean(deleteTarget)}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Expenditure"
        message={`Are you sure you want to delete "${deleteTarget?.title || "this item"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Expenditure;