import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const commentsFilePath = path.join(process.cwd(), 'data', 'comments.json');

// Helper to read comments
function readComments() {
  try {
    if (!fs.existsSync(commentsFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(commentsFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading comments file:', error);
    return [];
  }
}

// Helper to write comments
function writeComments(data) {
  try {
    const dir = path.dirname(commentsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(commentsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing comments file:', error);
  }
}

// GET: Fetch all persistent comments
export async function GET() {
  const comments = readComments();
  return NextResponse.json(comments);
}

// POST: Add new comment, like, or reply
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, comment, commentId, reply } = body;
    let comments = readComments();

    if (action === 'add' && comment) {
      comments.unshift(comment);
    } else if (action === 'like' && commentId) {
      comments = comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            likes: c.liked ? c.likes - 1 : c.likes + 1,
            liked: !c.liked
          };
        }
        return c;
      });
    } else if (action === 'reply' && commentId && reply) {
      comments = comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), reply]
          };
        }
        return c;
      });
    } else if (body.comments) {
      // Direct full array update fallback
      comments = body.comments;
    }

    writeComments(comments);
    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
