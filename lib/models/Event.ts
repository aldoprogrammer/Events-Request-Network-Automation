// lib/models/Event.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define the event interface that extends mongoose Document
interface IEvent extends Document {
  id?: string;
  name: string;
  type: string;
  featured: boolean;
  image: string;
  headerImage: string;
  dateTime: Date;
  endDateTime: Date;
  location: {
    venue: string;
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startingPrice: number;
  organizer: {
    name: string;
    logo: string;
    description: string;
  };
  ticketTiers: Array<{
    id?: string;
    name: string;
    price: number;
    description: string;
    available: number;
  }>;
}

// Define the event schema
const eventSchema: Schema = new Schema(
  {
    id: { type: String, default: null }, // Optional with default null
    name: { type: String, required: true },
    type: { type: String, required: true },
    featured: { type: Boolean, default: false },
    image: { type: String },
    headerImage: { type: String },
    dateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    location: {
      venue: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    startingPrice: { type: Number, required: true },
    organizer: {
      name: { type: String, required: true },
      logo: { type: String },
      description: { type: String },
    },
    ticketTiers: [
      {
        id: { type: String, default: null }, // Optional with default null
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        available: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Model the schema
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
