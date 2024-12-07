// pages/admin/index.tsx
import React, { useState } from 'react';
import CreateEvent from '../../components/CreateEvent';
import EventList from '../../components/EventList';
import Head from 'next/head';

const AdminPage = () => {
  const [newEvent, setNewEvent] = useState({
    id: '',
    name: '',
    type: '',
    featured: false,
    image: '',
    headerImage: '',
    dateTime: '',
    endDateTime: '',
    location: {
      venue: '',
      address: '',
      city: '',
      country: '',
      coordinates: { lat: 0, lng: 0 },
    },
    startingPrice: 0,
    organizer: { name: '', logo: '', description: '' },
    ticketTiers: [],
  });

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const handleTabChange = (tab: 'create' | 'list') => {
    setActiveTab(tab);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      const data = await response.json();
      if (response.ok) {
        setNewEvent({
          id: '',
          name: '',
          type: '',
          featured: false,
          image: '',
          headerImage: '',
          dateTime: '',
          endDateTime: '',
          location: { venue: '', address: '', city: '', country: '', coordinates: { lat: 0, lng: 0 } },
          startingPrice: 0,
          organizer: { name: '', logo: '', description: '' },
          ticketTiers: [],
        });
        alert('Event created successfully');
      } else {
        alert('Failed to create event');
      }
    } catch (err) {
      alert('Error creating event: ' + err.message);
    }
  };

  return (
  <>
    <Head>
        <title>Admin Dashboard</title>
      </Head>
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>

      {/* Tabs for creating and viewing events */}
      <div className="flex mb-8">
        <button
          onClick={() => handleTabChange('create')}
          className={`py-2 px-4 mr-4 rounded-lg ${
            activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
        >
          Create Event
        </button>
        <button
          onClick={() => handleTabChange('list')}
          className={`py-2 px-4 rounded-lg ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Events List
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'create' && <CreateEvent newEvent={newEvent} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />}
      {activeTab === 'list' && <EventList />}
    </div>
    </>
  );
};

export default AdminPage;
