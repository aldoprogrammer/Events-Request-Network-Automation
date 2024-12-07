import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface TicketTier {
    id?: string;
    name: string;
    price: number;
    description: string;
    available: number;
}

interface Event {
    id?: string;
    name: string;
    type: string;
    featured: boolean;
    image: string;
    headerImage: string;
    dateTime: string;
    endDateTime: string;
    location: {
        venue: string;
        address: string;
        city: string;
        country: string;
        coordinates: { lat: number; lng: number };
    };
    startingPrice: number;
    organizer: { name: string; logo: string; description: string };
    ticketTiers: TicketTier[];
}

const CreateEvent = () => {
    const [answer, setAnswer] = useState("");
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Accessing API key from environment variable
    console.log('api key', API_KEY);
    const [newEvent, setNewEvent] = useState<Event>({
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        name: string
    ) => {
        const { value } = e.target;

        if (name.startsWith('location')) {
            const locationField = name.split('.')[1];
            setNewEvent((prevState) => ({
                ...prevState,
                location: {
                    ...prevState.location,
                    [locationField]: value,
                },
            }));
        } else if (name.startsWith('organizer')) {
            const organizerField = name.split('.')[1];
            setNewEvent((prevState) => ({
                ...prevState,
                organizer: {
                    ...prevState.organizer,
                    [organizerField]: value,
                },
            }));
        } else if (name === 'featured') {
            setNewEvent((prevState) => ({
                ...prevState,
                featured: !prevState.featured, // Toggle nilai featured
            }));
        }
        else {
            setNewEvent((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleTicketTierChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
        field: keyof TicketTier
    ) => {
        const updatedTicketTiers = [...newEvent.ticketTiers];
        updatedTicketTiers[index][field] = e.target.value;
        setNewEvent({ ...newEvent, ticketTiers: updatedTicketTiers });
    };

    const addTicketTier = () => {
        setNewEvent({
            ...newEvent,
            ticketTiers: [
                ...newEvent.ticketTiers,
                { id: '', name: '', price: 0, description: '', available: 0 },
            ],
        });
    };




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation logic
        let errors: string[] = [];

        // Check required fields (you can add more fields as needed)
        if (!newEvent.id) errors.push("Event ID is required.");
        if (!newEvent.name) errors.push("Event Name is required.");
        if (!newEvent.type) errors.push("Event Type is required.");
        if (!newEvent.image) errors.push("Event Image is required.");
        if (!newEvent.headerImage) errors.push("Event Header Image is required.");
        if (!newEvent.ticketTiers.length) errors.push("At least one ticket tier is required.");
        if (!newEvent.dateTime) errors.push("Start Time is required.");
        if (!newEvent.endDateTime) errors.push("End Time is required.");
        if (!newEvent.location.venue) errors.push("Venue is required.");
        if (!newEvent.location.city) errors.push("City is required.");
        if (!newEvent.location.country) errors.push("Country is required.");
        if (!newEvent.location.address) errors.push("Address is required.");
        if (!newEvent.organizer.name) errors.push("Organizer Name is required.");
        if (!newEvent.organizer.logo) errors.push("Organizer Logo is required.");
        if (!newEvent.startingPrice) errors.push("Starting Price is required.");

        // For each ticket tier, validate required fields
        newEvent.ticketTiers.forEach((ticket, index) => {
            if (!ticket.name) errors.push(`Ticket Name for Ticket Tier ${index + 1} is required.`);
            if (ticket.price <= 0) errors.push(`Price for Ticket Tier ${index + 1} must be greater than zero.`);
            if (ticket.available <= 0) errors.push(`Available quantity for Ticket Tier ${index + 1} must be greater than zero.`);
        });

        // If errors exist, show them as an alert
        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });

            console.log('payload', newEvent);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Failed to create event: ${errorText}`);
            }

            const result = await response.json();
            console.log('Event created successfully:', result);
            alert('Event created successfully');
        } catch (error) {
            console.error('Error creating event:', error);
            const errorMessage = `${error.message}\n'}`;
            alert(errorMessage);
        }

    };

    function handleGenerateAI(ticket: TicketTier, index: number): void {
        const fetchTicketTierDescription = async () => {
            const staticQuestion = `
            Make a short two simple pharagpraph description of the ticket tier, based on the following details:
        
            Event Name: ${newEvent.name}
            Event Type: ${newEvent.type}
            Event Date Time: ${newEvent.dateTime}
            Event End Date Time: ${newEvent.endDateTime}
            Event Venue: ${newEvent.location.venue}
            Event Address: ${newEvent.location.address}
            Event City: ${newEvent.location.city}
            Event Country: ${newEvent.location.country}
            Event Starting Price: ${newEvent.startingPrice}
            Event Organizer Name: ${newEvent.organizer.name}
            Event Organizer Description: ${newEvent.organizer.description}
          `;

            try {
                setLoading(true); // Show loading state

                const genAI = new GoogleGenerativeAI(API_KEY as string);
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash-latest",
                });

                const result = await model.generateContent([staticQuestion]); // Await async call
                const text = await result.response.text(); // Await async response processing

                // Update ticket description
                handleTicketTierChange({ target: { value: text } }, index, 'description');
                setLoading(false); // Hide loading state
            } catch (error) {
                setLoading(false); // Ensure loading state is removed in case of an error
                console.error("Error fetching data: ", error);
                alert("Error fetching data. Please try again later.");
            }
        };

        // Call the async function
        fetchTicketTierDescription();
    }

    // Function to generate AI description for the organizer
    const handleGenerateOrganizerDescription = async () => {
        const staticQuestion = `
      Generate a short 3 lines description for the event organizer, based on the following details:
    
       Event Name: ${newEvent.name}
            Event Type: ${newEvent.type}
            Event Date Time: ${newEvent.dateTime}
            Event End Date Time: ${newEvent.endDateTime}
            Event Venue: ${newEvent.location.venue}
            Event Address: ${newEvent.location.address}
            Event City: ${newEvent.location.city}
            Event Country: ${newEvent.location.country}
    `;

        try {
            setLoading(true); // Set loading to true to indicate the API call is in progress

            const genAI = new GoogleGenerativeAI(API_KEY as string);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash-latest",
            });

            const result = await model.generateContent([staticQuestion]); // Get AI content
            const text = await result.response.text(); // Extract the text response

            // Update the event description field with the generated text
            handleInputChange({ target: { value: text } }, 'organizer.description');
            setLoading(false); // Set loading to false once the API call finishes
        } catch (error) {
            setLoading(false); // Hide loading state on error
            console.error("Error generating AI description: ", error);
            alert("Error generating description. Please try again later.");
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-semibold text-center mb-6">Create New Event</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className='grid grid-cols-2 gap-6 items-center'>
                    {/* Event ID */}
                    <div>
                        <label htmlFor="id" className="block text-sm font-medium text-gray-700">Event ID</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={newEvent.id}
                            onChange={(e) => handleInputChange(e, 'id')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* Small description below the input */}
                        <small className="block text-xs text-gray-500 mt-1">
                            The Event ID should be unique.
                        </small>
                    </div>
                    {/* Featured Checkbox */}
                    <div className='-mt-[6px]'>
                        <label htmlFor="featured" className="block text-sm font-medium text-gray-700">
                            Featured Event
                        </label>
                        <div className="inline-flex items-center">
                            <label className="flex items-center cursor-pointer relative">
                                <input
                                    type="checkbox"
                                    checked={newEvent.featured}
                                    onChange={() => handleInputChange({ target: { value: '' } } as any, 'featured')}
                                    className="peer h-[48px] w-[400px] cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                    id="check"
                                />
                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                {/* Event Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newEvent.name}
                        onChange={(e) => handleInputChange(e, 'name')}
                        className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Event Type */}
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
                    <select
                        id="type"
                        name="type"
                        value={newEvent.type}
                        onChange={(e) => handleInputChange(e, 'type')}
                        className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Event Type</option>
                        <option value="workshop">Workshop</option>
                        <option value="concert">Concert</option>
                        <option value="conference">Conference</option>
                    </select>
                </div>

                {/* Start and end time */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="datetime-local"
                            id="dateTime"
                            name="dateTime"
                            value={newEvent.dateTime}
                            onChange={(e) => handleInputChange(e, 'dateTime')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                            type="datetime-local"
                            id="endDateTime"
                            name="endDateTime"
                            value={newEvent.endDateTime}
                            onChange={(e) => handleInputChange(e, 'endDateTime')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                    {/* Event Image */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Event Image</label>
                        <input
                            type="text"
                            id="image"
                            name="image"
                            value={newEvent.image}
                            onChange={(e) => handleInputChange(e, 'image')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Event Header Image */}
                    <div>
                        <label htmlFor="headerImage" className="block text-sm font-medium text-gray-700">Event Header Image</label>
                        <input
                            type="text"
                            id="headerImage"
                            name="headerImage"
                            value={newEvent.headerImage}
                            onChange={(e) => handleInputChange(e, 'headerImage')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Event Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="location.venue" className="block text-sm font-medium text-gray-700">Venue</label>
                            <input
                                type="text"
                                id="location.venue"
                                name="location.venue"
                                value={newEvent.location.venue}
                                onChange={(e) => handleInputChange(e, 'location.venue')}
                                className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                id="location.city"
                                name="location.city"
                                value={newEvent.location.city}
                                onChange={(e) => handleInputChange(e, 'location.city')}
                                className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input
                                type="text"
                                id="location.country"
                                name="location.country"
                                value={newEvent.location.country}
                                onChange={(e) => handleInputChange(e, 'location.country')}
                                className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                id="location.address"
                                name="location.address"
                                value={newEvent.location.address}
                                onChange={(e) => handleInputChange(e, 'location.address')}
                                className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Organizer */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Organizer</label>
                    <div>
                        <label htmlFor="organizer.name" className="block text-sm font-medium text-gray-700">Organizer Name</label>
                        <input
                            type="text"
                            id="organizer.name"
                            name="organizer.name"
                            value={newEvent.organizer.name}
                            onChange={(e) => handleInputChange(e, 'organizer.name')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="organizer.description" className="block text-sm font-medium text-gray-700">Event Description</label>
                        <textarea
                            id="organizer.description"
                            name="organizer.description"
                            value={newEvent.organizer.description}
                            onChange={(e) => handleInputChange(e, 'organizer.description')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                        <button
                            type="button"
                            onClick={handleGenerateOrganizerDescription}
                            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md"
                        >
                            {loading ? 'Generating...' : 'Generate AI Description'}
                        </button>
                    </div>
                    <br />
                    
                    <div>
                        <label htmlFor="organizer.logo" className="block text-sm font-medium text-gray-700">Organizer Logo</label>
                        <input
                            type="text"
                            id="organizer.logo"
                            name="organizer.logo"
                            value={newEvent.organizer.logo}
                            onChange={(e) => handleInputChange(e, 'organizer.logo')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Starting price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Starting Price</label>
                    <div>
                        <input
                            type="number"
                            id="startingPrice"
                            name="startingPrice"
                            value={newEvent.startingPrice}
                            onChange={(e) => handleInputChange(e, 'startingPrice')}
                            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Ticket Types */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ticket Types</label>
                    {newEvent.ticketTiers.map((ticket, index) => (
                        <div key={index} className="mt-4 border p-4 rounded-md">
                            {/* Ticket ID */}
                            <label htmlFor="ticketId" className='mt-2'>Ticket ID</label>
                            <input
                                type="text"
                                placeholder="Ticket ID"
                                value={ticket.id}
                                onChange={(e) => handleTicketTierChange(e, index, 'id')}
                                className="mt-2 p-3 mb-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {/* Small description below the input */}
                            <small className="block text-xs text-gray-500 mt-1">
                                The Ticket ID should be unique.
                            </small>
                            <label htmlFor="ticketName" className='mt-2'>Ticket Name</label>
                            <input
                                type="text"
                                placeholder="Ticket Name"
                                value={ticket.name}
                                onChange={(e) => handleTicketTierChange(e, index, 'name')}
                                className="mt-2 p-3 mb-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <label htmlFor="price" className='mt-2'>Price</label>
                            <input
                                type="number"
                                placeholder="Price"
                                value={ticket.price}
                                onChange={(e) => handleTicketTierChange(e, index, 'price')}
                                className="mb-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="description" className="mt-2">Description</label>
                            <textarea
                                placeholder="Description"
                                value={ticket.description} // Bind to ticket.description
                                onChange={(e) => handleTicketTierChange(e, index, 'description')}
                                className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                            <button type='button' onClick={() => handleGenerateAI(ticket, index)} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md">
                                {loading ? 'Generating Description...' : "Generate AI"}
                            </button>

                            <br />
                            <br />
                            <label htmlFor="available">Available Ticket</label>
                            <input
                                type="number"
                                placeholder="Available"
                                value={ticket.available}
                                onChange={(e) => handleTicketTierChange(e, index, 'available')}
                                className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={addTicketTier}
                            className="px-6 py-2 text-white bg-green rounded-md hover:bg-green-700 focus:outline-none "
                        >
                            Add Ticket Tier
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className="px-6 py-3 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none"
                    >
                        Submit Event
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
