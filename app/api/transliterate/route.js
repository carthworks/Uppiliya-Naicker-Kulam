import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  try {
    // Google Input Tools API for English to Tamil
    const response = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn('Google Input Tools API returned status:', response.status);
      return NextResponse.json({ result: text }); // Fallback to original text
    }

    const data = await response.json();
    
    if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
      const transliterated = data[1][0][1][0];
      return NextResponse.json({ result: transliterated });
    }
    
    return NextResponse.json({ result: text }); // Fallback to original text
  } catch (error) {
    console.warn('Transliteration exception:', error.message);
    // Return original text gracefully on error instead of 500 to avoid breaking UX
    return NextResponse.json({ result: text });
  }
}
