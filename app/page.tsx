"use client";

import React, { useState, useEffect } from "react";
import { FaThLarge, FaHeart, FaAlignCenter, FaSearch } from "react-icons/fa";

interface Event {
  id: string;
  title: string;
  start: string;
  location?: string;
  description?: string;
  geo?: {
    address?: {
      formatted_address?: string;
    };
  };
}

interface SidebarItem {
  title: string;
  isFavorited: boolean;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /*const [items, setItems] = useState<SidebarItem[]>(Array(12).fill({ title: "Web Development", isFavorited: false }));*/
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Add state to manage modal visibility
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [filteredSidebarEvents, setFilteredSidebarEvents] = useState<Event[]>([]);
  const [showUpcomingEvents, setShowUpcomingEvents] = useState(false);
  const [isDashboardView, setIsDashboardView] = useState(true);
  

  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(
          "https://api.predicthq.com/v1/events?category=school-holidays%2Cpolitics%2Cconcerts%2Cfestivals%2Cacademic%2Cconferences&country=PK&end_around.origin=2025-12-31&limit=180",
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer miSpR6EHxqAzET1F0SXtePBJ3p7PnXE35M_J0XGs`, // Ensure API token is kept safe
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        console.log(data);
        setEvents(data.results || []);
        setDisplayedEvents(data.results || []);


        // Set Sidebar items dynamically from events
        const sidebarItems = data.results.map((event: Event) => ({
          title: event.title,
          isFavorited: false,
        }));
        const eventsWithAddress = data.results.map((event: Event) => ({
          ...event,
          location: event.geo?.address?.formatted_address || "No address available", // Map formatted address
        }));
        setEvents(eventsWithAddress || []);
      setDisplayedEvents(eventsWithAddress || []);
        
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }
    fetchEvents();
  }, []);

  // Toggle sidebar menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const toggleUpcomingEvents = () => {
    setShowUpcomingEvents(!showUpcomingEvents);
    setShowFavorites(false); // Ensure favorites view is disabled
    setIsDashboardView(false);
  };
    // Open event description modal
    const handleEventClickk = (eventId: string) => {
      setSelectedEvent(eventId);
      setShowModal(true); // Show modal when an event is clicked
    };
   // Handle date changes and filter events
   const handleDateChange = () => {
    if (startDate && endDate) {
      const filtered = events.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
      });
  
      // Update the filtered events for the sidebar
      setFilteredSidebarEvents(filtered);
      setDisplayedEvents(filtered); // Update main display as well
      setIsDashboardView(false);
    }
  };
  const handleDashboardClick = () => {
    setIsDashboardView(true); // Activate the dashboard view
    setShowFavorites(false); // Close favorites tab
    setFilteredSidebarEvents([]); // Clear filtered events
    setShowUpcomingEvents(false);
    setIsMenuOpen(false);  
    setSearchQuery("");
  };
  

  const toggleFavorite = (event: Event) => {
    const isAlreadyFavorited = favoriteEvents.some((e) => e.id === event.id);
    if (isAlreadyFavorited) {
      setFavoriteEvents(favoriteEvents.filter((e) => e.id !== event.id));
    } else {
      setFavoriteEvents([...favoriteEvents, event]);
    }
    setIsDashboardView(false);
  };


  // Sort events by date (ascending)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Open event description modal
  const handleEventClick = (eventId: string) => {
    setSelectedEvent(eventId);
    setShowModal(true); // Show modal when an event is clicked
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredEvents = events
    .filter((event) => {
      const isUpcoming = new Date(event.start) >= new Date();
      const matchesQuery = event.title.toLowerCase().includes(searchQuery);

      if (showFavorites) return matchesQuery && favoriteEvents.some((e) => e.id === event.id);
      if (showUpcomingEvents) return matchesQuery && isUpcoming;

      return matchesQuery;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const eventsToDisplay = displayedEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="dashboard">
    {/* Sidebar */}
    <aside className="sidebar">
      <div className="sidebar-icon active" onClick={handleDashboardClick}>
        <FaThLarge />
      </div>
      <button className="menu-button" onClick={toggleMenu}>
          <FaAlignCenter /></button>

          <div className={`leftbar ${isMenuOpen ? "show" : ""}`} id="leftbar">
  {isMenuOpen && (
     <div>
     <button onClick={toggleUpcomingEvents}>
       {showUpcomingEvents ? "Show All Events" : "Show Upcoming Events"}
     </button>
      <p>Enter starting date</p>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start Date"
      />
      <p>Ending date</p>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End Date"
      />
      <button onClick={handleDateChange}>Filter</button>
    </div>
  )}

  {/* Display filtered events */}
  {filteredSidebarEvents.length > 0 && (
    <div className="filtered-events">
      <h3>Events</h3>
      <ul>
        {filteredSidebarEvents.map((event) => (
          <li key={event.id}>
            <p>{event.title}</p>
            <small>{new Date(event.start).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )}
  </div>
      <div
        className="sidebar-icon"
        onClick={() => setShowFavorites(!showFavorites)} // Toggle favorites view
      >
        <FaHeart className={showFavorites ? "active" : ""} />
      </div>
    </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <img src="/image/image.png" alt="Logo" className="logo" />
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            className="search-bar"
            value={searchQuery}
            onChange={handleSearchChange} // Handling input change
          />
        </header>

        {/* Event Table */}
        <div className="event-table">
        
          <h2> {showFavorites
              ? "Favorite Events"
              : showUpcomingEvents
              ? "Upcoming Events"
              : "All Events"}</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>NAME</th>
                <th>TIME</th>
                <th>DATE</th>
                <th>LOCATION</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
  {filteredEvents.map((event, index) => (
    <tr key={event.id} onClick={() => handleEventClick(event.id)}>
      <td>{index + 1}</td>
      <td className="clickable-event-title">{event.title || "No Title"}</td>
      <td>{new Date(event.start).toLocaleTimeString()}</td>
      <td>{new Date(event.start).toLocaleDateString()}</td>
      <td>{event.location || "N/A"}</td> 
      <td>
                    <FaHeart
                      className={`favorite-icon ${
                        favoriteEvents.some((e) => e.id === event.id) ? "favorited" : ""
                      }`}
                      onClick={() => toggleFavorite(event)}
                    />
                  </td>
    </tr>
  ))}
</tbody>
 </table>
        </div>
        {/* Event Description Modal */}
{showModal && selectedEvent && (
  <div className="overlay" onClick={closeModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="close-button" onClick={closeModal}>
        &times; {/* Close Button */}
      </button>
      {events
        .filter((event) => event.id === selectedEvent)
        .map((event) => (
          <div key={event.id}>
            <h3>{event.title}</h3>
            <p>
              <strong>Description:</strong>{" "}
              {event.description || "No description available."}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {event.location || "No location specified."}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(event.start).toLocaleDateString()}{" "}
              {new Date(event.start).toLocaleTimeString()}
            </p>
          </div>
        ))}
    </div>
  </div>
)}

           
        {/* Details Section */}
   <footer className="details-section">
  <div className="stat">
    <button>
  <h3>{events.length}</h3>
  <p>All Events</p>
  </button>
  </div>
  <div className="stat">
  <button>
    <h3>
      {
        events.filter(
          (e) =>
           new Date(e.start).getMonth() === new Date().getMonth()
     ).length
      }
    </h3>
    <p>This Month Events</p>
    </button>
  </div>
  <div className="stat">
    <button>
    <h3>{favoriteEvents.length}</h3>
    <p>Favorite Events</p>
    </button>
  </div>
</footer>

          
          </div>
          </div>
  );
}
