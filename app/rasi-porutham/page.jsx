'use client';

import { useState, useMemo } from 'react';
import rasiData from '../../data/rasi-porutham.json';

/* ─────────────────────────────────────────────
   Authentic 12 Porutham Calculation Engine
───────────────────────────────────────────── */
function calculate12Porutham(boyStarId, boyPada, girlStarId, girlPada, boySevvai, girlSevvai, boyRahu, girlRahu) {
  const boyStar = rasiData.nakshatras.find(n => n.id === boyStarId);
  const girlStar = rasiData.nakshatras.find(n => n.id === girlStarId);

  if (!boyStar || !girlStar) return null;

  // Auto-resolve exact Rasi based on Pada (1..4)
  const boyRasiId = boyStar.padas[String(boyPada)] || 1;
  const girlRasiId = girlStar.padas[String(girlPada)] || 1;

  const bRasi = rasiData.rasiList.find(r => r.id === boyRasiId);
  const gRasi = rasiData.rasiList.find(r => r.id === girlRasiId);

  if (!bRasi || !gRasi) return null;

  // Star distance from Girl to Boy (1-indexed circular, 1..27)
  const starDistance = ((boyStar.id - girlStar.id + 27) % 27) + 1;
  // Rasi distance from Girl Rasi to Boy Rasi (1-indexed circular, 1..12)
  const rasiDistance = ((bRasi.id - gRasi.id + 12) % 12) + 1;

  // ── 1. Dhinam (தினம்) ──
  const dhinamRem = starDistance % 9;
  let dhinamScore = 0;
  let dhinamNote = '';
  if ([2, 4, 6, 8, 0].includes(dhinamRem) || starDistance === 27) {
    dhinamScore = 1;
    dhinamNote = 'உத்தமம் (நல்ல ஆரோக்கியம் மற்றும் நீண்ட ஆயுள்)';
  } else if (starDistance === 1) {
    // Same star exception check
    const sameStarAllowed = [1, 4, 6, 8, 10, 13, 17, 20, 22, 24, 26, 27].includes(boyStar.id);
    if (sameStarAllowed && boyPada !== girlPada) {
      dhinamScore = 1;
      dhinamNote = 'ஏக நட்சத்திர உத்தமம் (பாத பேதத்துடன் பொருந்தும்)';
    } else {
      dhinamScore = 0.5;
      dhinamNote = 'மத்திமம் (ஒரே நட்சத்திரம்)';
    }
  } else {
    dhinamScore = 0;
    dhinamNote = 'பொருத்தமில்லை (தின தோஷம்)';
  }

  // ── 2. Ganam (கணம்) ──
  let ganamScore = 0;
  let ganamNote = '';
  if (girlStar.ganam === boyStar.ganam) {
    ganamScore = 1;
    ganamNote = `உத்தமம் (இருவரும் ${girlStar.ganam} கணம் - மன ஒற்றுமை)`;
  } else if (
    (girlStar.ganam === 'தேவ' && boyStar.ganam === 'மனுஷ') ||
    (girlStar.ganam === 'மனுஷ' && boyStar.ganam === 'தேவ')
  ) {
    ganamScore = 0.75;
    ganamNote = 'மத்திமம் (தேவ - மனுஷ சேர்க்கை இணக்கமானது)';
  } else if (girlStar.ganam === 'ராட்சச' && boyStar.ganam === 'ராட்சச') {
    ganamScore = 0.5;
    ganamNote = 'மத்திமம் (இருவரும் ராட்சச கணம்)';
  } else {
    ganamScore = 0;
    ganamNote = 'பொருத்தமில்லை (கணப் பகை - கருத்து வேறுபாடு வரலாம்)';
  }

  // ── 3. Mahendram (மகேந்திரம்) ──
  const mahendraDistances = [4, 7, 10, 13, 16, 19, 22, 25];
  const isMahendram = mahendraDistances.includes(starDistance);
  const mahendramScore = isMahendram ? 1 : 0;
  const mahendramNote = isMahendram
    ? 'உத்தமம் (புத்திர பாக்கியம் & வம்ச விருத்தி உண்டு)'
    : 'பொருத்தமில்லை (சாதாரண நிலை)';

  // ── 4. Stree Dheergam (ஸ்திரீ தீர்க்கம்) ──
  let streeScore = 0;
  let streeNote = '';
  if (starDistance > 13) {
    streeScore = 1;
    streeNote = 'உத்தமம் (13 நட்சத்திர தூரத்திற்கு மேல் - தீர்க்க சுமங்கலி யோகம்)';
  } else if (starDistance >= 7) {
    streeScore = 0.5;
    streeNote = 'மத்திமம் (7 முதல் 13 நட்சத்திர தூரம்)';
  } else {
    streeScore = 0;
    streeNote = 'பொருத்தமில்லை (குறைந்த தூரம்)';
  }

  // ── 5. Yoni (யோனி) ──
  let yoniScore = 0;
  let yoniNote = '';
  const isYoniEnemy = rasiData.yoniEnemies.some(
    ([a, b]) => (a === girlStar.yoni && b === boyStar.yoni) || (b === girlStar.yoni && a === boyStar.yoni)
  );

  if (girlStar.yoni === boyStar.yoni) {
    yoniScore = 1;
    yoniNote = `உத்தமம் (ஒரே யோனி: ${girlStar.yoni} - மிகச் சிறந்த தாம்பத்திய இணக்கம்)`;
  } else if (isYoniEnemy) {
    yoniScore = 0;
    yoniNote = `பகை யோனி ❌ (${girlStar.yoni} ↔ ${boyStar.yoni} - தவிர்க்கவும்)`;
  } else {
    yoniScore = 0.75;
    yoniNote = `நட்பு யோனி (${girlStar.yoni} & ${boyStar.yoni})`;
  }

  // ── 6. Rasi (ராசி) with Sashtashtakam Cancellation ──
  let rasiScore = 0;
  let rasiNote = '';
  const bLord = bRasi.lord;
  const gLord = gRasi.lord;

  if (rasiDistance === 7) {
    rasiScore = 1;
    rasiNote = 'உத்தமம் (சம சப்தம ராசி - சிறந்த குடும்ப மேன்மை)';
  } else if ([3, 4, 10, 11].includes(rasiDistance)) {
    rasiScore = 1;
    rasiNote = 'உத்தமம் (குடும்ப விருத்தி & சுபயோகம்)';
  } else if ([2, 12, 5, 9].includes(rasiDistance)) {
    rasiScore = 0.5;
    rasiNote = 'மத்திம பொருத்தம்';
  } else if ([6, 8].includes(rasiDistance)) {
    // Check 6/8 cancellation rules (சஷ்டாஷ்டக தோஷ விலக்கு)
    const isSameLord = bLord === gLord;
    const isMutualFriend =
      rasiData.lordFriendship[bLord]?.friends.includes(gLord) &&
      rasiData.lordFriendship[gLord]?.friends.includes(bLord);

    if (isSameLord) {
      rasiScore = 0.75;
      rasiNote = `சஷ்டாஷ்டக தோஷ விலக்கு உண்டு ✅ (இருவருக்கும் ஒரே அதிபதி: ${bLord})`;
    } else if (isMutualFriend) {
      rasiScore = 0.6;
      rasiNote = `மித்திர சஷ்டாஷ்டகம் ✅ (அதிபதிகள் ${bLord} & ${gLord} நண்பர்கள் - தோஷம் ரத்தாகிறது)`;
    } else {
      rasiScore = 0;
      rasiNote = 'சஷ்டாஷ்டக தோஷம் ❌ (6/8 பகை - மனஸ்தாபம் ஏற்படலாம்)';
    }
  } else {
    rasiScore = 0.5;
    rasiNote = 'சாதாரண பொருத்தம்';
  }

  // ── 7. Rasiyathipathi (ராசியதிபதி) ──
  let rasiathiScore = 0;
  let rasiathiNote = '';
  if (gLord === bLord) {
    rasiathiScore = 1;
    rasiathiNote = `உத்தமம் (ஒரே அதிபதி: ${gLord} - பரஸ்பர அன்பு)`;
  } else if (
    rasiData.lordFriendship[gLord]?.friends.includes(bLord) &&
    rasiData.lordFriendship[bLord]?.friends.includes(gLord)
  ) {
    rasiathiScore = 1;
    rasiathiNote = `உத்தமம் (அதிபதிகள் மித்திரர்கள்: ${gLord} & ${bLord})`;
  } else if (
    rasiData.lordFriendship[gLord]?.enemies.includes(bLord) ||
    rasiData.lordFriendship[bLord]?.enemies.includes(gLord)
  ) {
    rasiathiScore = 0;
    rasiathiNote = `பொருத்தமில்லை (அதிபதிகள் பகை: ${gLord} ↔ ${bLord})`;
  } else {
    rasiathiScore = 0.5;
    rasiathiNote = `மத்திமம் (சம நிலை: ${gLord} & ${bLord})`;
  }

  // ── 8. Vasiyam (வசியம்) ──
  const isVasiyam = gRasi.vasiya?.includes(bRasi.id) || bRasi.vasiya?.includes(gRasi.id);
  const vasiyaScore = isVasiyam ? 1 : 0;
  const vasiyaNote = isVasiyam ? 'உத்தமம் (பரஸ்பர வசிய ஈர்ப்பு சக்தி உண்டு)' : 'வசியமில்லை (சாதாரணம்)';

  // ── 9. Rajju (ரஜ்ஜு - ⭐ CRITICAL) ──
  let rajjuScore = 0;
  let rajjuNote = '';
  const isSameRajju = girlStar.rajju === boyStar.rajju;
  if (!isSameRajju) {
    rajjuScore = 1;
    rajjuNote = `உத்தமம் (${girlStar.rajju} ரஜ்ஜு & ${boyStar.rajju} ரஜ்ஜு - மாங்கல்ய பலம் உண்டு)`;
  } else {
    rajjuScore = 0;
    const rajjuDoshaImpact = {
      'சிரசு': 'சிரசு ரஜ்ஜு தட்டு (கணவருக்கு பாதிப்பு - மிகக் கடுமையான தோஷம்)',
      'கழுத்து': 'கழுத்து ரஜ்ஜு தட்டு (மனைவிக்கு பாதிப்பு - தவிர்க்கவும்)',
      'வயிறு': 'வயிறு/நாபி ரஜ்ஜு தட்டு (புத்திர தோஷம் வரலாம்)',
      'தொடை': 'தொடை ரஜ்ஜு தட்டு (பொருளாதார இழப்பு ஏற்படலாம்)',
      'பாதம்': 'பாத ரஜ்ஜு தட்டு (அலைச்சல் & இடப்பெயர்ச்சி)',
    };
    rajjuNote = `ரஜ்ஜு தோஷம் ❌ (${rajjuDoshaImpact[girlStar.rajju] || 'ஒரே ரஜ்ஜு தட்டு'})`;
  }

  // ── 10. Vedhai (வேதை) ──
  const isVedhai = girlStar.vedhai?.includes(boyStar.id) || boyStar.vedhai?.includes(girlStar.id);
  const vedhaiScore = isVedhai ? 0 : 1;
  const vedhaiNote = isVedhai
    ? 'வேதை தோஷம் உண்டு ❌ (துன்பம் வரலாம் - தவிர்க்கவும்)'
    : 'வேதை இல்லை ✅ (சுப சேர்க்கை)';

  // ── 11. Nadi (நாடி) - Genetics & Progeny ──
  let nadiScore = 0;
  let nadiNote = '';
  if (girlStar.nadi !== boyStar.nadi) {
    nadiScore = 1;
    nadiNote = `உத்தமம் (${girlStar.nadi} நாடி & ${boyStar.nadi} நாடி - வாரிசு ஆரோக்கியம் உண்டு)`;
  } else {
    // If same Nadi, check if star or pada is different
    if (boyStar.id !== girlStar.id || boyPada !== girlPada) {
      nadiScore = 0.5;
      nadiNote = `மத்திமம் (ஒரே ${girlStar.nadi} நாடி - பாத பேதத்தால் தோஷ நிவர்த்தி)`;
    } else {
      nadiScore = 0;
      nadiNote = `நாடி ஏகத்துவம் ❌ (ஒரே ${girlStar.nadi} நாடி - ஆரோக்கிய கவனம் தேவை)`;
    }
  }

  // ── 12. Vriksha (விருட்சம்) - Prosperity Tree ──
  let vrikshaScore = 0;
  let vrikshaNote = '';
  if (girlStar.isMilkTree && boyStar.isMilkTree) {
    vrikshaScore = 1;
    vrikshaNote = `உத்தமம் (இருவருக்கும் பால் மரம்: ${girlStar.tree} & ${boyStar.tree} - வாழ்வு செழிக்கும்)`;
  } else if (girlStar.isMilkTree || boyStar.isMilkTree) {
    vrikshaScore = 0.75;
    vrikshaNote = `நல்ல பொருத்தம் (ஒருவருக்கு பால் மரம்: ${girlStar.tree} / ${boyStar.tree})`;
  } else {
    vrikshaScore = 0.5;
    vrikshaNote = `மத்திமம் (${girlStar.tree} & ${boyStar.tree})`;
  }

  // 12 Porutham Master List
  const poruthams = [
    { name: 'தினப் பொருத்தம்',      nameEn: 'Dhinam',       desc: 'ஆயுள் & ஆரோக்கியம்',        score: dhinamScore,   max: 1, note: dhinamNote,   isCrucial: false },
    { name: 'கணப் பொருத்தம்',      nameEn: 'Ganam',        desc: 'குணம் & மன ஒற்றுமை',        score: ganamScore,    max: 1, note: ganamNote,    isCrucial: false },
    { name: 'மகேந்திரப் பொருத்தம்', nameEn: 'Mahendram',    desc: 'புத்திர பாக்கியம் & சந்ததி',   score: mahendramScore,max: 1, note: mahendramNote,isCrucial: false },
    { name: 'ஸ்திரீ தீர்க்கம்',    nameEn: 'Stree Dheergam',desc: 'தீர்க்க சுமங்கலி யோகம்',    score: streeScore,    max: 1, note: streeNote,    isCrucial: false },
    { name: 'யோனிப் பொருத்தம்',     nameEn: 'Yoni',         desc: 'தாம்பத்திய உடலமைப்பு இணக்கம்',score: yoniScore,     max: 1, note: yoniNote,     isCrucial: false },
    { name: 'ராசிப் பொருத்தம்',     nameEn: 'Rasi',         desc: 'வம்ச விருத்தி & வளம்',       score: rasiScore,     max: 1, note: rasiNote,     isCrucial: true  },
    { name: 'ராசியதிபதி பொருத்தம்',nameEn: 'Rasiyathipathi',desc: 'அன்பு & சிநேக பாவம்',       score: rasiathiScore, max: 1, note: rasiathiNote, isCrucial: false },
    { name: 'வசியப் பொருத்தம்',     nameEn: 'Vasiyam',      desc: 'பரஸ்பர ஈர்ப்பு சக்தி',        score: vasiyaScore,   max: 1, note: vasiyaNote,   isCrucial: false },
    { name: 'ரஜ்ஜுப் பொருத்தம்',     nameEn: 'Rajju',        desc: 'மாங்கல்ய பலம் (முக்கியம்)', score: rajjuScore,    max: 1, note: rajjuNote,    isCrucial: true  },
    { name: 'வேதைப் பொருத்தம்',     nameEn: 'Vedhai',       desc: 'துன்பமின்மை & நல்வாழ்வு',    score: vedhaiScore,   max: 1, note: vedhaiNote,   isCrucial: true  },
    { name: 'நாடிப் பொருத்தம்',     nameEn: 'Nadi',         desc: 'மரபணு & வாரிசு ஆரோக்கியம்',score: nadiScore,     max: 1, note: nadiNote,     isCrucial: true  },
    { name: 'விருட்சப் பொருத்தம்',   nameEn: 'Vriksha',      desc: 'பொருளாதார விருத்தி & செல்வம்',score: vrikshaScore, max: 1, note: vrikshaNote,  isCrucial: false },
  ];

  const totalScore = poruthams.reduce((sum, p) => sum + p.score, 0);
  const matchedCount = poruthams.filter(p => p.score >= 0.5).length;
  const percentage = Math.round((totalScore / 12) * 100);

  // ── Dosha Evaluation Engine ──
  let sevvaiStatus = 'balanced';
  let sevvaiNote = 'இருவருக்கும் செவ்வாய் தோஷம் சமமாக உள்ளது (தோஷ சாம்யம் உண்டு ✅).';
  if (boySevvai && !girlSevvai) {
    sevvaiStatus = 'unbalanced';
    sevvaiNote = 'மணமகனுக்கு மட்டும் செவ்வாய் தோஷம் உள்ளது. விரிவான ஜாதக ஆய்வு தேவை ⚠️.';
  } else if (!boySevvai && girlSevvai) {
    sevvaiStatus = 'unbalanced';
    sevvaiNote = 'மணமகளுக்கு மட்டும் செவ்வாய் தோஷம் உள்ளது. விரிவான ஜாதக ஆய்வு தேவை ⚠️.';
  }

  let rahuStatus = 'balanced';
  let rahuNote = 'இருவருக்கும் சர்ப்ப தோஷம் சமமாக உள்ளது ✅.';
  if (boyRahu !== girlRahu) {
    rahuStatus = 'unbalanced';
    rahuNote = 'ஒருவருக்கு மட்டும் ராகு-கேது தோஷம் உள்ளது. தோஷ நிவர்த்தி பரிசீலிக்கவும் ⚠️.';
  }

  // ── Verdict Determination ──
  let verdict = 'good';
  let verdictLabel = 'நல்ல பொருத்தம் (Good Match)';
  let verdictIcon = '💚';
  let verdictDesc = 'பொருத்தங்கள் திருப்திகரமாக உள்ளன. திருமணம் செய்யலாம்.';

  if (isSameRajju) {
    verdict = 'danger';
    verdictLabel = 'ரஜ்ஜு தோஷம் உள்ளது (Avoid - Rajju Clash)';
    verdictIcon = '⚠️';
    verdictDesc = 'ரஜ்ஜு பொருத்தம் இல்லை. பாரம்பரிய சாஸ்திர விதிகளின்படி இந்த வரனைத் தவிர்ப்பது நல்லது.';
  } else if (isVedhai) {
    verdict = 'warn';
    verdictLabel = 'வேதை தோஷம் (Vedhai Conflict)';
    verdictIcon = '⚡';
    verdictDesc = 'வேதை தோஷம் உள்ளது. ஜோதிடரை அணுகி விரிவான ஜாதக ஆய்வு செய்யவும்.';
  } else if (totalScore >= 9) {
    verdict = 'ideal';
    verdictLabel = 'மிகவும் சிறந்த உத்தம பொருத்தம் (Ideal / Excellent Match)';
    verdictIcon = '🌟';
    verdictDesc = '12-ல் அதிக முக்கிய பொருத்தங்கள் மிகச் சிறப்பாக பொருந்தியுள்ளன!';
  } else if (totalScore >= 6.5) {
    verdict = 'good';
    verdictLabel = 'மத்திம பொருத்தம் (Moderate Match)';
    verdictIcon = '✅';
    verdictDesc = 'தேவையான முக்கிய பொருத்தங்கள் சுபமாக உள்ளன. வரன் உகந்தது.';
  } else {
    verdict = 'avoid';
    verdictLabel = 'பொருத்தங்கள் குறைவு (Low Compatibility)';
    verdictIcon = '❌';
    verdictDesc = 'குறைந்த பொருத்தங்களே பொருந்துகின்றன. ஜோதிட ஆலோசனை பெறுவது நல்லது.';
  }

  return {
    boyStar,
    boyPada,
    girlStar,
    girlPada,
    bRasi,
    gRasi,
    poruthams,
    totalScore: Math.round(totalScore * 10) / 10,
    matchedCount,
    percentage,
    isSameRajju,
    isVedhai,
    sevvaiStatus,
    sevvaiNote,
    rahuStatus,
    rahuNote,
    verdict,
    verdictLabel,
    verdictIcon,
    verdictDesc,
  };
}

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
export default function RasiPoruthamPage() {
  // Groom Defaults: Ashwini Pada 1 (Mesham)
  const [boyStarId, setBoyStarId] = useState(1);
  const [boyPada, setBoyPada]     = useState(1);
  const [boySevvai, setBoySevvai] = useState(false);
  const [boyRahu, setBoyRahu]     = useState(false);

  // Bride Defaults: Mrigashira Pada 1 (Rishabam)
  const [girlStarId, setGirlStarId] = useState(5);
  const [girlPada, setGirlPada]     = useState(1);
  const [girlSevvai, setGirlSevvai] = useState(false);
  const [girlRahu, setGirlRahu]     = useState(false);

  // Active Tab: 'porutham' | 'dosha' | 'rules' | 'kulam_rules'
  const [activeTab, setActiveTab] = useState('porutham');

  // Calculate live matching result
  const result = useMemo(() => {
    return calculate12Porutham(
      boyStarId,
      boyPada,
      girlStarId,
      girlPada,
      boySevvai,
      girlSevvai,
      boyRahu,
      girlRahu
    );
  }, [boyStarId, boyPada, girlStarId, girlPada, boySevvai, girlSevvai, boyRahu, girlRahu]);

  // WhatsApp Share Text Generator
  const handleShareWhatsApp = () => {
    if (!result) return;
    const shareText = `*உப்பிலிய நாயக்கர் திருமண பொருத்தம் அறிக்கை (12 Porutham)*
💍 *மணமகன்:* ${result.boyStar.name} (பாதம் ${result.boyPada}) - ${result.bRasi.name}
👰 *மணமகள்:* ${result.girlStar.name} (பாதம் ${result.girlPada}) - ${result.gRasi.name}

📊 *பொருத்தம் மதிப்பெண்:* ${result.totalScore}/12 (${result.percentage}%)
🏆 *முடிவு:* ${result.verdictIcon} ${result.verdictLabel}
📌 *ரஜ்ஜு:* ${result.isSameRajju ? 'ரஜ்ஜு தோஷம் உண்டு ❌' : 'ரஜ்ஜு சுபம் உண்டு ✅'}
✨ *செவ்வாய் தோஷம்:* ${result.sevvaiNote}
🐍 *ராகு-கேது நிலை:* ${result.rahuNote}

*12 பொருத்தங்கள் விவரம்:*
${result.poruthams.map(p => `${p.score >= 0.5 ? '✅' : '❌'} ${p.name}: ${p.note}`).join('\n')}

மேலும் விவரங்களுக்கு: ${typeof window !== 'undefined' ? window.location.href : 'https://uppiliya-naicker-kulam.vercel.app/rasi-porutham'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .rp-page {
          min-height: 85vh;
          padding: clamp(1.25rem, 4vw, 2.75rem) clamp(0.75rem, 3.5vw, 1.5rem) 4rem;
          font-family: 'Outfit', 'Noto Sans Tamil', sans-serif;
        }
        .rp-container { max-width: 960px; margin: 0 auto; }

        /* ── Hero ── */
        .rp-hero { text-align: center; margin-bottom: 2rem; }
        .rp-hero-badge {
          display: inline-flex; align-items: center; gap: .45rem;
          padding: .32rem 1rem; border-radius: 999px;
          background: rgba(192,132,252,0.12); border: 1px solid rgba(192,132,252,0.35);
          color: #c084fc; font-size: .82rem; font-weight: 700; margin-bottom: .85rem;
        }
        .rp-hero-h1 {
          font-size: clamp(1.75rem, 4.5vw, 2.75rem);
          font-weight: 900; line-height: 1.2;
          background: linear-gradient(135deg, #fbbf24 0%, #ec4899 50%, #c084fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin: 0 0 .5rem;
        }
        .rp-hero-sub {
          color: var(--text-muted, #94a3b8);
          font-size: clamp(0.9rem, 2.5vw, 1.05rem); max-width: 660px; margin: 0 auto;
          line-height: 1.6;
        }

        /* ── Main Selector Card ── */
        .rp-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(192,132,252,0.25);
          border-radius: 1.25rem;
          padding: clamp(1.25rem, 3vw, 2rem);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          margin-bottom: 1.5rem;
        }
        .rp-card-title {
          font-size: 1.15rem; font-weight: 800; color: #fbbf24; margin-bottom: 1.25rem;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem;
        }

        .rp-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1rem, 3vw, 1.75rem);
          align-items: start;
        }
        @media(max-width: 640px) {
          .rp-form-grid { grid-template-columns: 1fr; }
        }

        .rp-column {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          padding: 1.15rem;
        }
        .rp-col-header {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem;
          padding-bottom: .65rem; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .rp-boy-head { color: #60a5fa; }
        .rp-girl-head { color: #f472b6; }

        .rp-field { margin-bottom: 1rem; }
        .rp-field:last-child { margin-bottom: 0; }
        .rp-label {
          display: block; font-size: .85rem; font-weight: 600; color: #cbd5e1;
          margin-bottom: .4rem;
        }
        .rp-select {
          width: 100%; padding: .65rem .85rem;
          background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.18);
          border-radius: .65rem; color: #f8fafc; font-size: .92rem;
          font-family: inherit; cursor: pointer; outline: none;
          transition: border-color .2s;
        }
        .rp-select:focus { border-color: #c084fc; }

        /* Pada Selector Grid */
        .rp-pada-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: .45rem;
          margin-top: .35rem;
        }
        .rp-pada-btn {
          padding: .45rem .3rem; text-align: center; border-radius: .55rem;
          border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.3);
          color: #94a3b8; font-size: .82rem; font-weight: 700; cursor: pointer;
          font-family: inherit; transition: all .15s;
        }
        .rp-pada-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .rp-pada-btn.active {
          background: #8b5cf6; border-color: #a78bfa; color: #fff;
          box-shadow: 0 2px 8px rgba(139,92,246,0.35);
        }

        /* Auto-detected Rasi Banner */
        .rp-auto-rasi {
          display: flex; align-items: center; justify-content: space-between;
          padding: .6rem .85rem; border-radius: .65rem;
          background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.3);
          margin-top: .6rem;
        }
        .rp-auto-rasi-name { font-weight: 700; font-size: .95rem; color: #f1f5f9; }
        .rp-auto-rasi-lord { font-size: .78rem; color: #cbd5e1; }

        .rp-attr-chips {
          display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .6rem;
        }
        .rp-attr-chip {
          font-size: .72rem; padding: .2rem .5rem; border-radius: .4rem;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
        }

        .rp-dosha-toggles {
          display: grid; grid-template-columns: 1fr 1fr; gap: .5rem;
          margin-top: .85rem;
        }
        .rp-checkbox-wrap {
          display: flex; align-items: center; gap: .5rem;
          padding: .5rem .65rem;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: .6rem; cursor: pointer; user-select: none;
        }
        .rp-checkbox-wrap input { cursor: pointer; width: 15px; height: 15px; accent-color: #ef4444; }
        .rp-checkbox-label { font-size: .78rem; color: #fca5a5; font-weight: 600; }

        /* ── Result Card ── */
        .rp-result-box {
          border-radius: 1.25rem; border: 1.5px solid;
          padding: clamp(1.25rem, 3vw, 1.75rem);
          margin-bottom: 1.5rem;
          animation: rpFadeUp .35s ease;
          backdrop-filter: blur(14px);
        }
        @keyframes rpFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rp-res-head {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;
          padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .rp-res-badge-wrap { display: flex; align-items: center; gap: .75rem; }
        .rp-res-icon { font-size: 2.75rem; line-height: 1; }
        .rp-res-title { font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 800; line-height: 1.2; }
        .rp-res-sub { font-size: .88rem; color: #cbd5e1; margin-top: .2rem; }

        .rp-score-circle {
          text-align: right;
          background: rgba(0,0,0,0.3); border-radius: .85rem; padding: .6rem 1rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .rp-score-num { font-size: 1.5rem; font-weight: 900; color: #fbbf24; }
        .rp-score-lbl { font-size: .72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; }

        /* Key highlights row */
        .rp-highlights {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: .75rem; margin-bottom: 1.25rem;
        }
        .rp-hl-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: .85rem; padding: .85rem;
        }
        .rp-hl-title { font-size: .75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: .25rem; }
        .rp-hl-val { font-size: .92rem; font-weight: 700; color: #f8fafc; }

        /* ── 12 Porutham Table ── */
        .rp-tbl-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem; padding: clamp(1rem, 3vw, 1.5rem);
          margin-bottom: 1.5rem;
        }
        .rp-tbl-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; flex-wrap: wrap; gap: .5rem;
        }
        .rp-tbl-title { font-size: 1.1rem; font-weight: 800; color: #f8fafc; }
        .rp-tbl-counter {
          font-size: .82rem; font-weight: 700; color: #34d399;
          background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3);
          padding: .25rem .75rem; border-radius: 999px;
        }

        .rp-table { width: 100%; border-collapse: collapse; }
        .rp-tr {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: background .15s;
        }
        .rp-tr:last-child { border-bottom: none; }
        .rp-tr:hover { background: rgba(255,255,255,0.025); }
        .rp-td { padding: .75rem .5rem; font-size: .88rem; vertical-align: middle; }
        .rp-td-name { font-weight: 700; color: #f1f5f9; min-width: 140px; }
        .rp-td-name-sub { font-size: .75rem; color: #94a3b8; font-weight: 400; margin-top: .1rem; }
        .rp-td-status { text-align: center; min-width: 80px; }
        .rp-td-note { color: #cbd5e1; font-size: .84rem; }

        .rp-badge-pass {
          display: inline-flex; align-items: center; gap: .25rem;
          padding: .2rem .6rem; border-radius: 999px;
          background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4);
          color: #4ade80; font-size: .75rem; font-weight: 700;
        }
        .rp-badge-half {
          display: inline-flex; align-items: center; gap: .25rem;
          padding: .2rem .6rem; border-radius: 999px;
          background: rgba(234,179,8,0.15); border: 1px solid rgba(234,179,8,0.4);
          color: #facc15; font-size: .75rem; font-weight: 700;
        }
        .rp-badge-fail {
          display: inline-flex; align-items: center; gap: .25rem;
          padding: .2rem .6rem; border-radius: 999px;
          background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4);
          color: #f87171; font-size: .75rem; font-weight: 700;
        }

        /* ── Community Kulam Rules ── */
        .rp-kulam-box {
          background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(168,85,247,0.1));
          border: 1.5px solid rgba(245,158,11,0.35); border-radius: 1.25rem;
          padding: 1.25rem; margin-bottom: 1.5rem;
        }
        .rp-kulam-title { font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: .5rem; display: flex; align-items: center; gap: .4rem; }
        .rp-kulam-desc { font-size: .88rem; color: #cbd5e1; line-height: 1.65; margin: 0; }

        /* ── Share Bar ── */
        .rp-share-bar {
          display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;
        }
        .rp-btn-wa {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .75rem 1.6rem; border-radius: .75rem;
          background: linear-gradient(135deg,#22c55e,#16a34a);
          color: #fff; font-size: .95rem; font-weight: 700;
          border: none; cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 16px rgba(34,197,94,0.3);
          transition: all .2s;
        }
        .rp-btn-wa:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(34,197,94,0.45); }

        /* ── Navigation Tabs ── */
        .rp-tabs {
          display: flex; gap: .4rem; margin-bottom: 1.5rem;
          background: rgba(0,0,0,0.3); border-radius: .85rem; padding: .3rem;
          border: 1px solid rgba(255,255,255,0.08);
          overflow-x: auto; scrollbar-width: none;
        }
        .rp-tabs::-webkit-scrollbar { display: none; }
        .rp-tab {
          flex: 1; min-width: 120px; padding: .6rem .8rem; border-radius: .65rem; border: none;
          background: none; color: #64748b; font-size: .88rem; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all .2s; white-space: nowrap; text-align: center;
        }
        .rp-tab.active { background: rgba(255,255,255,0.1); color: #f8fafc; }

        /* Mobile tweaks */
        @media(max-width: 600px) {
          .rp-page { padding: 1.25rem 0.75rem 3.5rem; }
          .rp-card, .rp-tbl-card, .rp-result-box { padding: 1.15rem 0.9rem; border-radius: 1rem; }
          .rp-table { font-size: 0.82rem; }
          .rp-td { padding: 0.6rem 0.35rem; }
          .rp-td-name { min-width: 110px; font-size: 0.84rem; }
          .rp-btn-wa { width: 100%; justify-content: center; }
          .rp-dosha-toggles { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="rp-page">
        <div className="rp-container">

          {/* ── Hero ── */}
          <div className="rp-hero">
            <div className="rp-hero-badge">⭐ ஜோதிட சாஸ்திரம் · 12 Porutham Vedic Engine</div>
            <h1 className="rp-hero-h1">திருமண பொருத்தம்</h1>
            <p className="rp-hero-sub">
              மணமகன் &amp; மணமகளின் நட்சத்திரம், பாதம் (1-4), ராசி மற்றும் செவ்வாய்/ராகு தோஷங்களை கொண்டு தமிழ் பாரம்பரிய 12 பொருத்தங்களை துல்லியமாக கணிக்கவும்.
            </p>
          </div>

          {/* ── View Navigation Tabs ── */}
          <div className="rp-tabs">
            <button
              className={`rp-tab ${activeTab === 'porutham' ? 'active' : ''}`}
              onClick={() => setActiveTab('porutham')}
            >
              📊 12 பொருத்தங்கள் கணிப்பு
            </button>
            <button
              className={`rp-tab ${activeTab === 'dosha' ? 'active' : ''}`}
              onClick={() => setActiveTab('dosha')}
            >
              🛡️ தோஷ &amp; விலக்கு விதிகள்
            </button>
            <button
              className={`rp-tab ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              📜 சாஸ்திர விளக்கங்கள்
            </button>
            <button
              className={`rp-tab ${activeTab === 'kulam_rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('kulam_rules')}
            >
              🏛️ குல முறை வழிகாட்டி
            </button>
          </div>

          {activeTab === 'porutham' && (
            <>
              {/* ── Dual Input Selector Card ── */}
              <div className="rp-card">
                <div className="rp-card-title">
                  <span>👫 வரன் விவரங்கள் (Groom &amp; Bride Details)</span>
                  <span style={{ fontSize: '.78rem', color: '#94a3b8', fontWeight: 500 }}>
                    பாதத்தை (1-4) மாற்றினால் துல்லிய ராசி தானாக கணிக்கப்படும்
                  </span>
                </div>

                <div className="rp-form-grid">
                  {/* Boy Column */}
                  <div className="rp-column">
                    <div className="rp-col-header rp-boy-head">
                      <span>👦 மணமகன் (Groom)</span>
                      <span style={{ fontSize: '.78rem', color: '#94a3b8' }}>ஆண் வரன்</span>
                    </div>

                    {/* Star Selector */}
                    <div className="rp-field">
                      <label className="rp-label">நட்சத்திரம் (Nakshatra):</label>
                      <select
                        className="rp-select"
                        value={boyStarId}
                        onChange={e => setBoyStarId(Number(e.target.value))}
                      >
                        {rasiData.nakshatras.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.id}. {n.name} ({n.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pada 1..4 Selector */}
                    <div className="rp-field">
                      <label className="rp-label">பாதம் (Pada):</label>
                      <div className="rp-pada-grid">
                        {[1, 2, 3, 4].map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`rp-pada-btn ${boyPada === p ? 'active' : ''}`}
                            onClick={() => setBoyPada(p)}
                          >
                            பாதம் {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-derived Rasi badge */}
                    {result?.bRasi && (
                      <div className="rp-auto-rasi">
                        <div>
                          <div className="rp-auto-rasi-name">
                            {result.bRasi.symbol} {result.bRasi.name} ராசி
                          </div>
                          <div className="rp-auto-rasi-lord">அதிபதி: {result.bRasi.lord}</div>
                        </div>
                        <span style={{ fontSize: '.75rem', color: '#c084fc', fontWeight: 700 }}>
                          பாதம் {boyPada} அடிப்படையில்
                        </span>
                      </div>
                    )}

                    {/* Attributes chips */}
                    {result?.boyStar && (
                      <div className="rp-attr-chips">
                        <span className="rp-attr-chip">கணம்: {result.boyStar.ganam}</span>
                        <span className="rp-attr-chip">யோனி: {result.boyStar.yoni}</span>
                        <span className="rp-attr-chip">ரஜ்ஜு: {result.boyStar.rajju}</span>
                        <span className="rp-attr-chip">நாடி: {result.boyStar.nadi}</span>
                        <span className="rp-attr-chip">மரம்: {result.boyStar.tree}</span>
                      </div>
                    )}

                    {/* Dosha Checkboxes */}
                    <div className="rp-dosha-toggles">
                      <label className="rp-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={boySevvai}
                          onChange={e => setBoySevvai(e.target.checked)}
                        />
                        <span className="rp-checkbox-label">செவ்வாய் தோஷம்</span>
                      </label>
                      <label className="rp-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={boyRahu}
                          onChange={e => setBoyRahu(e.target.checked)}
                        />
                        <span className="rp-checkbox-label">ராகு-கேது தோஷம்</span>
                      </label>
                    </div>
                  </div>

                  {/* Girl Column */}
                  <div className="rp-column">
                    <div className="rp-col-header rp-girl-head">
                      <span>👧 மணமகள் (Bride)</span>
                      <span style={{ fontSize: '.78rem', color: '#94a3b8' }}>பெண் வரன்</span>
                    </div>

                    {/* Star Selector */}
                    <div className="rp-field">
                      <label className="rp-label">நட்சத்திரம் (Nakshatra):</label>
                      <select
                        className="rp-select"
                        value={girlStarId}
                        onChange={e => setGirlStarId(Number(e.target.value))}
                      >
                        {rasiData.nakshatras.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.id}. {n.name} ({n.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pada 1..4 Selector */}
                    <div className="rp-field">
                      <label className="rp-label">பாதம் (Pada):</label>
                      <div className="rp-pada-grid">
                        {[1, 2, 3, 4].map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`rp-pada-btn ${girlPada === p ? 'active' : ''}`}
                            onClick={() => setGirlPada(p)}
                          >
                            பாதம் {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-derived Rasi badge */}
                    {result?.gRasi && (
                      <div className="rp-auto-rasi">
                        <div>
                          <div className="rp-auto-rasi-name">
                            {result.gRasi.symbol} {result.gRasi.name} ராசி
                          </div>
                          <div className="rp-auto-rasi-lord">அதிபதி: {result.gRasi.lord}</div>
                        </div>
                        <span style={{ fontSize: '.75rem', color: '#ec4899', fontWeight: 700 }}>
                          பாதம் {girlPada} அடிப்படையில்
                        </span>
                      </div>
                    )}

                    {/* Attributes chips */}
                    {result?.girlStar && (
                      <div className="rp-attr-chips">
                        <span className="rp-attr-chip">கணம்: {result.girlStar.ganam}</span>
                        <span className="rp-attr-chip">யோனி: {result.girlStar.yoni}</span>
                        <span className="rp-attr-chip">ரஜ்ஜு: {result.girlStar.rajju}</span>
                        <span className="rp-attr-chip">நாடி: {result.girlStar.nadi}</span>
                        <span className="rp-attr-chip">மரம்: {result.girlStar.tree}</span>
                      </div>
                    )}

                    {/* Dosha Checkboxes */}
                    <div className="rp-dosha-toggles">
                      <label className="rp-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={girlSevvai}
                          onChange={e => setGirlSevvai(e.target.checked)}
                        />
                        <span className="rp-checkbox-label">செவ்வாய் தோஷம்</span>
                      </label>
                      <label className="rp-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={girlRahu}
                          onChange={e => setGirlRahu(e.target.checked)}
                        />
                        <span className="rp-checkbox-label">ராகு-கேது தோஷம்</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Match Result Banner ── */}
              {result && (
                <>
                  <div
                    className="rp-result-box"
                    style={{
                      background:
                        result.verdict === 'danger'
                          ? 'rgba(239,68,68,0.12)'
                          : result.verdict === 'ideal'
                          ? 'rgba(16,185,129,0.14)'
                          : result.verdict === 'good'
                          ? 'rgba(34,197,94,0.12)'
                          : result.verdict === 'warn'
                          ? 'rgba(234,179,8,0.12)'
                          : 'rgba(239,68,68,0.10)',
                      borderColor:
                        result.verdict === 'danger'
                          ? '#ef4444'
                          : result.verdict === 'ideal'
                          ? '#10b981'
                          : result.verdict === 'good'
                          ? '#22c55e'
                          : result.verdict === 'warn'
                          ? '#eab308'
                          : '#f97316',
                    }}
                  >
                    <div className="rp-res-head">
                      <div className="rp-res-badge-wrap">
                        <div className="rp-res-icon">{result.verdictIcon}</div>
                        <div>
                          <div
                            className="rp-res-title"
                            style={{
                              color:
                                result.verdict === 'danger'
                                  ? '#fca5a5'
                                  : result.verdict === 'ideal'
                                  ? '#6ee7b7'
                                  : result.verdict === 'good'
                                  ? '#86efac'
                                  : result.verdict === 'warn'
                                  ? '#fde047'
                                  : '#fdba74',
                            }}
                          >
                            {result.verdictLabel}
                          </div>
                          <div className="rp-res-sub">{result.verdictDesc}</div>
                        </div>
                      </div>

                      <div className="rp-score-circle">
                        <div className="rp-score-num">{result.totalScore} / 12</div>
                        <div className="rp-score-lbl">{result.percentage}% பொருத்தம்</div>
                      </div>
                    </div>

                    {/* Highlights Cards */}
                    <div className="rp-highlights">
                      <div className="rp-hl-card">
                        <div className="rp-hl-title">ரஜ்ஜு பொருத்தம் (மாங்கல்யம்)</div>
                        <div className="rp-hl-val" style={{ color: result.isSameRajju ? '#ef4444' : '#10b981' }}>
                          {result.isSameRajju ? '❌ ரஜ்ஜு தட்டு (தோஷம்)' : '✅ ரஜ்ஜு சுபம் (பொருந்தும்)'}
                        </div>
                      </div>

                      <div className="rp-hl-card">
                        <div className="rp-hl-title">நாடிப் பொருத்தம் (வாரிசு நலம்)</div>
                        <div className="rp-hl-val" style={{ color: result.poruthams[10].score >= 0.5 ? '#10b981' : '#f59e0b' }}>
                          {result.poruthams[10].score === 1 ? '✅ உத்தம நாடி' : '⚠️ நாடி ஏகத்துவம்'}
                        </div>
                      </div>

                      <div className="rp-hl-card">
                        <div className="rp-hl-title">செவ்வாய் தோஷம் நிலை</div>
                        <div className="rp-hl-val" style={{ color: result.sevvaiStatus === 'balanced' ? '#10b981' : '#f59e0b' }}>
                          {result.sevvaiStatus === 'balanced' ? '✅ தோஷ சாம்யம் உண்டு' : '⚠️ ஜாதக ஆய்வு தேவை'}
                        </div>
                      </div>

                      <div className="rp-hl-card">
                        <div className="rp-hl-title">ராசி &amp; அதிபதி சேர்க்கை</div>
                        <div className="rp-hl-val">
                          {result.bRasi.symbol} {result.bRasi.name} ↔ {result.gRasi.symbol} {result.gRasi.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── 12 Porutham Detail Table ── */}
                  <div className="rp-tbl-card">
                    <div className="rp-tbl-head">
                      <div className="rp-tbl-title">📋 12 பொருத்தங்கள் விரிவான அட்டவணை</div>
                      <div className="rp-tbl-counter">
                        {result.matchedCount} / 12 பொருத்தங்கள் சுபம்
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="rp-table">
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', textAlign: 'left' }}>
                            <th style={{ padding: '.65rem .5rem', color: '#94a3b8', fontSize: '.8rem' }}>பொருத்தம்</th>
                            <th style={{ padding: '.65rem .5rem', color: '#94a3b8', fontSize: '.8rem' }}>பலன்</th>
                            <th style={{ padding: '.65rem .5rem', color: '#94a3b8', fontSize: '.8rem', textAlign: 'center' }}>நிலை</th>
                            <th style={{ padding: '.65rem .5rem', color: '#94a3b8', fontSize: '.8rem' }}>சாஸ்திர விளக்கம்</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.poruthams.map((p, idx) => (
                            <tr key={idx} className="rp-tr">
                              <td className="rp-td rp-td-name">
                                <div>{p.name} {p.isCrucial && <span style={{ color: '#f59e0b' }}>★</span>}</div>
                                <div className="rp-td-name-sub">{p.nameEn}</div>
                              </td>
                              <td className="rp-td" style={{ color: '#94a3b8', fontSize: '.82rem' }}>
                                {p.desc}
                              </td>
                              <td className="rp-td rp-td-status">
                                {p.score >= 0.9 ? (
                                  <span className="rp-badge-pass">சுபம் ✅</span>
                                ) : p.score >= 0.5 ? (
                                  <span className="rp-badge-half">மத்திமம் ⚠️</span>
                                ) : (
                                  <span className="rp-badge-fail">பொருந்தாது ❌</span>
                                )}
                              </td>
                              <td className="rp-td rp-td-note">
                                {p.note}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Community Kulam Reminder ── */}
                  <div className="rp-kulam-box">
                    <div className="rp-kulam-title">
                      <span>🏛️ உப்பிலிய நாயக்கர் சமூக திருமண மரபு விதி</span>
                    </div>
                    <p className="rp-kulam-desc">
                      நட்சத்திர மற்றும் ராசிப் பொருத்தம் நன்றாக இருந்தாலும், உப்பிலிய நாயக்கர் குல பாரம்பரிய முறைப்படி <strong>பங்காளிகளுக்குள் திருமணம் செய்யக் கூடாது.</strong> மாமன்-மச்சான் உறவுமுறையுடைய குலங்களிலேயே வரன் தேர்ந்தெடுக்க வேண்டும்.
                    </p>
                  </div>

                  {/* ── WhatsApp Share Button ── */}
                  <div className="rp-share-bar">
                    <button className="rp-btn-wa" onClick={handleShareWhatsApp}>
                      <span>📲 வாட்ஸ்அப்பில் 12 பொருத்த அறிக்கையை பகிர்க</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'dosha' && (
            <div className="rp-card">
              <h2 style={{ fontSize: '1.3rem', color: '#fbbf24', marginTop: 0, marginBottom: '1.25rem' }}>
                🛡️ திருமண தோஷங்கள் மற்றும் விலக்கு விதிகள் (Pariharams)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#cbd5e1', fontSize: '.92rem', lineHeight: 1.7 }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#f87171', fontSize: '1.05rem', margin: '0 0 .5rem' }}>1. செவ்வாய் தோஷ சாம்யம் (Chevvai Dosha Matching)</h3>
                  <p style={{ margin: 0 }}>
                    லக்னம், சந்திரன், அல்லது சுக்கிரனிலிருந்து 1, 2, 4, 7, 8, 12 ஆகிய இடங்களில் செவ்வாய் இருப்பது செவ்வாய் தோஷம் எனப்படும். <strong>இருவருக்கும் செவ்வாய் தோஷம் இருந்தால் தோஷம் சமநிலையாகி (தோஷ சாம்யம்) நன்மையே விளையும்.</strong> மேஷம், விருச்சிகம், கடகம், மகரம், தனுசு, சிம்மத்தில் செவ்வாய் இருந்தால் தோஷ விலக்கு உண்டு.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#38bdf8', fontSize: '1.05rem', margin: '0 0 .5rem' }}>2. சஷ்டாஷ்டக தோஷ விலக்கு (6/8 Sashtashtakam Exceptions)</h3>
                  <p style={{ margin: 0 }}>
                    இருவரின் ராசிகள் 6/8 ஆக அமைந்தால் சஷ்டாஷ்டகம் எனப்படும். ஆனால்:
                    <br />• <strong>மேஷம் ↔ விருச்சிகம்</strong> (இருவருக்கும் அதிபதி செவ்வாய்)
                    <br />• <strong>ரிஷபம் ↔ துலாம்</strong> (இருவருக்கும் அதிபதி சுக்கிரன்)
                    <br />• <strong>மகரம் ↔ கும்பம்</strong> (இருவருக்கும் அதிபதி சனி)
                    <br />• <strong>கடகம் ↔ தனுசு</strong> (சந்திரன் மற்றும் குரு மித்திரர்கள்)
                    <br />ஆகிய ராசிகளுக்கு சஷ்டாஷ்டக தோஷம் முற்றிலும் ரத்தாகிறது.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#fbbf24', fontSize: '1.05rem', margin: '0 0 .5rem' }}>3. ஏக நட்சத்திர சுப விதி (Same Star Marriage Rules)</h3>
                  <p style={{ margin: 0 }}>
                    ரோகிணி, திருவாதிரை, மகம், அஸ்தம், திருவோணம், சதயம், உத்திரட்டாதி, ரேவதி, அஸ்வினி, கார்த்திகை, பூசம், பூராடம் ஆகிய 12 நட்சத்திரங்களில் இருவருக்கும் ஒரே நட்சத்திரமாக அமைந்தாலும் <strong>பாத பேதம் (வெவ்வேறு பாதங்கள்) இருந்தால் திருமணம் செய்யலாம்.</strong>
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#a78bfa', fontSize: '1.05rem', margin: '0 0 .5rem' }}>4. ராகு - கேது / சர்ப்ப தோஷம்</h3>
                  <p style={{ margin: 0 }}>
                    1, 2, 7, 8-ஆம் இடங்களில் ராகு அல்லது கேது அமைந்தால் இருவருக்கும் அதே அமைப்பில் சர்ப்ப தோஷம் இருக்கும் வரனை இணைப்பதே உத்தமம்.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="rp-card">
              <h2 style={{ fontSize: '1.3rem', color: '#fbbf24', marginTop: 0, marginBottom: '1.25rem' }}>
                📖 12 பொருத்தங்களின் முழுமையான சாஸ்திர விளக்கம்
              </h2>

              {[
                { name: '1. தினப் பொருத்தம் (Dhinam)', desc: 'தம்பதியரின் நீண்ட ஆயுள், ஆரோக்கியம் மற்றும் அன்றாட வாழ்க்கையின் நிம்மதியைக் குறிக்கிறது.' },
                { name: '2. கணப் பொருத்தம் (Ganam)', desc: 'தேவ, மனுஷ, ராட்சச கணங்கள் மூலம் இருவரின் குணம் மற்றும் மன ஒற்றுமை கணிக்கப்படுகிறது.' },
                { name: '3. மகேந்திரப் பொருத்தம் (Mahendram)', desc: 'சந்ததி விருத்தி, புத்திர பாக்கியம் மற்றும் வம்சத்தை தழைக்கச் செய்யும் சக்தியைக் குறிக்கிறது.' },
                { name: '4. ஸ்திரீ தீர்க்கம் (Stree Dheergam)', desc: 'மணப்பெண்ணுக்கு தீர்க்க சுமங்கலி யோகம், ஆயுள் பலம் மற்றும் குடும்ப செல்வ வளம் தரும் பொருத்தம்.' },
                { name: '5. யோனிப் பொருத்தம் (Yoni)', desc: 'தாம்பத்திய இணக்கம், உடல் ரீதியான ஈர்ப்பு மற்றும் உடலமைப்பு பொருத்தத்தைக் குறிக்கிறது.' },
                { name: '6. ராசிப் பொருத்தம் (Rasi)', desc: 'வம்ச விருத்தி, குடும்ப மேன்மை மற்றும் பரஸ்பர ஒத்துழைப்பைக் குறிக்கிறது. 6/8 சஷ்டாஷ்டகம் தணிக்கை விதிகளுடன் கணிக்கப்படுகிறது.' },
                { name: '7. ராசியதிபதி பொருத்தம் (Rasiyathipathi)', desc: 'ராசி அதிபதிகளுக்கு இடையேயான நட்பு, பாசம் மற்றும் பரஸ்பர அன்பைக் குறிக்கிறது.' },
                { name: '8. வசியப் பொருத்தம் (Vasiyam)', desc: 'தம்பதியரிடையே வாழ்நாள் முழுவதும் நீடிக்கும் வசீகரமும் மன ஈர்ப்பும் தரும் பொருத்தம்.' },
                { name: '9. ரஜ்ஜுப் பொருத்தம் (Rajju - மிக முக்கியமானது ⭐)', desc: 'மாங்கல்ய பலத்தைக் குறிக்கும் முதன்மையான பொருத்தம். இருவருக்கும் ஒரே ரஜ்ஜு அமையக் கூடாது (ரஜ்ஜு தட்டு).' },
                { name: '10. வேதைப் பொருத்தம் (Vedhai)', desc: 'வேதை என்பது துன்பம் அல்லது பகை. வேதை இல்லாத நட்சத்திர சேர்க்கை தம்பதியருக்கு எந்தவித இடரும் இல்லாமல் காக்கும்.' },
                { name: '11. நாடிப் பொருத்தம் (Nadi)', desc: 'பார்சுவ, மத்திய, அந்திய நாடிகள் மூலம் தம்பதியரின் மரபணு ஒற்றுமை மற்றும் ஆரோக்கியமான வாரிசு நலம் கணிக்கப்படுகிறது.' },
                { name: '12. விருட்சப் பொருத்தம் (Vriksha)', desc: 'பால் மரம் மற்றும் மரங்களின் இணக்கம் மூலம் இல்லறத்தின் பொருளாதார மேன்மை மற்றும் செழிப்பு கணிக்கப்படுகிறது.' },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: '.98rem', marginBottom: '.25rem' }}>{r.name}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '.9rem', lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'kulam_rules' && (
            <div className="rp-card">
              <h2 style={{ fontSize: '1.3rem', color: '#fbbf24', marginTop: 0, marginBottom: '1.25rem' }}>
                🏛️ உப்பிலிய நாயக்கர் குல திருமண வழிகாட்டி
              </h2>
              <div style={{ color: '#e2e8f0', lineHeight: 1.8, fontSize: '.95rem' }}>
                <p style={{ marginBottom: '1rem' }}>
                  உப்பிலிய நாயக்கர் சமூகத்தில் குலதெய்வ வழிபாடு மற்றும் குல உறவுமுறைகள் மிகவும் புனிதமாகக் கடைப்பிடிக்கப்படுகின்றன.
                </p>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>
                  <li style={{ marginBottom: '.5rem' }}>
                    <strong>பங்காளிகள்:</strong> ஒரே குலதெய்வத்தை வழிபடும் குலத்தினர் அல்லது ரத்த சம்பந்தமுள்ள குலத்தினர் பங்காளிகள் ஆவர். பங்காளிகளுக்குள் பெண் எடுக்கவோ, கொடுக்கவோ கூடாது.
                  </li>
                  <li style={{ marginBottom: '.5rem' }}>
                    <strong>மாமன் மச்சான் உறவு:</strong> பெண் எடுக்கவும் கொடுக்கவும் அனுமதிக்கப்பட்ட குலங்கள் மாமன்-மைத்துனன் குலங்கள் எனப்படும்.
                  </li>
                  <li style={{ marginBottom: '.5rem' }}>
                    <strong>குலதெய்வக் கோவில் ஆசி:</strong> திருமணத்திற்கு முன் இரு வீட்டாரும் தங்களின் குலதெய்வக் கோவிலுக்குச் சென்று அனுமதி பெற்று வழிபாடு நடத்துவது மரபு.
                  </li>
                </ul>
                <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', borderRadius: '.75rem', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <p style={{ margin: 0, color: '#fbbf24', fontWeight: 600 }}>
                    💡 உங்கள் குலத்தின் பங்காளிகள் மற்றும் குலதெய்வம் பற்றிய தகவல்களை முகப்பு பக்கத்தில் உள்ள குலங்கள் தேடலில் (Kulam Search) எளிதாகக் கண்டறியலாம்.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
