import Image from 'next/image';
import communityLogo from '../../images/uppliakulam.png';

export const metadata = {
  title: 'History | Uppiliya Naicker Community',
  description: 'History and Background of the Uppiliya Naicker Community',
};

export default function HistoryPage() {
  return (
    <>
      <style>{`
        .hist-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3.5vw, 2rem);
        }
        .hist-hero {
          text-align: center;
          margin-bottom: clamp(1.75rem, 4vw, 3rem);
          animation: fadeInDown 0.8s ease-out;
        }
        .hist-logo-box {
          max-width: 480px;
          width: 100%;
          margin: 0 auto 1.5rem;
          border-radius: 1.5rem;
          overflow: hidden;
          border: 2px solid rgba(245,158,11,0.4);
          box-shadow: 0 12px 40px rgba(245,158,11,0.2);
          background: rgba(15,23,42,0.6);
          padding: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
        }
        .hist-h1 {
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #f59e0b 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hist-subtitle {
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          color: var(--text-muted, #94a3b8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .hist-panel {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.25rem;
          padding: clamp(1.25rem, 3.5vw, 2.25rem);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
          backdrop-filter: blur(16px);
          line-height: 1.8;
          font-size: clamp(0.95rem, 2vw, 1.05rem);
        }
        .hist-sec-title {
          color: #f59e0b;
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(245,158,11,0.25);
          padding-bottom: 0.5rem;
          font-weight: 700;
        }
        .hist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: clamp(1.25rem, 3vw, 2rem);
          align-items: center;
          margin-bottom: 2rem;
        }
        .hist-img-card {
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1px solid rgba(245,158,11,0.3);
          box-shadow: 0 12px 36px rgba(0,0,0,0.4);
          background: rgba(15,23,42,0.6);
          text-align: center;
          padding: 0.5rem;
        }
        .hist-list {
          padding-left: 1.25rem;
          margin-bottom: 1.5rem;
          color: var(--text-light, #e2e8f0);
        }
        .hist-list li {
          margin-bottom: 0.75rem;
        }
      `}</style>

      <main className="hist-container">
        <div className="hist-hero">
          <div className="hist-logo-box">
            <Image
              src={communityLogo}
              alt="Uppiliya Naicker Community Emblem"
              style={{ width: '100%', height: 'auto', maxHeight: '340px', objectFit: 'contain', borderRadius: '1rem' }}
              priority
            />
          </div>
          <h1 className="hist-h1">வரலாறு (History)</h1>
          <p className="hist-subtitle">History and background of the Uppiliya Naicker Community</p>
        </div>

        <div className="hist-panel">
          <p style={{ marginBottom: '1.25rem' }}>
            உப்பிலிய நாயக்கர் (அல்லது உப்பிலியர்) என்பவர்கள் தமிழகத்தில் கொங்கு மண்டலம் மற்றும் பல்வேறு மாவட்டங்களில் பரவலாக வாழ்ந்து வரும் ஒரு முதன்மையான வரலாற்றுப் பின்னணி கொண்ட சமூகத்தினர் ஆவர்.
          </p>
          <p style={{ marginBottom: '1.75rem' }}>
            இவர்களின் வரலாறு, குல அமைப்பு மற்றும் சிறப்புகள் பற்றிய விரிவான தகவல்கள் கீழே தொகுக்கப்பட்டுள்ளன.
          </p>

          <h2 className="hist-sec-title">1. பெயர்க் காரணம் மற்றும் பாரம்பரிய தொழில்</h2>
          
          <div className="hist-grid">
            <div>
              <ul className="hist-list">
                <li><strong>மண்-உப்பு உற்பத்தி:</strong> இவர்களின் பாரம்பரியத் தொழில் பெயருக்கு ஏற்றாற்போல் நிலத்தில் இருந்து மண்-உப்பு (சுதேசி உப்பு) தயாரிப்பதாகும்.</li>
                <li><strong>கட்டுமானப் பணிகள்:</strong> உப்பு உற்பத்தி மட்டுமின்றி, ஆரம்பக் காலத்தில் இவர்கள் கிணறுகள் தோண்டுதல், ஏரி/கால்வாய் வெட்டுதல், செங்கல் சூளை அமைத்தல், கோட்டைகள் மற்றும் வீடுகள் கட்டுதல் போன்ற உன்னதமான மண் சார்ந்த கட்டுமானப் பணிகளிலும் மிகச் சிறப்பாக ஈடுபட்டுள்ளனர்.</li>
              </ul>
            </div>

            <div className="hist-img-card">
              <Image
                src="/images/uppliya_2.png"
                alt="Uppiliya Naicker Etymology & Historical Profession Infographic"
                width={800}
                height={1200}
                style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain', borderRadius: '0.85rem' }}
              />
              <p style={{ margin: '0.5rem 0 0.2rem', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                📌 வரலாற்றுப் பின்னணி (Historical Infographic)
              </p>
            </div>
          </div>

          <h2 className="hist-sec-title">2. தோற்றமும் இடப்பெயர்வும்</h2>
          <ul className="hist-list">
            <li><strong>மொழி:</strong> தமிழகத்தில் வாழும் உப்பிலிய நாயக்கர் சமூக மக்களின் தாய்மொழி தமிழ் மொழி ஆகும்.</li>
            <li><strong>இடப்பெயர்வு:</strong> வரலாற்று ஆய்வுகளின்படி, உப்பிலியர்கள், உப்பரர்கள் மற்றும் உப்பரவர்கள் ஆகிய சமூகத்தினர் ஆதியில் ஒரே பிரிவைச் சேர்ந்தவர்களாக இருந்து, காலப்போக்கில் நாட்டின் பல்வேறு பகுதிகளுக்கு இடம்பெயர்ந்து தாங்கள் குடியேறிய பகுதிகளின் உள்ளூர் மொழியை (தமிழ், தெலுங்கு, கன்னடம்) ஏற்றுக்கொண்டதாகக் கருதப்படுகிறது.</li>
            <li>தமிழக அரசின் இடஒதுக்கீட்டுப் பட்டியலில் இவர்கள் பிற்படுத்தப்பட்ட வகுப்பினர் (BC) பிரிவில் வகைப்படுத்தப்பட்டுள்ளனர்.</li>
          </ul>

          <h2 className="hist-sec-title">3. குலதெய்வம் மற்றும் பட்டக்காரர்கள் அமைப்பு</h2>
          <p style={{ marginBottom: '1rem' }}>
            உப்பிலிய நாயக்கர் சமூக மக்கள் தங்களுக்குள் மாமன், பங்காளி போன்ற மிகக் கடுமையான உறவுமுறைகளையும், பாரம்பரியக் குல அமைப்புகளையும் பின்பற்றி வருகின்றனர்.
          </p>
          <ul className="hist-list">
            <li><strong>தலைமைக் குலதெய்வம்:</strong> இச்சமூகத்தின் ஆதி முதன்மைக் குலதெய்வமாக ஈரோடு மாவட்டம், சத்தியமங்கலம் வட்டம், பவானிசாகர் வனச்சரகப் பகுதியில் அமைந்துள்ள அருள்மிகு ஆதி கருவண்ணராயர் - பொம்மதேவர் - வீரசுந்தரி தாயார் திருக்கோவில் விளங்குகிறது.</li>
            <li><strong>வட்டாரப் பட்டக்காரர்கள்:</strong> சமூகக் கட்டுப்பாட்டையும், வழிபாடுகளையும் வழிநடத்த இவர்களுக்குள் பாரம்பரிய 'பட்டக்காரர்கள்' (தலைவர்கள்) முறை உள்ளது. அவற்றில் முக்கியமான சில பட்டங்கள்:
              <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>சிறுக்களஞ்சி பட்டம்</li>
                <li>அரியபட்டம் (ஏலூரார்)</li>
                <li>பீடம்பள்ளி பட்டம்</li>
                <li>முடிகொண்ட பட்டம்</li>
                <li>நிழலி பட்டம்</li>
              </ol>
            </li>
          </ul>

          <h2 className="hist-sec-title">4. இந்திய சுதந்திரப் போராட்டத்தில் பங்களிப்பு</h2>
          <p style={{ marginBottom: '1rem' }}>இந்திய விடுதலை வரலாற்றில் உப்பிலிய நாயக்கர் சமூகத்தைச் சேர்ந்த தியாகிகள் ஆற்றிய பங்கு அளப்பரியது.</p>
          <ul className="hist-list">
            <li><strong>உப்புச் சத்தியாகிரகம்:</strong> பிரிட்டிஷ் ஆட்சிக்கு எதிராக கோயம்புத்தூர் வாலாங்குளத்தில் நடைபெற்ற வரலாற்றுச் சிறப்புமிக்க உப்புச் சத்தியாகிரகப் போராட்டத்தில் இச்சமூக மக்கள் பெருந்திரளாகப் பங்கேற்று முன்னின்று நடத்தினர்.</li>
            <li><strong>பூளவாடி தியாகிகள்:</strong> உடுமலைப்பேட்டை அருகே உள்ள பூளவாடி பகுதியில் இச்சமூகத்தைச் சேர்ந்த சுமார் 14 சுதந்திரப் போராட்ட தியாகிகளின் நினைவாக அங்குள்ள பள்ளி வளாகத்தில் நினைவுச்சின்னம் அமைக்கப்பட்டு அவர்களின் பெயர்கள் பொறிக்கப்பட்டுள்ளன. இவர்களில் தியாகி உடுமலை குமார நாயக்கர் மிக முக்கியமானவர் ஆவார்.</li>
          </ul>

          <h2 className="hist-sec-title">5. தற்போதைய சமூக நிலை</h2>
          <p style={{ marginBottom: '1rem' }}>
            இன்று இச்சமூகத்தினர் விவசாயம், ஜவுளித் தொழில் (குறிப்பாக திருப்பூர், கோவை, ஈரோடு மாவட்டங்களில்), வணிகம் மற்றும் அரசுப் பணிகளில் நல்ல நிலையை எட்டியுள்ளனர். சமூக மக்களின் கல்வி மற்றும் வாழ்வாதார முன்னேற்றத்திற்காக <a href="https://uppiliyanaicker.com/about.php" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b', fontWeight: 600 }}>உப்பிலிய நாயக்கர் மேம்பாட்டு அறக்கட்டளை (Uppiliya Naicker Community Trust)</a> போன்ற அமைப்புகள் தோற்றுவிக்கப்பட்டு பல்வேறு நலத்திட்ட உதவிகளைச் செய்து வருகின்றன.
          </p>

          <h3 style={{ fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '0.85rem', color: '#cbd5e1' }}>பார்வை நூல்கள் (References):</h3>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', wordBreak: 'break-all' }}>
            <li style={{ marginBottom: '0.4rem' }}><a href="https://ta.wikipedia.org/wiki/%E0%AE%89%E0%AE%AA%E0%AF%8D%E0%AE%AA%E0%AE%BF%E0%AE%B2%E0%AE%BF%E0%AE%AF%E0%AE%B0%E0%AF%8D" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted, #94a3b8)' }}>ta.wikipedia.org</a></li>
            <li style={{ marginBottom: '0.4rem' }}><a href="https://translate.google.com/translate?u=https://ijeks.com/wp-content/uploads/2025/10/ijeks-04-08-004.pdf&hl=ta&sl=en&tl=ta&client=sge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted, #94a3b8)' }}>ijeks.com (Journal PDF)</a></li>
            <li style={{ marginBottom: '0.4rem' }}><a href="https://uppiliyanaicker.com/about.php" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted, #94a3b8)' }}>uppiliyanaicker.com</a></li>
            <li style={{ marginBottom: '0.4rem' }}><a href="https://www.facebook.com/groups/780524798816166/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted, #94a3b8)' }}>Facebook Community Group</a></li>
          </ol>
        </div>
      </main>
    </>
  );
}
