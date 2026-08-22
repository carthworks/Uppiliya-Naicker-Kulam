'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────
   Zodiac Signs Data (embedded for performance)
───────────────────────────────────────────── */
const ZODIAC = [
  { id:1,  ta:'மேஷம்',      en:'Aries',       symbol:'♈', emoji:'🐏', dates:'மார்ச் 21 – ஏப்ரல் 19',         lord:'செவ்வாய்', lordEn:'Mars',    lordColor:'#ef4444', color:'#ef4444', gradient:'linear-gradient(135deg,#ef4444,#f97316)' },
  { id:2,  ta:'ரிஷபம்',     en:'Taurus',      symbol:'♉', emoji:'🐂', dates:'ஏப்ரல் 20 – மே 20',              lord:'சுக்கிரன்',lordEn:'Venus',   lordColor:'#ec4899', color:'#10b981', gradient:'linear-gradient(135deg,#10b981,#059669)' },
  { id:3,  ta:'மிதுனம்',    en:'Gemini',      symbol:'♊', emoji:'👫', dates:'மே 21 – ஜூன் 20',                lord:'புதன்',    lordEn:'Mercury', lordColor:'#22d3ee', color:'#f59e0b', gradient:'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { id:4,  ta:'கடகம்',      en:'Cancer',      symbol:'♋', emoji:'🦀', dates:'ஜூன் 21 – ஜூலை 22',             lord:'சந்திரன்', lordEn:'Moon',    lordColor:'#a78bfa', color:'#60a5fa', gradient:'linear-gradient(135deg,#60a5fa,#3b82f6)' },
  { id:5,  ta:'சிம்மம்',    en:'Leo',         symbol:'♌', emoji:'🦁', dates:'ஜூலை 23 – ஆகஸ்ட் 22',           lord:'சூரியன்',  lordEn:'Sun',     lordColor:'#f97316', color:'#f97316', gradient:'linear-gradient(135deg,#f97316,#fbbf24)' },
  { id:6,  ta:'கன்னி',      en:'Virgo',       symbol:'♍', emoji:'👧', dates:'ஆகஸ்ட் 23 – செப்டம்பர் 22',     lord:'புதன்',    lordEn:'Mercury', lordColor:'#22d3ee', color:'#22d3ee', gradient:'linear-gradient(135deg,#22d3ee,#0ea5e9)' },
  { id:7,  ta:'துலாம்',     en:'Libra',       symbol:'♎', emoji:'⚖️', dates:'செப்டம்பர் 23 – அக்டோபர் 22',  lord:'சுக்கிரன்',lordEn:'Venus',   lordColor:'#ec4899', color:'#ec4899', gradient:'linear-gradient(135deg,#ec4899,#f472b6)' },
  { id:8,  ta:'விருச்சிகம்',en:'Scorpio',     symbol:'♏', emoji:'🦂', dates:'அக்டோபர் 23 – நவம்பர் 21',      lord:'செவ்வாய்', lordEn:'Mars',    lordColor:'#ef4444', color:'#8b5cf6', gradient:'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { id:9,  ta:'தனுசு',      en:'Sagittarius', symbol:'♐', emoji:'🏹', dates:'நவம்பர் 22 – டிசம்பர் 21',       lord:'குரு',     lordEn:'Jupiter', lordColor:'#fbbf24', color:'#fbbf24', gradient:'linear-gradient(135deg,#fbbf24,#f59e0b)' },
  { id:10, ta:'மகரம்',      en:'Capricorn',   symbol:'♑', emoji:'🐐', dates:'டிசம்பர் 22 – ஜனவரி 19',        lord:'சனி',      lordEn:'Saturn',  lordColor:'#94a3b8', color:'#94a3b8', gradient:'linear-gradient(135deg,#64748b,#94a3b8)' },
  { id:11, ta:'கும்பம்',    en:'Aquarius',    symbol:'♒', emoji:'🏺', dates:'ஜனவரி 20 – பிப்ரவரி 18',        lord:'சனி',      lordEn:'Saturn',  lordColor:'#94a3b8', color:'#38bdf8', gradient:'linear-gradient(135deg,#38bdf8,#0ea5e9)' },
  { id:12, ta:'மீனம்',      en:'Pisces',      symbol:'♓', emoji:'🐟', dates:'பிப்ரவரி 19 – மார்ச் 20',        lord:'குரு',     lordEn:'Jupiter', lordColor:'#fbbf24', color:'#c084fc', gradient:'linear-gradient(135deg,#c084fc,#a78bfa)' },
];

/* ─────────────────────────────────────────────
   Deterministic prediction seeded by date+rasiId
   so it changes daily but is stable within a day
───────────────────────────────────────────── */
function seed(rasiId, date) {
  const d = date || new Date();
  return (rasiId * 31 + d.getDate() * 7 + d.getMonth() * 13 + d.getFullYear()) % 100;
}

const PREDICTIONS = {
  overview: [
    [
      'இன்று உங்களுக்கு ஆற்றல் மிகுந்த நாளாக இருக்கும். புதிய திட்டங்களை தொடங்க இது சரியான நேரம். உங்கள் முடிவெடுக்கும் திறன் மிகவும் சிறப்பாக இருக்கும். தன்னம்பிக்கையுடன் முன்னேறுங்கள்.',
      'தன்னம்பிக்கையுடன் முன்னேறுங்கள். உங்கள் முன்னிலையில் வரும் சவால்களை சுலபமாக எதிர்கொள்வீர்கள். குடும்பத்தினருடன் நல்ல உறவு நிலவும். பண விஷயங்களில் எச்சரிக்கை தேவை.',
      'உங்கள் கடுமையான உழைப்பிற்கு இன்று பலன் கிட்டும். நேர்மையாக செயல்படுங்கள். சக ஊழியர்களுடன் ஒத்துழைப்பு மிகவும் முக்கியம். புதிய வாய்ப்புகளை கை நழுவ விட வேண்டாம்.',
    ],
    [
      'மிகவும் உணர்வு நிரம்பிய மனநிலையில் இன்று இருப்பீர்கள். குடும்ப விஷயங்களில் இதயத்தோடு கவனித்துக்கொள்ளுங்கள். புதிய ஒப்பந்தங்கள் கையெழுத்திட நல்ல நாள்.',
      'தகவல் தொடர்பு கலை மேம்படும். கல்வி தொடர்பான காரியங்களில் முன்னேற்றம் தெரியும். புத்திசாலித்தனமான முடிவுகள் எடுங்கள். இரண்டு வேலைகளை ஒரே நேரத்தில் செய்வது தவிர்க்கவும்.',
      'நிலையான மனநிலையுடன் இன்று செயல்படுவீர்கள். பொருளாதாரத்தில் முன்னேற்றம் தெரியும். குடும்ப விஷயங்களில் சரியான முடிவு எடுங்கள். நம்பகமான நண்பர்களின் ஆலோசனை பயனுள்ளதாக இருக்கும்.',
    ],
    [
      'சுதந்திர மனப்பான்மையுடன் இன்று அனுபவங்களை தேடுவீர்கள். பயண வாய்ப்புகள் வரலாம். புதிய கலாச்சாரங்களை அறிய ஆர்வம் இருக்கும். தத்துவம் மற்றும் ஆன்மீகத்தில் ஆர்வம் அதிகரிக்கும்.',
      'கடின உழைப்பும் ஒழுக்கமும் இன்று உங்கள் பலம். திட்டமிட்ட வேலைகளை படிப்படியாக முடிக்கலாம். பொறுப்புகளை ஏற்றுக்கொள்ளுங்கள். சவால்கள் வரும், நிலையாக நிற்குங்கள்.',
      'கற்பனா சக்தி மற்றும் ஆன்மீக உணர்வு இன்று மிகவும் உயர்வாக இருக்கும். கலை மற்றும் படைப்புகளில் ஈடுபட நல்ல நேரம். மறைவான திறமைகள் வெளிப்படும்.',
    ],
  ],
  career: [
    [
      'தொழிலில் முன்னேற்றம் தெரியும். மேலதிகாரிகளிடம் நல்ல பெயர் கிட்டும். புதிய ஒப்பந்தங்கள் கிட்டுவதற்கான வாய்ப்பு உள்ளது. திட்டமிட்ட வேலையை திட்டமிட்ட நேரத்தில் முடிக்க முயற்சியுங்கள்.',
      'புதிய அலுவல் இடமாற்றம் அல்லது பதவி உயர்வு கிடைக்கலாம். தகுதிக்கு ஏற்ற அங்கீகாரம் கிட்டும். கூட்டாளர்களுடன் கலந்தாலோசியுங்கள்.',
      'கடினமான வேலைகளை சாமர்த்தியமாக முடிப்பீர்கள். உங்கள் பெயர் மேலும் பிரகாசிக்கும். குழுவில் தலைமை ஏற்க தயங்காதீர்கள்.',
    ],
    [
      'வங்கி மற்றும் நிதி துறையினருக்கு மிகவும் நல்ல நாள். உழைப்பு வீணாகாது. கடினமான பணிகளை முடிக்க இன்று சாதகமான நேரம்.',
      'ஆராய்ச்சி மற்றும் மனநலம் சம்பந்தமான பணிகளில் முன்னேற்றம் தெரியும். சக ஊழியர்களுக்கு உதவி செய்வது உங்கள் நற்பெயரை மேம்படுத்தும்.',
      'நிர்வாகத் திறன் இன்று சிறப்பாக வெளிப்படும். அதிகாரமான முடிவுகள் எடுக்க நல்ல நேரம். நீண்டகால திட்டங்களுக்கு அடித்தளம் போட நல்ல நேரம்.',
    ],
    [
      'கல்வி, வெளிநாடு வர்த்தகம், சட்டம் அல்லது ஆன்மீக வழிகாட்டல் துறையினருக்கு நல்ல நாள். வெளிநாடு வாய்ப்புகள் வரலாம்.',
      'படைப்பு ஆற்றல் இன்று பீரிட்டு வெளிப்படும். உங்கள் வேலை பாராட்டப்படும். புதிய தொழில்நுட்பத்தை கற்றுக்கொள்ள நல்ல நேரம்.',
      'சட்டம், ஒப்பந்தம், வர்த்தகம் அல்லது வடிவமைப்பு துறையினருக்கு நல்ல நாள். பேரம் பேசும் திறன் இன்று சிறப்பாக இருக்கும்.',
    ],
  ],
  health: [
    [
      'உடல் நலம் சிறப்பாக இருக்கும். உடற்பயிற்சியை தொடர்ந்து செய்யுங்கள். சரிவிகித உணவும் நீரும் எடுத்துக்கொள்ளுங்கள். தலைவலி மற்றும் காய்ச்சல் வராமல் கவனமாக இருங்கள்.',
      'மன அமைதி மிகவும் முக்கியம். யோகா மற்றும் தியானம் செய்யுங்கள். தூக்கம் குறைக்க வேண்டாம். இரவு நேரம் சரியான நேரத்தில் தூங்குங்கள்.',
      'சுகாதாரமான உணவு பழக்கம் வைத்துக்கொள்ளுங்கள். நடைப்பயிற்சி நல்லது. கண் பாதுகாப்பு முக்கியம். நீர் அருந்துவதை அதிகரியுங்கள்.',
    ],
    [
      'ஜீரண சம்பந்தமான பிரச்சினைகள் வரலாம். அதிக எண்ணெய் உணவை தவிர்க்கவும். சரிவிகித உணவு சாப்பிடுங்கள். யோகா மற்றும் ப்ராணாயாமம் உதவும்.',
      'கால்கள் மற்றும் இரத்த ஓட்டம் சம்பந்தமான பிரச்சினைகள் வரலாம். நடைப்பயிற்சி உதவும். சர்க்கரை மற்றும் உப்பு குறைத்து சாப்பிடுங்கள்.',
      'எலும்பு மற்றும் மூட்டு சம்பந்தமான பிரச்சினைகள் வரலாம். கால்சியம் நிறைந்த உணவு சாப்பிடுங்கள். தினமும் யோகா செய்யுங்கள்.',
    ],
    [
      'மன அமைதிக்கு தியானம் மற்றும் ஆன்மீக செயல்கள் உதவும். சரிவிகித தூக்கம் மிகவும் முக்கியம். இரவு நேரம் மனதை அமைதிப்படுத்துங்கள்.',
      'இயற்கை சூழலில் நேரம் செலவிடுங்கள். சிரிப்பும் மகிழ்ச்சியும் நல்ல மருந்து. நண்பர்களுடன் நேரம் செலவிடுங்கள்.',
      'மன அழுத்தம் தவிர்க்க இசை கேளுங்கள். அதிக உழைப்பு தவிர்க்கவும். நல்ல தூக்கம் மிகவும் முக்கியம்.',
    ],
  ],
  love: [
    [
      'காதல் வாழ்க்கை சிறப்பாக இருக்கும். துணையுடன் ஒரு சிறிய பயணம் திட்டமிடலாம். புதிய உறவுகள் ஏற்படலாம். நேர்மையாக இருங்கள்.',
      'திருமண வாழ்க்கை இனிமையாக இருக்கும். குழந்தைகளுடன் நேரம் செலவிடுங்கள். குடும்பத்தினரின் ஆசீர்வாதம் மிக முக்கியம்.',
      'காதல் வாழ்க்கையில் நல்ல முன்னேற்றம் தெரியும். திருமண கனவுகள் நனவாக வாய்ப்பு உள்ளது. சண்டை இல்லாமல் அன்புடன் பேசினால் அனைத்தும் சரியாகும்.',
    ],
    [
      'பேச்சு திறன் காதல் வாழ்க்கையை மேம்படுத்தும். மனசு விட்டு பேசுங்கள். புதிய காதல் தொடங்க நல்ல நேரம். உங்கள் நடை உடை பாவனை கவர்ச்சியாக இருக்கும்.',
      'காதல் வாழ்க்கையில் ஆழமான இணைப்பு உருவாகும். உணர்வுகளை மறைக்காதீர்கள். திருமண வாழ்க்கையில் உண்மையான அன்பு மேலோங்கும்.',
      'காதல் வாழ்க்கையில் நாட்டகரிகமான திட்டங்கள் போடுங்கள். உங்கள் பார்ட்னர் மகிழ்ச்சியடைவார்கள். சரியான நேரத்தில் அன்பை வெளிப்படுத்துங்கள்.',
    ],
    [
      'காதல் வாழ்க்கையில் கனவும் நினைவும் கலந்த உணர்வுகள் மேலோங்கும். கவிதை எழுதுங்கள். திருமண வாழ்க்கையில் ஆன்மீக இணைப்பு வலுப்படும்.',
      'கும்ப ராசியினருக்கு காதல் வாழ்க்கையில் நட்பு முக்கிய அடிப்படையாக இருக்கும். திருமண வாழ்க்கையில் ஒருவருக்கொருவர் சுதந்திரம் கொடுங்கள்.',
      'காதல் வாழ்க்கையில் அழகும் அன்பும் மிளிரும். ஒரு நல்ல சினிமா அல்லது நிகழ்ச்சிக்கு சேர்ந்து செல்லுங்கள். திருமண கனவுகள் நனவாக நல்ல நேரம்.',
    ],
  ],
};

const LUCKY_DATA = [
  { numbers:[1,9,3],   color:'சிவப்பு',    colorEn:'Red',       hex:'#ef4444', day:'செவ்வாய்', gem:'பவளம்' },
  { numbers:[6,2,8],   color:'வெள்ளை',     colorEn:'White',     hex:'#f0fdf4', day:'வெள்ளி',  gem:'வைரம்' },
  { numbers:[5,7,14],  color:'மஞ்சள்',     colorEn:'Yellow',    hex:'#fbbf24', day:'புதன்',   gem:'மரகதம்' },
  { numbers:[2,7,11],  color:'வெள்ளி',     colorEn:'Silver',    hex:'#a78bfa', day:'திங்கள்', gem:'முத்து' },
  { numbers:[1,4,10],  color:'தங்கம்',     colorEn:'Gold',      hex:'#f97316', day:'ஞாயிறு',  gem:'மாணிக்கம்' },
  { numbers:[5,6,14],  color:'பச்சை',      colorEn:'Green',     hex:'#22d3ee', day:'புதன்',   gem:'மரகதம்' },
  { numbers:[6,15,24], color:'நீலம்',      colorEn:'Blue',      hex:'#ec4899', day:'வெள்ளி',  gem:'வைரம்' },
  { numbers:[9,18,27], color:'அடர்சிவப்பு',colorEn:'Maroon',    hex:'#8b5cf6', day:'செவ்வாய்',gem:'கோமேதகம்' },
  { numbers:[3,12,21], color:'மஞ்சள்',     colorEn:'Yellow',    hex:'#fbbf24', day:'வியாழன்', gem:'புஷ்பராகம்' },
  { numbers:[8,10,26], color:'கருப்பு',    colorEn:'Black',     hex:'#94a3b8', day:'சனி',     gem:'நீலம்' },
  { numbers:[4,8,11],  color:'வானீலம்',   colorEn:'Sky Blue',  hex:'#38bdf8', day:'சனி',     gem:'நீலம்' },
  { numbers:[3,7,12],  color:'கடல் நீலம்',colorEn:'Sea Green', hex:'#c084fc', day:'வியாழன்', gem:'புஷ்பராகம்' },
];

const WEEKLY = [
  'இந்த வாரம் மேஷ ராசியினருக்கு சாதகமான வாரமாக இருக்கும். தொழிலில் முன்னேற்றம் தெரியும். செல்வம் சேர வாய்ப்பு உள்ளது. குடும்பத்தினருடன் நல்ல உறவு நிலவும். புதிய முடிவெடுக்க சரியான வாரம் இது.',
  'ரிஷப ராசியினருக்கு இந்த வாரம் பொருளாதார விஷயங்களில் கவனம் செலுத்த வேண்டும். வங்கி பரிவர்த்தனைகளில் கவனமாக இருங்கள். குடும்பத்தினருடன் ஒற்றுமையாக இருங்கள்.',
  'மிதுன ராசியினருக்கு இந்த வாரம் தொடர்பு மற்றும் கல்வி சம்பந்தமான காரியங்களில் முன்னேற்றம் தெரியும். தொழில் பயணங்கள் லாபகரமாக முடியும்.',
  'கடக ராசியினருக்கு இந்த வாரம் குடும்ப விஷயங்களில் கவனம் செலுத்த வேண்டும். பொருளாதார முடிவுகளில் எச்சரிக்கை தேவை.',
  'சிம்ம ராசியினருக்கு இந்த வாரம் தலைமை பண்புகள் மிளிரும். கலை மற்றும் பொழுதுபோக்கில் நல்ல முன்னேற்றம் தெரியும்.',
  'கன்னி ராசியினருக்கு இந்த வாரம் ஆய்வு மற்றும் திட்டமிடலில் கவனம் செலுத்துங்கள். சுகாதாரம் மேம்படுத்திக்கொள்ளுங்கள்.',
  'துலாம் ராசியினருக்கு இந்த வாரம் சமரசம் மற்றும் ஒற்றுமையில் கவனம் செலுத்துங்கள். வர்த்தகம் நல்ல பலன் தரும்.',
  'விருச்சிக ராசியினருக்கு இந்த வாரம் ஆழமான ஆராய்ச்சி மற்றும் புலனாய்வில் முன்னேற்றம் தெரியும். நிதி விஷயங்களில் கவனம் தேவை.',
  'தனுசு ராசியினருக்கு இந்த வாரம் பயணம் மற்றும் கல்வி சம்பந்தமான காரியங்கள் நல்ல பலன் தரும். குரு பகவான் அருளால் முன்னேற்றம் தெரியும்.',
  'மகர ராசியினருக்கு இந்த வாரம் கடின உழைப்பு பலன் தரும். தொழிலில் படிப்படியான முன்னேற்றம் தெரியும்.',
  'கும்ப ராசியினருக்கு இந்த வாரம் தொழில்நுட்பம் மற்றும் நட்வொர்க்கிங் நல்ல பலன் தரும்.',
  'மீன ராசியினருக்கு இந்த வாரம் கலை மற்றும் ஆன்மீகத்தில் நல்ல முன்னேற்றம் தெரியும். கனவுகளை நம்புங்கள்.',
];

const MONTHLY = [
  'மேஷ ராசியினருக்கு இந்த மாதம் நல்ல மாதமாக இருக்கும். நிதி நிலை மேம்படும். புதிய வீடு வாங்கும் சாத்தியம் உள்ளது. ஆரோக்கியத்தில் கவனம் தேவை.',
  'ரிஷப ராசியினருக்கு இந்த மாதம் நல்ல மாதமாக இருக்கும். நிதி நிலை மேம்படும். புதிய வீடு வாங்கும் சாத்தியம் உள்ளது.',
  'மிதுன ராசியினருக்கு இந்த மாதம் கல்வி மற்றும் தொழிலில் புதிய வாய்ப்புகள் தெரியும். புத்தகம் எழுதுதல் அல்லது படிப்பதில் ஆர்வம் அதிகரிக்கும்.',
  'கடக ராசியினருக்கு இந்த மாதம் குடும்பம் மற்றும் சொத்து சம்பந்தமான காரியங்கள் நல்ல திசையில் செல்லும். சந்திர பகவான் அருளால் மன அமைதி கிட்டும்.',
  'சிம்ம ராசியினருக்கு இந்த மாதம் மிகவும் சிறப்பான மாதமாக இருக்கும். சூரிய பகவான் அருளால் தொழிலில் உயர்வு கிட்டும். புகழ் மற்றும் பதவி மேம்படும்.',
  'கன்னி ராசியினருக்கு இந்த மாதம் தொழிலில் நேர்மை மற்றும் திறமை பாராட்டப்படும். ஆரோக்கியத்தில் கவனம் தேவை.',
  'துலாம் ராசியினருக்கு இந்த மாதம் கலை மற்றும் வடிவமைப்பில் நல்ல வாய்ப்புகள் தெரியும். சுக்கிர பகவான் அருளால் அழகியல் திறன் மேம்படும்.',
  'விருச்சிக ராசியினருக்கு இந்த மாதம் ரகசிய விஷயங்கள் வெளிப்படும். செவ்வாய் பகவான் அருளால் தைரியம் மேலோங்கும்.',
  'தனுசு ராசியினருக்கு இந்த மாதம் வெளிநாடு வாய்ப்புகள் வரலாம். ஆன்மீக விஷயங்களில் ஈடுபாடு அதிகரிக்கும்.',
  'மகர ராசியினருக்கு இந்த மாதம் தொழிலில் உயர்வு மற்றும் அதிகாரம் மேம்படும். சனி பகவான் அருளால் கடின உழைப்பு பலன் தரும்.',
  'கும்ப ராசியினருக்கு இந்த மாதம் சமூக சேவை மற்றும் குழு வேலையில் நல்ல பலன் கிட்டும்.',
  'மீன ராசியினருக்கு இந்த மாதம் படைப்பு சார்ந்த காரியங்களில் முன்னேற்றம் கிட்டும். குரு பகவான் அருளால் ஆன்மீக உணர்வு மேலோங்கும்.',
];

const YEARLY = [
  'இந்த ஆண்டு மேஷ ராசியினருக்கு குரு பகவான் அருளால் தொழிலில் முன்னேற்றம் ஏற்படும். திருமண வாழ்க்கை இனிமையாக இருக்கும். புதிய முதலீடுகள் லாபம் தரும். ஆரோக்கியத்தில் சிறிய சவால்கள் வரலாம், கவனமாக இருங்கள்.',
  'இந்த ஆண்டு ரிஷப ராசியினருக்கு சுக்கிர பகவான் அருளால் கலை மற்றும் படைப்புகளில் முன்னேற்றம் கிட்டும். குடும்ப வாழ்க்கை இனிமையாக இருக்கும்.',
  'இந்த ஆண்டு மிதுன ராசியினருக்கு கல்வி, ஆராய்ச்சி மற்றும் தொழில்நுட்பத்தில் மிகவும் நல்ல ஆண்டாக இருக்கும். புத்தன் அருளால் அறிவு வளரும்.',
  'இந்த ஆண்டு கடக ராசியினருக்கு குடும்ப விஷயங்களில் மிகவும் சாதகமான ஆண்டாக இருக்கும். வீடு கட்டுதல் அல்லது வாங்குதல் நிறைவேறும்.',
  'இந்த ஆண்டு சிம்ம ராசியினருக்கு புகழ் மற்றும் சமூக அந்தஸ்து உயரும். அரசு கௌரவம் அல்லது விருது கிட்டலாம்.',
  'இந்த ஆண்டு கன்னி ராசியினருக்கு கல்வி மற்றும் ஆராய்ச்சியில் மிகவும் நல்ல ஆண்டாக இருக்கும். புத்தன் அருளால் அறிவு மேலோங்கும்.',
  'இந்த ஆண்டு துலாம் ராசியினருக்கு உறவுகளில் மிகவும் நல்ல ஆண்டாக இருக்கும். திருமண வாய்ப்பு கிட்டலாம். வர்த்தகத்தில் லாபம் அதிகரிக்கும்.',
  'இந்த ஆண்டு விருச்சிக ராசியினருக்கு மாற்றங்கள் நிறைந்த ஆண்டாக இருக்கும். மாற்றங்களை ஏற்றுக்கொண்டால் மிகவும் முன்னேறலாம்.',
  'இந்த ஆண்டு தனுசு ராசியினருக்கு கல்வி மற்றும் பயண சம்பந்தமான காரியங்களில் மிகவும் நல்ல ஆண்டாக இருக்கும்.',
  'இந்த ஆண்டு மகர ராசியினருக்கு தொழிலில் மிகவும் நல்ல ஆண்டாக இருக்கும். பதவி உயர்வு மற்றும் செல்வம் சேரும்.',
  'இந்த ஆண்டு கும்ப ராசியினருக்கு புரட்சிகர மாற்றங்கள் வாழ்க்கையில் நுழையும். நண்பர்களுடன் சேர்ந்து முன்னேற்றம் காணலாம்.',
  'இந்த ஆண்டு மீன ராசியினருக்கு கலை, ஆன்மீகம் மற்றும் படைப்பு சார்ந்த ஆண்டாக இருக்கும். கனவுகளை நனவாக்க முயற்சியுங்கள்.',
];

const DAY_NAMES = ['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'];
const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TAMIL_MONTHS = ['தை','மாசி','பங்குனி','சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி','ஐப்பசி','கார்த்திகை','மார்கழி'];

/* ── Panchang helpers ── */
function getTithi(date) {
  const tithis = ['பிரதமை','துவிதீயை','திரிதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','பெளர்ணமி','பிரதமை','துவிதீயை','திரிதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','அமாவாசை'];
  return tithis[(date.getDate() + date.getMonth() * 3) % 30];
}
function getNakshatra(date) {
  const stars = ['அஸ்வினி','பரணி','கார்த்திகை','ரோகிணி','மிருகசிரீடம்','திருவாதிரை','புனர்பூசம்','பூசம்','ஆயில்யம்','மகம்','பூரம்','உத்திரம்','அஸ்தம்','சித்திரை','சுவாதி','விசாகம்','அனுராதா','கேட்டை','மூலம்','பூராடம்','உத்திராடம்','திருவோணம்','அவிட்டம்','சதயம்','பூரட்டாதி','உத்திரட்டாதி','ரேவதி'];
  return stars[(date.getDate() + date.getMonth() * 2 + date.getDay()) % 27];
}
function getYogam(date) {
  const yogams = ['விஷ்கம்பம்','பிரீதி','ஆயுஷ்மான்','சௌபாக்கியம்','சோபனம்','அதிகண்டம்','சுகர்மன்','திருதி','சூலம்','கண்டம்','விருத்தி','த்ரவம்','வ்யாகாதம்','ஹர்ஷணம்','வஜ்ரம்','சித்தி','வ்யதீபாதம்','வரீயம்','பரிகம்','சிவம்','சித்தம்','சாத்தியம்','சுபம்','சுக்லம்','ப்ரம்ம','இந்திரம்','வைத்ருதி'];
  return yogams[(date.getDate() + date.getMonth() * 5) % 27];
}
function getKaranam(date) {
  const k = ['பவ','பாலவ','கெளலவ','தைதில','கரஜ','வணிஜம்','விஷ்டி'];
  return k[date.getDate() % 7];
}
function getSunrise(date, lat = 13.08) {
  const base = 6 * 60 + 18;
  const delta = Math.round((lat - 13) * 2);
  const total = base - delta;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} AM`;
}
function getSunset(date, lat = 13.08) {
  const base = 18 * 60 + 30;
  const delta = Math.round((lat - 13) * 3);
  const total = base + delta;
  const h = Math.floor((total / 60) % 24);
  const m = total % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}
function getYearName(year) {
  const names = ['பிரபவ','விபவ','சுக்ல','பிரமோதூத','பிரஜோத்பத்தி','ஆங்கீரஸ','ஸ்ரீமுக','பவ','யுவ','தாது','ஈஸ்வர','வேதுக','ஹேவிளம்பி','விளம்பி','விகாரி','சார்வரி','பிலவ','சுபகிருது','சோபகிருது','குரோதி','விஸ்வாவசு','பராபவ','ப்லவங்க','கீலக','சௌம்ய','சாதாரண','விரோதிகிருது','பரிதாபி','பிரமாதீச','ஆனந்த','ராட்சஸ','நல','பிங்கல','காளயுக்தி','சித்தார்த்தி','ரௌத்திர','துன்மதி','துந்துபி','ருத்ரோத்காரி','ரக்தாட்சி','குரோதன','அட்சய','ப்ரபவ','விபவ','சுக்ல','பிரமோதூத','பிரஜோத்பத்தி','ஆங்கீரஸ','சோபகிருது','குரோதி','விஸ்வாவசு','திரிலோசன','திலோத்தம','வஸந்த','விரோதி','பரிதாபி','ப்ரமாதி','ஆனந்த','ராட்சஸ','நல'];
  return names[(year - 1987) % 60] + ', தக்ஷிணாயனம்';
}

/* ── getPred: deterministic per rasi+date ── */
function getPred(rasiId, date, type) {
  const s = seed(rasiId, date);
  const list = PREDICTIONS[type];
  const outerIdx = s % list.length;
  const innerIdx = Math.floor(s / list.length) % list[outerIdx].length;
  return list[outerIdx][innerIdx];
}

const CATEGORY_TABS = [
  { id:'overview', ta:'கண்ணோட்டம்', icon:'⭐' },
  { id:'career',   ta:'தொழில்',     icon:'💼' },
  { id:'health',   ta:'ஆரோக்கியம்', icon:'❤️' },
  { id:'love',     ta:'காதல்',      icon:'💕' },
];

const VIEW_TABS = [
  { id:'today',   ta:'இன்று',   en:'Today'   },
  { id:'weekly',  ta:'வாரம்',   en:'Weekly'  },
  { id:'monthly', ta:'மாதம்',   en:'Monthly' },
  { id:'yearly',  ta:'ஆண்டு',   en:'Yearly'  },
];

/* ── Rating stars ── */
function StarRating({ value, max = 5 }) {
  return (
    <span style={{ color: '#fbbf24', fontSize: '.95rem', letterSpacing: '.1em' }}>
      {'★'.repeat(value)}{'☆'.repeat(max - value)}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Zodiac Selector Modal
───────────────────────────────────────────── */
function ZodiacModal({ onSelect, selected, onClose }) {
  return (
    <div className="jz-overlay" onClick={onClose}>
      <div className="jz-modal" onClick={e => e.stopPropagation()}>
        <div className="jz-modal-header">
          <div>
            <div className="jz-modal-title">உங்கள் ராசியை தேர்வு செய்யுங்கள்</div>
            <div className="jz-modal-sub">You can select your zodiac sign based on birth dates.</div>
          </div>
          <button className="jz-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="jz-grid">
          {ZODIAC.map(z => (
            <button
              key={z.id}
              className={`jz-item ${selected?.id === z.id ? 'jz-item-active' : ''}`}
              style={selected?.id === z.id ? { borderColor: z.color, background: `${z.color}18` } : {}}
              onClick={() => { onSelect(z); onClose(); }}
            >
              <span className="jz-item-symbol" style={{ color: z.color }}>{z.symbol}</span>
              <div className="jz-item-info">
                <div className="jz-item-name">{z.ta}</div>
                <div className="jz-item-dates">{z.dates}</div>
              </div>
              {selected?.id === z.id && (
                <span className="jz-check" style={{ background: z.color }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function JothidamPage() {
  const [now, setNow]               = useState(null);
  const [selected, setSelected]     = useState(ZODIAC[2]); // Gemini default
  const [showModal, setShowModal]   = useState(false);
  const [viewTab, setViewTab]       = useState('today');
  const [catTab, setCatTab]         = useState('overview');

  useEffect(() => {
    setNow(new Date());
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('uppiliya_jothidam_rasi');
        if (saved) {
          const z = ZODIAC.find(x => x.id === JSON.parse(saved));
          if (z) setSelected(z);
        }
      } catch {}
    }
  }, []);

  const handleSelect = useCallback(z => {
    setSelected(z);
    try { localStorage.setItem('uppiliya_jothidam_rasi', JSON.stringify(z.id)); } catch {}
  }, []);

  if (!now) return null;

  const dayIdx    = now.getDay();
  const lucky     = LUCKY_DATA[selected.id - 1];
  const pred      = getPred(selected.id, now, catTab);
  const tithi     = getTithi(now);
  const nakshatra = getNakshatra(now);
  const yogam     = getYogam(now);
  const karanam   = getKaranam(now);
  const sunrise   = getSunrise(now);
  const sunset    = getSunset(now);
  const yearName  = getYearName(now.getFullYear());
  const taMonth   = TAMIL_MONTHS[(now.getMonth() + 9) % 12];
  const dateStr   = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${DAY_NAMES_EN[dayIdx]}`;

  // Rating: deterministic, shifts daily
  const ratings = {
    overview: 3 + ((selected.id + now.getDate()) % 3),
    career:   2 + ((selected.id + now.getDate() + 1) % 4),
    health:   2 + ((selected.id * 2 + now.getDate()) % 4),
    love:     3 + ((selected.id + now.getDate() * 3) % 3),
  };

  const viewPredText = (() => {
    if (viewTab === 'weekly')  return WEEKLY[selected.id - 1];
    if (viewTab === 'monthly') return MONTHLY[selected.id - 1];
    if (viewTab === 'yearly')  return YEARLY[selected.id - 1];
    return pred;
  })();

  return (
    <>
      <style suppressHydrationWarning>{`
        .jt-page {
          min-height: 100vh;
          font-family: 'Noto Sans Tamil','Outfit','Segoe UI',sans-serif;
          background: radial-gradient(circle at 20% 10%, rgba(120,40,200,0.25) 0%, transparent 55%),
                      radial-gradient(circle at 80% 90%, rgba(249,115,22,0.18) 0%, transparent 50%),
                      #0c0f1a;
          padding-bottom: 5rem;
        }

        /* ── Hero Banner ── */
        .jt-hero {
          text-align: center;
          padding: 3rem 1rem 2rem;
          position: relative;
        }
        .jt-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(167,139,250,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .jt-hero-badge {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .35rem 1.1rem; border-radius: 999px; margin-bottom: 1.25rem;
          background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.3);
          color: #c084fc; font-size: .82rem; font-weight: 600; letter-spacing: .08em;
        }
        .jt-hero-h1 {
          font-size: clamp(2rem,5vw,3rem); font-weight: 900; margin: 0 0 .5rem;
          background: linear-gradient(135deg,#fbbf24 0%,#ec4899 50%,#a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1.15;
        }
        .jt-hero-sub {
          color: #94a3b8; font-size: .95rem; margin: 0;
        }

        /* ── Container ── */
        .jt-container { max-width: 820px; margin: 0 auto; padding: 0 1rem; }

        /* ── Selected rasi banner ── */
        .jt-rasi-banner {
          border-radius: 1.25rem; padding: 1.5rem; margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
          border: 1.5px solid; position: relative; overflow: hidden;
          backdrop-filter: blur(12px);
          transition: border-color .3s;
        }
        .jt-rasi-glow {
          position: absolute; top: -50px; right: -50px;
          width: 200px; height: 200px; border-radius: 50%;
          opacity: .4; filter: blur(50px); pointer-events: none;
        }
        .jt-rasi-symbol-wrap {
          width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; border: 2px solid; position: relative; z-index: 1;
        }
        .jt-rasi-info { flex: 1; min-width: 160px; position: relative; z-index: 1; }
        .jt-rasi-date-str { font-size: .8rem; color: #94a3b8; margin-bottom: .2rem; }
        .jt-rasi-name { font-size: 1.75rem; font-weight: 800; line-height: 1.1; }
        .jt-rasi-name-en { font-size: .95rem; color: #cbd5e1; margin-top: .15rem; }
        .jt-rasi-dates { font-size: .82rem; color: #94a3b8; margin-top: .35rem; }
        .jt-change-btn {
          display: inline-flex; align-items: center; gap: .45rem;
          padding: .55rem 1.1rem; border-radius: .75rem;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: #e2e8f0; font-size: .85rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all .15s; position: relative; z-index: 1; white-space: nowrap;
        }
        .jt-change-btn:hover { background: rgba(255,255,255,0.18); transform: translateY(-1px); }

        /* ── View Tabs ── */
        .jt-view-tabs {
          display: flex; gap: .35rem; margin-bottom: 1.5rem;
          background: rgba(0,0,0,0.35); border-radius: .85rem; padding: .3rem;
          border: 1px solid rgba(255,255,255,0.08);
          overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .jt-view-tabs::-webkit-scrollbar { display: none; }
        .jt-view-tab {
          flex: 1; min-width: 65px; padding: .55rem .5rem; border-radius: .6rem; border: none;
          background: none; color: #64748b; font-size: .88rem; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all .2s; white-space: nowrap;
          text-align: center;
        }
        .jt-view-tab-active { background: rgba(255,255,255,0.1); color: #f8fafc; }

        /* ── Lucky Card Row ── */
        .jt-lucky-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: 1.5rem;
        }
        @media(min-width:600px) { .jt-lucky-row { grid-template-columns: repeat(4, 1fr); gap: 1rem; } }
        .jt-lucky-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem; padding: .85rem; text-align: center;
        }
        .jt-lucky-icon { font-size: 1.4rem; margin-bottom: .3rem; }
        .jt-lucky-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .09em; color: #64748b; margin-bottom: .25rem; }
        .jt-lucky-value { font-size: 1.05rem; font-weight: 800; color: #f8fafc; }
        .jt-lucky-sub { font-size: .75rem; color: #94a3b8; margin-top: .1rem; }

        /* ── Category tabs ── */
        .jt-cat-tabs {
          display: flex; gap: 0; margin-bottom: 1.25rem;
          border-bottom: 2px solid rgba(255,255,255,0.08);
          overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .jt-cat-tabs::-webkit-scrollbar { display: none; }
        .jt-cat-tab {
          padding: .65rem 1rem; border: none; background: none;
          color: #64748b; font-size: .88rem; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: color .2s; position: relative; display: flex; align-items: center; gap: .35rem;
          white-space: nowrap; flex-shrink: 0;
        }
        .jt-cat-tab::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px;
          background: transparent; transition: background .2s;
        }
        .jt-cat-tab-active { color: #f8fafc; }
        .jt-cat-tab-active::after { background: var(--active-color, #fbbf24); }

        /* ── Prediction Card ── */
        .jt-pred-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem; padding: 1.75rem; margin-bottom: 1.5rem;
          min-height: 160px;
        }
        @media(max-width: 600px) {
          .jt-page { padding: 1.5rem 0 3.5rem; }
          .jt-container { padding: 0 0.85rem; }
          .jt-hero { margin-bottom: 2rem; }
          .jt-pred-card, .jt-panchang-card, .jt-ratings-card { padding: 1.25rem 1rem; border-radius: 1rem; }
          .jt-rasi-banner { padding: 1.15rem 1rem; gap: 0.85rem; border-radius: 1rem; }
          .jt-rasi-symbol-wrap { width: 56px; height: 56px; font-size: 2rem; }
          .jt-rasi-name { font-size: 1.4rem; }
          .jt-pred-text { font-size: 0.98rem; line-height: 1.7; }
        }
        .jt-pred-rating { display: flex; align-items: center; gap: .85rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
        .jt-pred-rating-label { font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
        .jt-pred-text {
          font-size: 1.05rem; line-height: 1.8; color: #e2e8f0;
          font-family: 'Noto Sans Tamil','Outfit',sans-serif;
        }
        .jt-pred-footer {
          margin-top: 1.25rem; padding-top: 1.1rem; border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; gap: .65rem; flex-wrap: wrap;
        }
        .jt-pred-lord-badge {
          display: inline-flex; align-items: center; gap: .35rem;
          padding: .3rem .85rem; border-radius: 999px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
          color: #cbd5e1; font-size: .82rem; font-weight: 600;
        }

        /* ── Panchang ── */
        .jt-panchang-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem; padding: 1.75rem; margin-bottom: 1.5rem;
        }
        .jt-pk-title {
          font-size: 1.2rem; font-weight: 800; color: #fbbf24; margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .jt-pk-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: .65rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 1rem; flex-wrap: wrap;
        }
        .jt-pk-row:last-child { border-bottom: none; padding-bottom: 0; }
        .jt-pk-key {
          display: flex; align-items: center; gap: .5rem;
          font-size: .88rem; color: #94a3b8; min-width: 160px;
        }
        .jt-pk-val { font-size: .95rem; font-weight: 700; color: #f1f5f9; text-align: right; flex: 1; }
        .jt-sunrise-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
          margin-bottom: 1.1rem; padding-bottom: 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .jt-sun-card {
          background: rgba(255,255,255,0.04); border-radius: .85rem; padding: .85rem 1rem;
          text-align: center;
        }
        .jt-sun-icon { font-size: 1.5rem; margin-bottom: .3rem; }
        .jt-sun-label { font-size: .75rem; color: #94a3b8; margin-bottom: .2rem; }
        .jt-sun-time { font-size: 1.3rem; font-weight: 800; }

        /* ── Rating bars ── */
        .jt-ratings-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem; padding: 1.75rem; margin-bottom: 1.5rem;
        }
        .jt-ratings-title { font-size: 1.1rem; font-weight: 800; color: #e2e8f0; margin-bottom: 1.25rem; }
        .jt-rating-item { margin-bottom: 1rem; }
        .jt-rating-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .4rem; }
        .jt-rating-name { font-size: .88rem; color: #cbd5e1; display: flex; align-items: center; gap: .35rem; }
        .jt-rating-pct { font-size: .82rem; color: #94a3b8; }
        .jt-rating-track { width: 100%; height: 7px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .jt-rating-fill { height: 100%; border-radius: 999px; transition: width .6s ease; }

        /* ── Horai link ── */
        .jt-horai-link {
          display: flex; align-items: center; gap: 1rem;
          background: linear-gradient(135deg, rgba(167,139,250,0.12), rgba(236,72,153,0.1));
          border: 1px solid rgba(167,139,250,0.3); border-radius: 1.1rem;
          padding: 1.1rem 1.5rem; margin-bottom: 1.5rem;
          text-decoration: none; transition: all .2s;
        }
        .jt-horai-link:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(167,139,250,0.2); }
        .jt-horai-icon { font-size: 2.2rem; flex-shrink: 0; }
        .jt-horai-text-title { font-size: 1rem; font-weight: 700; color: #e2e8f0; }
        .jt-horai-text-sub { font-size: .82rem; color: #94a3b8; margin-top: .15rem; }
        .jt-horai-arrow { margin-left: auto; color: #a78bfa; font-size: 1.3rem; }

        /* ── Share btn ── */
        .jt-share-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .65rem 1.4rem; background: linear-gradient(135deg,#22c55e,#16a34a);
          color: #fff; border: none; border-radius: .85rem; font-size: .9rem;
          font-weight: 700; cursor: pointer; font-family: inherit;
          box-shadow: 0 2px 12px rgba(34,197,94,0.35); transition: transform .15s;
        }
        .jt-share-btn:hover { transform: translateY(-1px); }

        /* ── Zodiac Modal ── */
        .jz-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
          display: flex; align-items: flex-end; justify-content: center;
          animation: jzFadeIn .2s ease;
          padding: 0 0 0;
        }
        @keyframes jzFadeIn { from { opacity:0 } to { opacity:1 } }
        .jz-modal {
          background: #131929; border: 1px solid rgba(255,255,255,0.15);
          border-radius: 1.75rem 1.75rem 0 0; width: 100%; max-width: 560px;
          max-height: 88vh; overflow-y: auto; padding: 1.5rem;
          animation: jzSlideUp .3s ease;
        }
        @keyframes jzSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        .jz-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .jz-modal-title { font-size: 1.3rem; font-weight: 800; color: #f8fafc; margin-bottom: .3rem; }
        .jz-modal-sub { font-size: .85rem; color: #94a3b8; max-width: 300px; line-height: 1.5; }
        .jz-close-btn {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          color: #94a3b8; width: 36px; height: 36px; border-radius: 50%;
          cursor: pointer; font-size: 1.1rem; flex-shrink: 0; font-family: inherit;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .jz-close-btn:hover { background: rgba(255,255,255,0.2); color: #f8fafc; }
        .jz-grid { display: flex; flex-direction: column; gap: .5rem; }
        .jz-item {
          display: flex; align-items: center; gap: .85rem;
          padding: .85rem 1rem; border-radius: .85rem;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; font-family: inherit; text-align: left; width: 100%;
          transition: all .15s; position: relative;
        }
        .jz-item:hover { background: rgba(255,255,255,0.07); }
        .jz-item-active { background: rgba(255,255,255,0.07) !important; }
        .jz-item-symbol { font-size: 1.75rem; line-height: 1; min-width: 32px; text-align: center; }
        .jz-item-info { flex: 1; }
        .jz-item-name { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
        .jz-item-dates { font-size: .78rem; color: #94a3b8; margin-top: .1rem; }
        .jz-check {
          width: 22px; height: 22px; border-radius: 50%; color: #fff;
          font-size: .82rem; display: flex; align-items: center; justify-content: center;
          font-weight: 700; flex-shrink: 0;
        }
      `}</style>

      <div className="jt-page">
        {/* Hero */}
        <div className="jt-hero">
          <div className="jt-hero-badge">🌙 ஜோதிட சாஸ்திரம் · Tamil Astrology</div>
          <h1 className="jt-hero-h1">இன்றைய ராசிபலன்</h1>
          <p className="jt-hero-sub">Daily Horoscope · {DAY_NAMES[dayIdx]} · {now.getDate()}/{now.getMonth()+1}/{now.getFullYear()}</p>
        </div>

        <div className="jt-container">

          {/* ── Selected Rasi Banner ── */}
          <div
            className="jt-rasi-banner"
            style={{ borderColor: `${selected.color}55`, background: `${selected.color}0d` }}
          >
            <div className="jt-rasi-glow" style={{ background: selected.color }} />
            <div
              className="jt-rasi-symbol-wrap"
              style={{ background: `${selected.color}18`, borderColor: `${selected.color}66` }}
            >
              {selected.symbol}
            </div>
            <div className="jt-rasi-info">
              <div className="jt-rasi-date-str">{dateStr}</div>
              <div className="jt-rasi-name" style={{ color: selected.color }}>{selected.ta}</div>
              <div className="jt-rasi-name-en">{selected.en} Rasi</div>
              <div className="jt-rasi-dates">{selected.dates}</div>
            </div>
            <button className="jt-change-btn" onClick={() => setShowModal(true)}>
              ✏️ ராசி மாற்றவும்
            </button>
          </div>

          {/* ── View Tabs: Today / Weekly / Monthly / Yearly ── */}
          <div className="jt-view-tabs">
            {VIEW_TABS.map(t => (
              <button
                key={t.id}
                className={`jt-view-tab ${viewTab === t.id ? 'jt-view-tab-active' : ''}`}
                onClick={() => setViewTab(t.id)}
              >
                {t.ta}
              </button>
            ))}
          </div>

          {/* ── Lucky Cards ── */}
          {viewTab === 'today' && (
            <div className="jt-lucky-row">
              <div className="jt-lucky-card">
                <div className="jt-lucky-icon">🔢</div>
                <div className="jt-lucky-label">அதிர்ஷ்ட எண்</div>
                <div className="jt-lucky-value">{lucky.numbers.join(', ')}</div>
                <div className="jt-lucky-sub">Lucky Numbers</div>
              </div>
              <div className="jt-lucky-card">
                <div className="jt-lucky-icon">🎨</div>
                <div className="jt-lucky-label">அதிர்ஷ்ட நிறம்</div>
                <div className="jt-lucky-value" style={{ color: lucky.hex }}>{lucky.color}</div>
                <div className="jt-lucky-sub">{lucky.colorEn}</div>
              </div>
              <div className="jt-lucky-card">
                <div className="jt-lucky-icon">📅</div>
                <div className="jt-lucky-label">நல்ல நாள்</div>
                <div className="jt-lucky-value">{lucky.day}</div>
                <div className="jt-lucky-sub">{lucky.colorEn === 'Red' ? 'Tuesday' : lucky.colorEn === 'White' ? 'Friday' : 'Good Day'}</div>
              </div>
              <div className="jt-lucky-card">
                <div className="jt-lucky-icon">💎</div>
                <div className="jt-lucky-label">கல்</div>
                <div className="jt-lucky-value" style={{ fontSize: '.95rem' }}>{lucky.gem}</div>
                <div className="jt-lucky-sub">Lucky Gem</div>
              </div>
            </div>
          )}

          {/* ── Prediction Card ── */}
          <div className="jt-pred-card">
            {/* Category tabs — only in today view */}
            {viewTab === 'today' && (
              <div className="jt-cat-tabs" style={{ '--active-color': selected.color }}>
                {CATEGORY_TABS.map(c => (
                  <button
                    key={c.id}
                    className={`jt-cat-tab ${catTab === c.id ? 'jt-cat-tab-active' : ''}`}
                    onClick={() => setCatTab(c.id)}
                  >
                    {c.icon} {c.ta}
                  </button>
                ))}
              </div>
            )}

            {viewTab === 'today' && (
              <div className="jt-pred-rating">
                <span className="jt-pred-rating-label">பலன்</span>
                <StarRating value={ratings[catTab]} />
                <span style={{ fontSize: '.8rem', color: '#64748b' }}>({ratings[catTab]}/5)</span>
              </div>
            )}

            <p className="jt-pred-text">{viewPredText}</p>

            {viewTab === 'today' && (
              <div className="jt-pred-footer">
                <span className="jt-pred-lord-badge" style={{ color: selected.lordColor, borderColor: `${selected.lordColor}44` }}>
                  🪐 ஆதிக்க கிரகம்: {selected.lord} ({selected.lordEn})
                </span>
                <span className="jt-pred-lord-badge">
                  ⚡ தனிமம்: {selected.ta.includes('மேஷ') || selected.ta.includes('சிம்ம') || selected.ta.includes('தனுசு') ? 'நெருப்பு' :
                    selected.ta.includes('ரிஷப') || selected.ta.includes('கன்னி') || selected.ta.includes('மகர') ? 'மண்' :
                    selected.ta.includes('மிதுன') || selected.ta.includes('துலாம்') || selected.ta.includes('கும்ப') ? 'காற்று' : 'நீர்'}
                </span>
              </div>
            )}
          </div>

          {/* ── Rating Bars (Today only) ── */}
          {viewTab === 'today' && (
            <div className="jt-ratings-card">
              <div className="jt-ratings-title">📊 இன்றைய கிரக பலன் அளவீடு</div>
              {[
                { label: '⭐ கண்ணோட்டம்', key: 'overview' },
                { label: '💼 தொழில்',     key: 'career'   },
                { label: '❤️ ஆரோக்கியம்', key: 'health'   },
                { label: '💕 காதல்',      key: 'love'     },
              ].map(r => {
                const pct = (ratings[r.key] / 5) * 100;
                const fillColors = { overview: '#fbbf24', career: '#22d3ee', health: '#10b981', love: '#ec4899' };
                return (
                  <div className="jt-rating-item" key={r.key}>
                    <div className="jt-rating-head">
                      <span className="jt-rating-name">{r.label}</span>
                      <span className="jt-rating-pct">{Math.round(pct)}%</span>
                    </div>
                    <div className="jt-rating-track">
                      <div className="jt-rating-fill" style={{ width: `${pct}%`, background: fillColors[r.key] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Panchang ── */}
          <div className="jt-panchang-card">
            <div className="jt-pk-title">📿 இன்றைய பஞ்சாங்கம்</div>

            {/* Sunrise / Sunset */}
            <div className="jt-sunrise-row">
              <div className="jt-sun-card">
                <div className="jt-sun-icon">🌅</div>
                <div className="jt-sun-label">சூரிய உதயம்</div>
                <div className="jt-sun-time" style={{ color: '#fbbf24' }}>{sunrise}</div>
              </div>
              <div className="jt-sun-card">
                <div className="jt-sun-icon">🌇</div>
                <div className="jt-sun-label">சூரிய அஸ்தமனம்</div>
                <div className="jt-sun-time" style={{ color: '#f97316' }}>{sunset}</div>
              </div>
            </div>

            <div className="jt-pk-row">
              <span className="jt-pk-key">📅 ஆண்டு பெயர்</span>
              <span className="jt-pk-val">{yearName}</span>
            </div>
            <div className="jt-pk-row">
              <span className="jt-pk-key">🌙 திதி</span>
              <span className="jt-pk-val">{tithi}</span>
            </div>
            <div className="jt-pk-row">
              <span className="jt-pk-key">⭐ நட்சத்திரம் (நட்சத்திரம்)</span>
              <span className="jt-pk-val">{nakshatra}</span>
            </div>
            <div className="jt-pk-row">
              <span className="jt-pk-key">🧿 யோகம்</span>
              <span className="jt-pk-val">{yogam}</span>
            </div>
            <div className="jt-pk-row">
              <span className="jt-pk-key">🏮 கரணம்</span>
              <span className="jt-pk-val">{karanam}</span>
            </div>
            <div className="jt-pk-row">
              <span className="jt-pk-key">🌺 தமிழ் மாதம்</span>
              <span className="jt-pk-val">{taMonth}</span>
            </div>
          </div>

          {/* ── Horai Link ── */}
          <Link href="/horai" className="jt-horai-link">
            <div className="jt-horai-icon">🪐</div>
            <div>
              <div className="jt-horai-text-title">இன்றைய கிரக ஓரை கணிப்பு</div>
              <div className="jt-horai-text-sub">ராகு காலம், எமகண்டம் & சுப நேரங்கள் அறிய</div>
            </div>
            <div className="jt-horai-arrow">→</div>
          </Link>

          {/* ── Share button ── */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              className="jt-share-btn"
              onClick={() => {
                const text = `🌙 *இன்றைய ராசிபலன் — ${selected.ta} (${selected.en})*\n📅 ${dateStr}\n\n${viewPredText}\n\n🔢 அதிர்ஷ்ட எண்: ${lucky.numbers.join(', ')} | 🎨 நிறம்: ${lucky.color} | 💎 கல்: ${lucky.gem}\n\n🌅 உதயம்: ${sunrise} | 🌇 அஸ்தமனம்: ${sunset}\n🌙 திதி: ${tithi} | ⭐ நட்சத்திரம்: ${nakshatra}\n\n---\n🏛️ உப்பிலிய நாயக்கர் குல அடையாள தளம்\n🌐 https://uppiliya-naicker-kulam.vercel.app/jothidam`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              📤 WhatsApp-ல் பகிர்
            </button>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ZodiacModal
          selected={selected}
          onSelect={handleSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
