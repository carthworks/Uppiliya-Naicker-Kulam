import Image from 'next/image';
import communityLogo from '../../images/uppliakulam.png';
import ThoughtComments from '../components/ThoughtComments';

export const metadata = {
  title: 'Thought & Vision | சிந்தனைகள் | Uppiliya Naicker Community',
  description: 'History, Work Ethics, and Future Roadmap of the Uppiliya Naicker Community',
};

export default function ThoughtPage() {
  return (
    <>
      <style>{`
        .th-container {
          max-width: 960px;
          margin: 0 auto;
          padding: clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3.5vw, 1.75rem);
        }
        .th-hero {
          text-align: center;
          margin-bottom: clamp(1.75rem, 4vw, 3rem);
          animation: fadeInDown 0.8s ease-out;
        }
        .th-logo-box {
          max-width: 440px;
          width: 100%;
          margin: 0 auto 1.25rem;
          border-radius: 1.5rem;
          overflow: hidden;
          border: 2px solid rgba(245,158,11,0.4);
          box-shadow: 0 12px 40px rgba(245,158,11,0.25);
          background: rgba(15,23,42,0.6);
          padding: 0.65rem;
          backdrop-filter: blur(12px);
        }
        .th-badge {
          display: inline-block;
          padding: 0.35rem 0.95rem;
          border-radius: 9999px;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.3);
          color: #f59e0b;
          font-size: clamp(0.78rem, 2vw, 0.88rem);
          font-weight: 700;
          margin-bottom: 0.85rem;
        }
        .th-h1 {
          font-size: clamp(1.65rem, 4.5vw, 2.5rem);
          font-weight: 800;
          line-height: 1.25;
          background: linear-gradient(135deg, #ffffff 0%, #f59e0b 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.85rem;
        }
        .th-subtitle {
          font-size: clamp(0.95rem, 2.5vw, 1.15rem);
          color: #cbd5e1;
          max-width: 720px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .th-panel {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.25rem;
          padding: clamp(1.25rem, 3.5vw, 2.25rem);
          margin-bottom: 2rem;
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
          backdrop-filter: blur(16px);
          line-height: 1.8;
        }
        .th-sec-head {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .th-sec-title {
          font-size: clamp(1.25rem, 3.5vw, 1.6rem);
          color: #f59e0b;
          margin: 0;
          font-weight: 700;
        }
        .th-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: clamp(1.25rem, 3vw, 2rem);
          align-items: flex-start;
        }
        .th-img-box {
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1px solid rgba(245,158,11,0.3);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
          background: rgba(15,23,42,0.6);
          text-align: center;
          padding: 0.5rem;
        }
        .th-prof-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
          gap: 0.65rem;
          margin-bottom: 1.25rem;
        }
        .th-prof-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.6rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .th-pillar-card {
          background: rgba(15, 23, 42, 0.75);
          border-radius: 1.25rem;
          padding: clamp(1.25rem, 3vw, 1.75rem);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          backdrop-filter: blur(12px);
          border: 1px solid;
          margin-bottom: 1.25rem;
        }
        .th-pillar-inner {
          display: flex;
          align-items: flex-start;
          gap: clamp(0.75rem, 2.5vw, 1rem);
        }
        .th-pillar-num {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .th-pillar-title {
          font-size: clamp(1.1rem, 2.8vw, 1.35rem);
          margin-top: 0;
          margin-bottom: 0.65rem;
          font-weight: 700;
        }
        .th-quote-box {
          background: rgba(245,158,11,0.08);
          border-left: 4px solid #f59e0b;
          padding: 0.85rem 1.1rem;
          border-radius: 0 0.85rem 0.85rem 0;
          margin: 1.25rem 0;
          font-size: clamp(0.88rem, 2vw, 0.98rem);
          color: #fef3c7;
        }
        .th-vision-box {
          background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(147,51,234,0.15) 100%);
          border: 2px solid rgba(245,158,11,0.4);
          border-radius: 1.5rem;
          padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3.5vw, 1.75rem);
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          margin-bottom: 2.5rem;
        }
      `}</style>

      <main className="th-container">
        {/* Header Banner */}
        <div className="th-hero">
          <div className="th-logo-box">
            <Image
              src={communityLogo}
              alt="Uppiliya Naicker Community Emblem"
              style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain', borderRadius: '1rem' }}
              priority
            />
          </div>
          
          <div className="th-badge">
            ✨ சமூகச் சிந்தனை &amp; எதிர்காலப் பாதை
          </div>

          <h1 className="th-h1">
            உப்பிலிய நாயக்கர் குலத்தின் பயணம் &amp; சிந்தனைகள்
          </h1>
          <p className="th-subtitle">
            உழைப்போடும், திறமையோடும் பின்னிப் பிணைந்த ஒரு நீண்ட வரலாற்றுப் பயணமும்... எதிர்காலத்தை கட்டியெழுப்பும் தொலைநோக்குப் பார்வையும்!
          </p>
        </div>

        {/* Part 1: History & Adaptation */}
        <section className="th-panel">
          <div className="th-sec-head">
            <span style={{ fontSize: '1.8rem' }}>📜</span>
            <h2 className="th-sec-title">
              வரலாற்றில் வேரூன்றிய உழைப்பு
            </h2>
          </div>

          <div className="th-grid">
            {/* Left Column Text */}
            <div>
              <p style={{ fontSize: '1.02rem', color: '#e2e8f0', marginBottom: '1rem' }}>
                &ldquo;உப்பு&rdquo; என்ற சொல்லுடன் தொடர்புடைய பெயரைக் கொண்ட இந்த சமூகத்தின் பாரம்பரிய வாழ்வாதாரங்களில், <strong>மண் உப்பு மற்றும் உப்புக்காரம் எனப்படும் Saltpetre தயாரிப்பும்</strong> முக்கியமானதாக இருந்ததாக வரலாற்றுக் குறிப்புகள் தெரிவிக்கின்றன.
              </p>

              <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                அந்த காலத்தில் உப்பு என்பது ஒரு சாதாரண பொருள் அல்ல. மக்களின் அன்றாட வாழ்வுக்கும், அக்கால நிர்வாகங்களின் தேவைகளுக்கும் அது மிகவும் முக்கியமான வளமாக இருந்தது.
              </p>

              <div className="th-quote-box">
                <p style={{ margin: 0, fontStyle: 'italic' }}>
                  &ldquo;காலப்போக்கில், குறிப்பாக ஆங்கிலேயர் ஆட்சியில் மண் உப்பு தயாரிப்புக்கு கட்டுப்பாடுகள் விதிக்கப்பட்டபோது, சமூகத்தின் பாரம்பரியத் தொழில் ஒரு புதிய திருப்பத்தை சந்தித்தது. <strong>அந்த மாற்றம் அவர்களின் பயணத்தை நிறுத்தவில்லை… மாறாக, புதிய திறமைகளுக்கு வழி வகுத்தது.</strong>&rdquo;
                </p>
              </div>

              <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', marginTop: '1.25rem', marginBottom: '0.85rem' }}>
                🛠️ மண்ணோடும், நீரோடும், கல்லோடும் இணைந்த தொழில்கள்:
              </h3>

              <div className="th-prof-grid">
                {[
                  { icon: '🏗️', title: 'கட்டுமானப் பணிகள்' },
                  { icon: '🧱', title: 'கொத்தனார் பணி' },
                  { icon: '⛏️', title: 'கல் செதுக்குதல்' },
                  { icon: '🌊', title: 'குளம் & ஏரி வெட்டுதல்' },
                  { icon: '🌾', title: 'விவசாயம்' },
                  { icon: '📜', title: 'ஒப்பந்தப் பணிகள்' }
                ].map((item, idx) => (
                  <div key={idx} className="th-prof-item">
                    <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                    <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.85rem' }}>{item.title}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '1rem', color: '#e2e8f0', margin: 0 }}>
                இவ்வாறு, பல்வேறு தொழில்களில் தங்கள் திறமையை வெளிப்படுத்தினர். <strong>உப்பிலிய நாயக்கர் குலத்தின் வரலாறு என்பது ஒரு தொழிலின் வரலாறு மட்டுமல்ல.</strong> மாற்றத்தை எதிர்கொண்டு, தங்கள் உழைப்பையும் திறமையையும் புதிய தலைமுறைகளுக்கு எடுத்துச் சென்ற ஒரு சமூகத்தின் வரலாறு.
              </p>
            </div>

            {/* Right Column: Infographic Image */}
            <div className="th-img-box">
              <Image
                src="/images/uppliya_2.png"
                alt="Uppiliya Naicker Etymology & Historical Profession Infographic"
                width={800}
                height={1200}
                style={{ width: '100%', height: 'auto', maxHeight: '540px', objectFit: 'contain', borderRadius: '0.85rem' }}
              />
              <p style={{ margin: '0.5rem 0 0.2rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                📌 உப்பிலிய நாயக்கர் குலத் தோற்றமும் தொழில்துறை மாற்றமும்
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1.1rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(96,165,250,0.1) 0%, rgba(192,132,252,0.1) 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(96,165,250,0.2)'
          }}>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#38bdf8' }}>
              உப்பிலிருந்து கட்டுமானம் வரை… மண்ணிலிருந்து மக்களின் வாழ்க்கை வரை…<br />
              <span style={{ color: '#f59e0b' }}>உழைப்பே அடையாளம். பாரம்பரியமே பெருமை.</span>
            </p>
          </div>
        </section>

        {/* Part 2: Future Vision Title */}
        <div style={{ textAlign: 'center', margin: '2.5rem 0 1.5rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '0.5rem'
          }}>
            🚀 எதிர்காலத்தை நோக்கிய 5 லட்சியங்கள்
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            நம்முடைய வரலாறு கடந்த காலத்தைப் பற்றி பேசுவதற்காக மட்டுமல்ல… எதிர்காலத்தை உருவாக்குவதற்காக!
          </p>
        </div>

        {/* 5 Pillars Cards */}
        <div style={{ marginBottom: '2.5rem' }}>
          
          {/* Pillar 1 */}
          <div className="th-pillar-card" style={{ borderColor: 'rgba(245,158,11,0.35)' }}>
            <div className="th-pillar-inner">
              <div className="th-pillar-num" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>1</div>
              <div style={{ flex: 1 }}>
                <h3 className="th-pillar-title" style={{ color: '#f59e0b' }}>
                  முதலாவது — ஒருவரின் வெற்றி, பலரின் வெற்றியாக வேண்டும்
                </h3>
                <p style={{ color: '#e2e8f0', lineHeight: '1.7', margin: 0, fontSize: '0.98rem' }}>
                  கட்டுமானம், இன்ஜினியரிங், தொழில் மற்றும் வணிகத்தில் முன்னேறியவர்கள், அடுத்த தலைமுறை இளைஞர்களுக்கு வேலை மட்டும் கொடுக்காமல், தொழிலை கற்றுக்கொடுக்க வேண்டும்.
                </p>
                <ul style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                  gap: '0.4rem 0.85rem', marginTop: '0.85rem', paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.9rem'
                }}>
                  <li>மெட்டீரியல் வாங்குவது எப்படி?</li>
                  <li>பட்ஜெட் போடுவது எப்படி?</li>
                  <li>வாடிக்கையாளர்களை அணுகுவது?</li>
                  <li>டெண்டர் எடுப்பது எப்படி?</li>
                  <li>நிறுவனத்தை நடத்துவது எப்படி?</li>
                </ul>
                <p style={{ color: '#38bdf8', fontWeight: '700', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.92rem' }}>
                  💡 ஒரு தொழிலாளியாக மட்டுமல்ல… ஒரு தொழில்முனைவோராக உருவாக்க வேண்டும்.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="th-pillar-card" style={{ borderColor: 'rgba(59,130,246,0.35)' }}>
            <div className="th-pillar-inner">
              <div className="th-pillar-num" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>2</div>
              <div style={{ flex: 1 }}>
                <h3 className="th-pillar-title" style={{ color: '#60a5fa' }}>
                  இரண்டாவது — நம்முடைய சொந்த சமூக நிதியை உருவாக்க வேண்டும்
                </h3>
                <p style={{ color: '#e2e8f0', lineHeight: '1.7', margin: 0, fontSize: '0.98rem' }}>
                  சிறு சேமிப்புகள் ஒன்றாக சேர்ந்தால், அது பெரிய சக்தியாக மாறும். ஒரு ஒழுங்கான தொழில் மற்றும் சமூக நிதியை உருவாக்கி, தகுதியும் திட்டமும் உள்ள இளைஞர்கள் புதிய தொழில் தொடங்குவதற்கு வெளிப்படையான முறையில் நிதி உதவி வழங்கலாம்.
                </p>
                <p style={{ color: '#93c5fd', fontWeight: '700', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.92rem' }}>
                  🌱 சிறு பங்களிப்புகள்… பெரிய வாய்ப்புகளாக மாற வேண்டும்.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="th-pillar-card" style={{ borderColor: 'rgba(168,85,247,0.35)' }}>
            <div className="th-pillar-inner">
              <div className="th-pillar-num" style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>3</div>
              <div style={{ flex: 1 }}>
                <h3 className="th-pillar-title" style={{ color: '#c084fc' }}>
                  மூன்றாவது — கல்வியை மிகப்பெரிய முதலீடாக பார்க்க வேண்டும்
                </h3>
                <p style={{ color: '#e2e8f0', lineHeight: '1.7', margin: 0, fontSize: '0.98rem' }}>
                  இன்ஜினியரிங், மருத்துவம், சட்டம், தகவல் தொழில்நுட்பம், அரசு பணிகள், ஆராய்ச்சி, தொழில்முனைவு… நம்முடைய குழந்தைகள் எந்தத் துறையிலும் முன்னேறுவதற்கான வாய்ப்பை உருவாக்க வேண்டும்.
                </p>
                <p style={{ color: '#e9d5ff', fontWeight: '700', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.92rem' }}>
                  🎓 ஒரு தலைமுறைக்கு நாம் கொடுக்கும் மிகப்பெரிய சொத்து — கல்வி.
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="th-pillar-card" style={{ borderColor: 'rgba(34,197,94,0.35)' }}>
            <div className="th-pillar-inner">
              <div className="th-pillar-num" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}>4</div>
              <div style={{ flex: 1 }}>
                <h3 className="th-pillar-title" style={{ color: '#4ade80' }}>
                  நான்காவது — உழைப்பு, எளிமை, மறுமுதலீடு
                </h3>
                <p style={{ color: '#e2e8f0', lineHeight: '1.7', margin: 0, fontSize: '0.98rem' }}>
                  தொழில் ஆரம்பிக்கும் போது கிடைக்கும் முதல் வருமானத்தை முழுவதும் ஆடம்பரத்திற்காக செலவிடாமல், தொழிலை வளர்ப்பதற்கும், புதிய வாய்ப்புகளை உருவாக்குவதற்கும் மீண்டும் முதலீடு செய்ய வேண்டும்.
                </p>
                <p style={{ color: '#86efac', fontWeight: '700', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.92rem' }}>
                  🏢 இன்று ஒரு சிறிய தொழில்… நாளை ஒரு பெரிய நிறுவனம்!
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="th-pillar-card" style={{ borderColor: 'rgba(236,72,153,0.35)' }}>
            <div className="th-pillar-inner">
              <div className="th-pillar-num" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>5</div>
              <div style={{ flex: 1 }}>
                <h3 className="th-pillar-title" style={{ color: '#f472b6' }}>
                  ஐந்தாவது — ஒற்றுமையும் சமூகப் பொறுப்பும்
                </h3>
                <p style={{ color: '#e2e8f0', lineHeight: '1.7', margin: 0, fontSize: '0.98rem' }}>
                  நம்முடைய முன்னேற்றம் நம்மோடு மட்டும் நின்றுவிடக் கூடாது. ரத்ததான முகாம், மருத்துவ உதவி, கல்வி உதவி, பேரிடர் கால சேவை, சுற்றுச்சூழல் பாதுகாப்பு போன்ற பொதுநலப் பணிகளில் நாம் முன்னிலை வகிக்க வேண்டும்.
                </p>
                <p style={{ color: '#fbcfe8', fontWeight: '700', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.92rem' }}>
                  🤝 நாம் வாழும் ஊரையும் உயர்த்துவதுதான் உண்மையான முன்னேற்றம்.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Summary Vision Box */}
        <div className="th-vision-box">
          <h3 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', color: '#fbbf24', marginTop: 0, marginBottom: '1rem' }}>
            🌟 தலைமுறை தாண்டும் எதிர்காலப் பாதை
          </h3>
          <p style={{ fontSize: '1.05rem', color: '#e2e8f0', lineHeight: '1.8', maxWidth: '720px', margin: '0 auto 1.25rem' }}>
            நம்முடைய முன்னோர்கள் மண்ணைத் தோண்டி நீரை உருவாக்கினார்கள். கற்களை செதுக்கி கட்டிடங்களை உருவாக்கினார்கள். உழைப்பால் தங்கள் வாழ்க்கையை உருவாக்கினார்கள்.
          </p>
          <p style={{ fontSize: '1.08rem', fontWeight: '700', color: '#38bdf8', lineHeight: '1.8', margin: '0 0 1.25rem' }}>
            இன்று நம்முடைய தலைமுறை அறிவை உருவாக்க வேண்டும்.<br />
            தொழிலை உருவாக்க வேண்டும். கல்வி வாய்ப்புகளை உருவாக்க வேண்டும்.<br />
            அடுத்த தலைமுறைக்கான பாதையை உருவாக்க வேண்டும்.
          </p>

          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem', margin: '1.25rem 0'
          }}>
            {['கூட்டு உழைப்பு', 'சொந்த நிதி வலிமை', 'உயர்கல்வி', 'தொழில்முனைவு', 'ஒற்றுமை', 'சமூகப் பொறுப்பு'].map((badge, idx) => (
              <span key={idx} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '9999px',
                padding: '0.35rem 0.85rem',
                color: '#f8fafc',
                fontSize: '0.88rem',
                fontWeight: '600'
              }}>
                ✨ {badge}
              </span>
            ))}
          </div>

          <p style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)', fontWeight: '800', color: '#f59e0b', marginTop: '1.25rem', marginBottom: 0 }}>
            உப்பிலிய நாயக்கர் குலம் — வரலாற்றில் வேரூன்றி… முன்னேற்றத்தை நோக்கி பயணிக்கும் ஒரு தலைமுறை!
          </p>
        </div>

        {/* Facebook-style Community Comments & Discussion */}
        <ThoughtComments />

      </main>
    </>
  );
}
