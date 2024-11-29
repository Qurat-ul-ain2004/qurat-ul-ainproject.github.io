import React from "react";

const EventList = ({ events }) => {
  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <div className="event-list">
      <h2>Upcoming Events</h2>
      {sortedEvents.map((event) => (
        <div key={event.id} className="event-item">
          <h3>{event.name}</h3>
          <p>
            <strong>Date:</strong> {new Date(event.start).toLocaleString()}
          </p>
          <p>
            <strong>Location:</strong> {event.location || "Not specified"}
          </p>
          {event.description && (
            <p>
              <strong>Description:</strong> {event.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventList;
