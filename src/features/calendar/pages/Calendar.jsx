import { useState, useMemo } from "react";
import {
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiTrash2,
} from "react-icons/fi";
import {
  getCalendarGrid,
  formatMonthYear,
  getWeekdayLabels,
  formatDateKey,
} from "../../../utils/calendar";
import Button from "../../../components/Button/Button";
import CommonModal from "../../../components/CommonModal/CommonModal";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { useEvents, useAddEvent, useDeleteEvent } from "../api/calendarApi";
import { useAuth } from "../../auth/context/AuthContext";

import "./Calendar.css";

const LEGEND_ITEMS = [
  { type: "holiday", label: "Holiday" },
  { type: "event", label: "Event" },
  { type: "birthday", label: "Birthday" },
];

const WEEKDAY_LABELS = getWeekdayLabels();

const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const Calendar = () => {
  const { isAdmin } = useAuth(); // Auth context integration

  const [viewedDate, setViewedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const { data: fetchedEvents = [], isLoading } = useEvents();

  // React Query Mutations
  const { mutate: addEvent, isPending: isAdding } = useAddEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();

  const eventsByDate = useMemo(() => {
    return fetchedEvents.reduce((acc, event) => {
      if (!event.date) return acc;
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    }, {});
  }, [fetchedEvents]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "Event",
    time: "",
    notes: "",
  });

  const handlePrevMonth = () => {
    setViewedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const weeks = useMemo(
    () => getCalendarGrid(viewedDate.getFullYear(), viewedDate.getMonth()),
    [viewedDate]
  );

  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const handleOpenAddModal = () => {
    const today = new Date();
    setSelectedCell({
      date: today,
      dateKey: formatDateKey(today),
      day: today.getDate(),
      isCurrentMonth: true,
    });
    setNewEvent({
      title: "",
      type: "Event",
      time: getCurrentTimeString(),
      notes: "",
    });
    setIsAddingEvent(true);
    setIsModalOpen(true);
  };

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
    setIsAddingEvent(false);
    setNewEvent({
      title: "",
      type: "Event",
      time: getCurrentTimeString(),
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCell(null);
    setIsAddingEvent(false);
    setNewEvent({ title: "", type: "Event", time: "", notes: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedCell || !newEvent.title.trim()) return;

    const formattedType =
      newEvent.type.charAt(0).toUpperCase() + newEvent.type.slice(1);

    const payload = {
      event_title: newEvent.title.trim(),
      event_type: formattedType,
      event_date: selectedCell.dateKey,
      description: newEvent.notes.trim(),
      event_time: newEvent.time ? `${newEvent.time}:00` : "00:00:00",
    };

    addEvent(payload, {
      onSuccess: () => {
        setIsAddingEvent(false);
      },
    });
  };

  const handleOpenDeleteDialog = (evt) => {
    setDeleteTarget(evt);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deleteEvent(deleteTarget.id, {
      onSuccess: () => {
        handleCloseDeleteDialog();
      },
    });
  };

  const selectedDayEvents = selectedCell ? eventsByDate[selectedCell.dateKey] || [] : [];

  return (
    <div className="department-management">
      <div className="department-content-header">
        <div>
          <h1>Calendar</h1>
          <p>Organization-wide holidays, events and birthdays.</p>
        </div>

        {isAdmin && (
          <Button icon={FiPlus} onClick={handleOpenAddModal}>
            Add event
          </Button>
        )}
      </div>

      <div className="calendar-legend-card">
        {LEGEND_ITEMS.map((item) => (
          <span key={item.type} className="legend-item">
            <span className={`legend-dot legend-dot-${item.type}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="calendar-card">
        <div className="calendar-nav">
          <button
            type="button"
            className="calendar-nav-btn"
            aria-label="Previous month"
            onClick={handlePrevMonth}
          >
            <FiChevronLeft />
          </button>

          <span className="calendar-title">{formatMonthYear(viewedDate)}</span>

          <button
            type="button"
            className="calendar-nav-btn"
            aria-label="Next month"
            onClick={handleNextMonth}
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="calendar-weekday-row">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="calendar-weekday">
              {label}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-muted">Loading calendar events...</div>
        ) : (
          <div className="calendar-grid">
            {weeks.map((week) =>
              week.map((cell) => {
                const dayEvents = eventsByDate[cell.dateKey] || [];
                const isToday = cell.dateKey === todayKey;

                return (
                  <div
                    key={cell.dateKey}
                    className={`calendar-cell ${
                      !cell.isCurrentMonth ? "calendar-cell-inactive" : ""
                    } ${isToday ? "calendar-cell-today" : ""}`}
                    onClick={() => handleCellClick(cell)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleCellClick(cell);
                    }}
                  >
                    <span className={`calendar-day-number ${isToday ? "today-badge" : ""}`}>
                      {cell.day}
                    </span>

                    <div className="calendar-events-container">
                      {dayEvents.map((event, index) => (
                        <span
                          key={event.id || index}
                          className={`event-pill event-pill-${event.type}`}
                          title={event.title}
                        >
                          <span className="event-pill-title">{event.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Interactive Modal */}
      <CommonModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={
          selectedCell
            ? `Events on ${selectedCell.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : "Calendar Details"
        }
        subtitle={
          isAddingEvent
            ? "Provide event details to update calendar"
            : "Scheduled events for this date"
        }
      >
        {!isAddingEvent ? (
          <div className="calendar-modal-content">
            {selectedDayEvents.length === 0 ? (
              <div className="empty-events-state">
                <FiCalendar className="empty-icon" />
                <p>No events scheduled for this date.</p>
              </div>
            ) : (
              <div className="events-modal-list">
                {selectedDayEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className={`event-card-item event-border-${evt.type}`}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <h5 className="mb-1 text-dark fw-semibold">{evt.title}</h5>
                        <span className={`event-pill event-pill-${evt.type} d-inline-block mb-1`}>
                          {evt.type}
                        </span>
                      </div>

                      {/* Visible only for Admin */}
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0 border-0 ms-2"
                          title="Delete event"
                          aria-label="Delete event"
                          onClick={() => handleOpenDeleteDialog(evt)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>

                    {evt.time && (
                      <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                        <FiClock /> <span>{evt.time}</span>
                      </div>
                    )}

                    {evt.notes && <p className="small text-secondary mb-0">{evt.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-top mt-3 d-flex justify-content-between align-items-center">
              <Button type="button" variant="secondary" onClick={handleModalClose}>
                Close
              </Button>

              {/* Visible only for Admin */}
              {isAdmin && (
                <Button
                  type="button"
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => {
                    setNewEvent({
                      title: "",
                      type: "Event",
                      time: getCurrentTimeString(),
                      notes: "",
                    });
                    setIsAddingEvent(true);
                  }}
                >
                  Add Event
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div className="d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold small text-secondary mb-1">
                  Event Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control shadow-none"
                  placeholder="e.g. Quarterly Planning"
                  value={newEvent.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold small text-secondary mb-1">
                    Event Type
                  </label>
                  <select
                    name="type"
                    className="form-select shadow-none"
                    value={newEvent.type}
                    onChange={handleFormChange}
                  >
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Birthday">Birthday</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold small text-secondary mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    className="form-control shadow-none"
                    value={newEvent.time}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold small text-secondary mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  className="form-control shadow-none"
                  rows={3}
                  placeholder="Additional context or notes..."
                  value={newEvent.notes}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="pt-3 border-top mt-3 d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddingEvent(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isAdding}>
                {isAdding ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </form>
        )}
      </CommonModal>

      <ConfirmDialog
        show={Boolean(deleteTarget)}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title || "this event"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Calendar;