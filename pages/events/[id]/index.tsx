import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { CalendarIcon, MapPinIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { TicketSelector } from "@/components/TicketSelector";
import Head from "next/head";

// Define the types for event, location, and organizer
interface Location {
  address: string;
  coordinates: { lat: number; lng: number };
  venue: string;
  city: string;
  country: string;
}

interface Organizer {
  name: string;
  description: string;
  logo: string;
}

interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
}

interface Event {
  id: string;
  name: string;
  type: string;
  dateTime: string;
  endDateTime: string;
  headerImage: string;
  location: Location;
  organizer: Organizer;
  featured: boolean;
  image: string;
  startingPrice: number;
  ticketTiers: TicketTier[];
}

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        const { event } = await response.json();
        setEvent(event || null); // Set event to null if not found
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 font-semibold">Error: {error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold">No Event Found</h1>
        <p className="text-gray-600">The event you&apos;re looking for does not exist.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-[#099C77] text-white rounded-md"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Event Details</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-[400px] w-full">
          <Image
            src={event.headerImage}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-8 left-8">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-white bg-[#099C77] rounded-full">
              {event.type}
            </span>
            <h1 className="text-4xl font-bold text-white">{event.name}</h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-[#099C77]" />
                    <span>
                      {format(new Date(event.dateTime), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#099C77]" />
                    <span>
                      {format(new Date(event.dateTime), "h:mm a")} -{" "}
                      {format(new Date(event.endDateTime), "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-[#099C77]" />
                    <span>
                      {event.location.venue}, {event.location.city},{" "}
                      {event.location.country}
                    </span>
                  </div>
                </div>
              </section>

              {/* About Section */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">About the Event</h2>
                <p className="text-gray-600">{event.organizer.description}</p>
              </section>

              {/* Organizer Section */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Organizer</h2>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image
                      src={event.organizer.logo}
                      alt={event.organizer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.organizer.name}</h3>
                    <p className="text-sm text-gray-600">Event Organizer</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Ticket Selection Sidebar */}
            <div className="lg:col-span-1">
              <TicketSelector event={event} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
