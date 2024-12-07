// components/EventList.tsx
import React, { useState, useEffect } from 'react';
import { Spinner } from './ui';

interface Event {
  id: string;
  name: string;
  type: string;
}

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch events when the component mounts
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        setError('Error fetching events: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Events List</h2>
      {events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <ul className="space-y-6">
          {events.map((event) => (
            <li key={event.id} className="flex flex-col sm:flex-row items-center justify-between border-b py-4">
              <div>
                <h3 className="text-xl font-semibold">{event.name}</h3>
                <p className="text-sm text-gray-500">{event.type}</p>
              </div>
              <div className="flex space-x-4 mt-4 sm:mt-0">
                <button className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600">
                  Edit
                </button>
                <button className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;
