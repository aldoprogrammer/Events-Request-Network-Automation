"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";

interface Event {
  id: string;
  name: string;
  type: string;
  image: string;
  dateTime: string;
  location: {
    city: string;
    country: string;
  };
  startingPrice: number;
}

export const EventShowcase = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        setEvents(data.events);
      } catch (err: any) {
        setError("Error fetching events: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const eventTypes = useMemo(
    () => ["All", ...new Set(events.map((event) => event.type))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const filtered = activeTab === "all"
      ? events
      : events.filter((event) => event.type.toLowerCase() === activeTab.toLowerCase());
    return [...filtered].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [events, activeTab]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <TabsList className="w-fit justify-start overflow-x-auto">
        {eventTypes.map((type) => (
          <TabsTrigger key={type} value={type.toLowerCase()}>
            {type}
          </TabsTrigger>
        ))}
      </TabsList>

      {eventTypes.map((type) => (
        <TabsContent key={type} value={type.toLowerCase()}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                href={`/events/${event.id}`}
                key={event.id}
                className="group relative flex flex-col rounded-xl border bg-white hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-[#099C77] px-3 py-1 text-sm text-white">
                    {event.type}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-[#099C77]" />
                      {format(new Date(event.dateTime), "MMM d, yyyy • h:mm a")}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-[#099C77]" />
                      {`${event.location.city}, ${event.location.country}`}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg text-[#099C77]">${event.startingPrice}</span>
                    <span className="px-3 py-1 text-sm rounded-lg bg-[#099C77]/10 text-[#099C77]">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
