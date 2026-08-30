import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');
const visitorsFilePath = path.join(process.cwd(), 'data', 'events_visitors.json');
const attendeesFilePath = path.join(process.cwd(), 'data', 'events_attendees.json');
const ADMIN_PASSCODE = 'uppiliya2026';

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

// Helper to read attendees
function readAttendees() {
  try {
    if (!fs.existsSync(attendeesFilePath)) {
      return {};
    }
    const fileData = fs.readFileSync(attendeesFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (e) {
    return {};
  }
}

// Helper to write attendees
function writeAttendees(data) {
  try {
    const dir = path.dirname(attendeesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(attendeesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing attendees file:', error);
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

// GET: Fetch events and track de-duplicated visitors (or fetch attendees for an event if requested)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventIdForAttendees = searchParams.get('attendeesFor');
  const passcode = searchParams.get('passcode');

  if (eventIdForAttendees) {
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const attendeesMap = readAttendees();
    const attendeesList = attendeesMap[eventIdForAttendees] || [];
    return NextResponse.json({ success: true, attendees: attendeesList });
  }

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

// POST: Add new event, RSVP, Register Attendee, Update, or Delete
// Anti-spam and validation helpers
function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // remove HTML angle brackets
    .replace(/https?:\/\/\S+/gi, '') // remove links to prevent link spam
    .replace(/[^\u0B80-\u0BFFa-zA-Z0-9\s.,'()-]/g, '') // allow Tamil, English, numbers, basic punctuation
    .trim();
}

function validateName(name) {
  if (!name) return null;
  const clean = sanitizeText(name);
  if (clean.length < 2 || clean.length > 50) return null;
  // Must have at least some Tamil or English letters
  if (!/[\u0B80-\u0BFFa-zA-Z]/.test(clean)) return null;
  // Block common dummy spam names
  const lower = clean.toLowerCase();
  const blocked = ['test', 'asdf', 'admin', 'fake', 'anonymous', 'null', 'undefined', 'qwerty', '12345'];
  if (blocked.includes(lower)) return null;
  return clean;
}

function validateIndianPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  let clean10 = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    clean10 = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    clean10 = digits.slice(1);
  }

  if (clean10.length !== 10) return null;
  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(clean10)) return null;

  // Block sequential or all-repeating fake numbers like 0000000000, 9999999999, 1234567890
  if (/^(\d)\1{9}$/.test(clean10)) return null;
  if (['1234567890', '9876543210', '9898989898', '9988776655'].includes(clean10)) return null;

  return clean10;
}

function validatePlace(place) {
  if (!place) return '—';
  const clean = sanitizeText(place);
  if (clean.length < 2 || clean.length > 50) return '—';
  return clean;
}

// In-memory rate limiting store for attendee registrations (max 5 per 10 mins per IP)
const registrationRateLimits = new Map();

function isRateLimited(clientIp) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxAttempts = 5;

  let records = registrationRateLimits.get(clientIp) || [];
  records = records.filter((timestamp) => now - timestamp < windowMs);

  if (records.length >= maxAttempts) {
    return true;
  }
  records.push(now);
  registrationRateLimits.set(clientIp, records);
  return false;
}

// POST: Add new event, RSVP, Register Attendee, Update, Delete Event, or Delete Attendee
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, event, eventId, attendee, attendeeId, passcode } = body;
    const clientIp = getClientIp(request);
    let events = readEvents();

    if (action === 'add' && event) {
      events.unshift(event);
      writeEvents(events);
    } else if ((action === 'edit' || action === 'update') && event) {
      events = events.map((e) => (e.id === event.id ? { ...e, ...event } : e));
      writeEvents(events);
    } else if (action === 'register_attendee' && eventId && attendee) {
      // 1. Honeypot check (Bots fill hidden fields)
      if (attendee.hp_company || attendee.hp_website) {
        console.warn(`Spam bot rejected via honeypot from IP: ${clientIp}`);
        return NextResponse.json({ success: true, message: 'Registration submitted.' });
      }

      // 2. Rate limiting check
      if (isRateLimited(clientIp)) {
        return NextResponse.json(
          { success: false, error: 'அதிக முறை முயற்சிக்கப்பட்டது. சிறிது நேரம் கழித்து முயற்சிக்கவும் (Rate limit exceeded).' },
          { status: 429 }
        );
      }

      // 3. Name Validation
      const validName = validateName(attendee.name);
      if (!validName) {
        return NextResponse.json(
          { success: false, error: 'தயவுசெய்து சரியான பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்).' },
          { status: 400 }
        );
      }

      // 4. Phone Validation
      const validPhone = validateIndianPhone(attendee.phone);
      if (!validPhone) {
        return NextResponse.json(
          { success: false, error: 'தயவுசெய்து சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும் (எ.கா: 9876543210).' },
          { status: 400 }
        );
      }

      // 5. Place Validation
      const validPlace = validatePlace(attendee.place);

      const attendeesMap = readAttendees();
      let list = attendeesMap[eventId] || [];

      // 6. De-duplication check: if same phone number already registered for this event
      const existingIndex = list.findIndex((a) => {
        const aDigits = String(a.phone).replace(/\D/g, '').slice(-10);
        return aDigits === validPhone;
      });

      let newEntry;
      let isNewIncrement = false;

      if (existingIndex >= 0) {
        // Update existing record rather than double-counting
        newEntry = {
          ...list[existingIndex],
          name: validName,
          phone: validPhone,
          place: validPlace,
          updatedAt: new Date().toISOString(),
        };
        list[existingIndex] = newEntry;
      } else {
        // New unique attendee
        newEntry = {
          id: 'att-' + Date.now(),
          name: validName,
          phone: validPhone,
          place: validPlace,
          ip: clientIp,
          registeredAt: new Date().toISOString(),
        };
        list.unshift(newEntry);
        isNewIncrement = true;
      }

      attendeesMap[eventId] = list;
      writeAttendees(attendeesMap);

      // Increment count only for new unique registrations
      if (isNewIncrement) {
        events = events.map((e) => {
          if (e.id === eventId) {
            return {
              ...e,
              attendees: (e.attendees || 0) + 1,
            };
          }
          return e;
        });
        writeEvents(events);
      }

      // Automatically sync with Google Sheets (Excel/Docs) Webhook
      const googleSheetWebhookUrl =
        process.env.GOOGLE_SHEET_WEBHOOK_URL ||
        'https://script.google.com/macros/s/AKfycbxrN1Vsrastcyix10Mf4AfS6FXziova9D-moDrfIgvV-dPpJFJabgLXGUrzenay1SyG/exec';

      if (googleSheetWebhookUrl) {
        try {
          const matchedEvt = events.find((e) => e.id === eventId);
          fetch(googleSheetWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              eventTitle: matchedEvt ? matchedEvt.title : 'உப்பிலியர் களம் நேரலை நிகழ்வு',
              name: newEntry.name,
              phone: newEntry.phone,
              place: newEntry.place,
              registeredAt: newEntry.registeredAt,
              adminEmail: 'tkarthikeyan@gmail.com',
            }),
          }).catch((err) => console.warn('Google Sheet Webhook sync error:', err));
        } catch (e) {
          console.warn('Google Sheet Webhook error:', e);
        }
      }

      return NextResponse.json({
        success: true,
        attendee: newEntry,
        count: list.length,
        events,
      });
    } else if (action === 'delete_attendee' && eventId && attendeeId) {
      // Admin Spam Removal Endpoint
      if (passcode !== ADMIN_PASSCODE) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const attendeesMap = readAttendees();
      let list = attendeesMap[eventId] || [];
      const initialLength = list.length;
      list = list.filter((a) => a.id !== attendeeId);

      if (list.length < initialLength) {
        attendeesMap[eventId] = list;
        writeAttendees(attendeesMap);

        // Decrement attendee count on event
        events = events.map((e) => {
          if (e.id === eventId) {
            return {
              ...e,
              attendees: Math.max(0, (e.attendees || 1) - 1),
            };
          }
          return e;
        });
        writeEvents(events);
      }

      return NextResponse.json({ success: true, attendees: list, events });
    } else if (action === 'get_attendees' && eventId) {
      if (passcode !== ADMIN_PASSCODE) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const attendeesMap = readAttendees();
      const list = attendeesMap[eventId] || [];
      return NextResponse.json({ success: true, attendees: list });
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
      writeEvents(events);
    } else if (action === 'delete' && eventId) {
      events = events.filter((e) => e.id !== eventId);
      writeEvents(events);
    }

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
