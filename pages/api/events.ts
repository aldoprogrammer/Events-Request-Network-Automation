// pages/api/events.ts
import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/backend/mongodb";
import Event from "@/lib/models/Event";

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === "GET") {
    const { id } = req.query;

    if (id) {
      try {
        // Fetch a single event by ID
        const event = await Event.findOne({ id });
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json({ event });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch event by ID", details: error.message });
      }
    } else {
      try {
        // Fetch all events
        const events = await Event.find({});
        res.status(200).json({ events });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to fetch events", details: error.message });
      }
    }
  } else if (req.method === "POST") {
    try {
      // Create a new event
      const newEvent = new Event(req.body);
      const savedEvent = await newEvent.save();
      res.status(201).json({ message: "Event created!", event: savedEvent });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event", details: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { id } = req.body;
      // Update an event
      const updatedEvent = await Event.findOneAndUpdate({ id }, req.body, {
        new: true,
      });
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(200).json({ message: "Event updated!", event: updatedEvent });
    } catch (error) {
      res.status(500).json({ error: "Failed to update event", details: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      // Delete an event
      const deletedEvent = await Event.findOneAndDelete({ id });
      if (!deletedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(200).json({ message: "Event deleted!", event: deletedEvent });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete event", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
