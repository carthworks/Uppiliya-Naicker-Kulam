import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');

// Helper to read events
function readEvents() {
  try {
    if (!fs.existsSync(eventsFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(eventsFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading events file:', error);
    return [];
  }
}

// Helper to write events
function writeEvents(data) {
  try {
    const dir = path.dirname(eventsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(eventsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing events file:', error);
  }
}

// GET: Fetch all persistent online events
export async function GET() {
  const events = readEvents();
  return NextResponse.json(events);
}

// POST: Add new event, RSVP, or Delete
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, event, eventId } = body;
    let events = readEvents();

    if (action === 'add' && event) {
      // Prepend the newly created event so it appears at the top
      events.unshift(event);
    } else if ((action === 'edit' || action === 'update') && event) {
      // Update existing event by ID
      events = events.map((e) => (e.id === event.id ? { ...e, ...event } : e));
    } else if (action === 'rsvp' && eventId) {
      events = events.map((e) => {
        if (e.id === eventId) {
          const delta = body.increment ? 1 : -1;
          return {
            ...e,
            attendees: Math.max(0, (e.attendees || 0) + delta),
          };
        }
        return e;
      });
    } else if (action === 'delete' && eventId) {
      events = events.filter((e) => e.id !== eventId);
    }

    writeEvents(events);
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('API Error in /api/events:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
