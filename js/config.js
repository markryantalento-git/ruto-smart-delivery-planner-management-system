/* ============ SETTINGS: ito lang ang file na kailangan mong i-edit ============ */
window.RUTO = {
  // Firebase Console > Project settings > Your apps
  FIREBASE: {
    apiKey: 'AIzaSyDrQ3UJJ9X4UJn_dFYnZaRQCOXlBwC_7SU', authDomain: 'ruto-6b418.firebaseapp.com',
    projectId: 'ruto-6b418', storageBucket: 'ruto-6b418.firebasestorage.app',
    messagingSenderId: '581496990651', appId: '1:581496990651:web:2e326f6ac748190900329e'
  },

  // LIVE TRAFFIC. Free key (no credit card) at https://developer.tomtom.com
  // Kapag blangko: OpenStreetMap (OSRM) ang daan at ESTIMATE ang traffic ayon sa araw at oras.
  TOMTOM_KEY: '',

  // AI assistant: Firebase Console > AI Logic > Get started > Gemini Developer API.
  // Kapag hindi pa naka-enable, gagana pa rin ang "basic mode" (gas, palengke, kainan, atbp.).
  AI: {
    enabled: true,
    models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'], // susubukan ayon sa pagkakasunod
    appCheckSiteKey: '6LdqlzQuAAAAABjz6BaAo8kXblE5D2WBtdjxRltg',                                   // reCAPTCHA Enterprise site key (App Check)
    sdk: '13.4.0'
  },

  // Optional: sarili mong fuel price feed -> {"asOf":"2026-12-01","source":"DOE","gas":0,"diesel":0,"kero":0}
  FUEL_API_URL: '',

  // Public map services (libre, may limit). Palitan kapag marami nang users.
  OSRM: 'https://router.project-osrm.org',
  OVERPASS: ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
};
