import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');
const visitorsFilePath = path.join(process.cwd(), 'data', 'events_visitors.json');

// Helper to extract client IP address
function getClientIp(request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();
  } catch {}
  return '127.0.0.1';
}

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

// Helper to read visitor stats
function readVisitorStats() {
  try {
    if (!fs.existsSync(visitorsFilePath)) {
      return { totalVisits: 0, uniqueIps: [], recentVisitors: [] };
    }
    const fileData = fs.readFileSync(visitorsFilePath, 'utf8');
    const parsed = JSON.parse(fileData);
    return {
      totalVisits: parsed.totalVisits || 0,
      uniqueIps: Array.isArray(parsed.uniqueIps) ? Array.from(new Set(parsed.uniqueIps)) : [],
      recentVisitors: Array.isArray(parsed.recentVisitors) ? parsed.recentVisitors : [],
    };
  } catch (e) {
    return { totalVisits: 0, uniqueIps: [], recentVisitors: [] };
  }
}

// Helper to write visitor stats
function writeVisitorStats(stats) {
  try {
    const dir = path.dirname(visitorsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(visitorsFilePath, JSON.stringify(stats, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing visitor stats:', error);
  }
}

// GET: Fetch events and track de-duplicated visitors
export async function GET(request) {
  const events = readEvents();
  const clientIp = getClientIp(request);
  const stats = readVisitorStats();

  const now = new Date();
  const nowMs = now.getTime();

  // Find the last visit from this exact IP
  const lastVisitFromIp = stats.recentVisitors.find((v) => v.ip === clientIp);
  const timeSinceLastVisit = lastVisitFromIp
    ? nowMs - new Date(lastVisitFromIp.timestamp).getTime()
    : Infinity;

  // Session Window: 15 minutes (900,000 ms) to avoid duplicate counts on quick reloads
  const isNewSession = timeSinceLastVisit > 15 * 60 * 1000;

  if (isNewSession) {
    stats.totalVisits = (stats.totalVisits || 0) + 1;

    if (!stats.uniqueIps.includes(clientIp)) {
      stats.uniqueIps.push(clientIp);
    }

    // Filter out previous entries of the same IP if within recent list, then prepend
    stats.recentVisitors = stats.recentVisitors.filter((v) => v.ip !== clientIp);
    stats.recentVisitors.unshift({
      ip: clientIp,
      timestamp: now.toISOString(),
    });

    // Keep only latest 100 unique visitor logs
    stats.recentVisitors = stats.recentVisitors.slice(0, 100);
    writeVisitorStats(stats);
  }

  return NextResponse.json({
    events,
    stats: {
      totalVisits: stats.totalVisits || 1,
      uniqueVisits: stats.uniqueIps.length || 1,
      clientIp,
    },
  });
}

// POST: Add new event, RSVP, Update, or Delete
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

    const stats = readVisitorStats();
    return NextResponse.json({
      success: true,
      events,
      stats: {
        totalVisits: stats.totalVisits || 1,
        uniqueVisits: (stats.uniqueIps || []).length || 1,
      },
    });
  } catch (error) {
    console.error('API Error in /api/events:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
