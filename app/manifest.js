export default function manifest() {
  return {
    name: 'உப்பிலியர் களம் | Uppiliyar Kalam',
    short_name: 'உப்பிலியர் களம்',
    description: 'உப்பிலியர் களம் — உப்பிலிய நாயக்கர் சமூகத்தின் 64 குலங்கள், குலதெய்வக் கோவில்கள், வரலாறு, சிந்தனைகள், ராசி பொருத்தம் மற்றும் ஓரை கணிப்பான்.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/images/uppliakulam.png',
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/images/uppliya_2.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'ராசி பொருத்தம்',
        short_name: 'ராசி பொருத்தம்',
        description: 'திருமண ராசி பொருத்தம் கணிப்பான்',
        url: '/rasi-porutham',
        icons: [{ src: '/images/uppliakulam.png', sizes: '96x96' }],
      },
      {
        name: 'ஓரை கணிப்பான்',
        short_name: 'ஓரை',
        description: 'இன்றைய நல்ல நேரம் மற்றும் கிரக ஓரை',
        url: '/horai',
        icons: [{ src: '/images/uppliakulam.png', sizes: '96x96' }],
      },
      {
        name: 'தினசரி ஜோதிடம்',
        short_name: 'ஜோதிடம்',
        description: '12 ராசிகளுக்கான தினசரி ராசிபலன்',
        url: '/jothidam',
        icons: [{ src: '/images/uppliakulam.png', sizes: '96x96' }],
      },
      {
        name: 'வரலாறு & மரபு',
        short_name: 'வரலாறு',
        description: 'சமூக மரபு மற்றும் வரலாற்றுப் பின்னணி',
        url: '/history',
        icons: [{ src: '/images/uppliakulam.png', sizes: '96x96' }],
      },
    ],
    categories: ['community', 'culture', 'lifestyle', 'utilities'],
    lang: 'ta',
    dir: 'ltr',
  };
}
