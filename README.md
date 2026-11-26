# RUTO - Transportation / Delivery Least Cost System

## Files
- index.html          - the page (landing/sign in, plan view, history view)
- css/style.css       - all styling (light and dark mode)
- js/app.js           - all logic: Firebase login, map, route, cost, translations
- assets/logo.svg     - RUTO logo (also used as the browser tab icon)
- firestore.rules     - security rules to paste into Firestore > Rules

## Run it
1. Open this folder in Visual Studio Code.
2. Install the "Live Server" extension.
3. Right-click index.html > Open with Live Server (use http://localhost:5500).
   Internet is needed for the map (OpenStreetMap), charts, and Firebase.

## Firebase setup (project ruto-6b418 is already in js/app.js)
1. Authentication > Sign-in method > enable Email/Password and Google (pick a support email).
   Apple needs an Apple Developer account (paid): enable the Apple provider and follow Firebase's prompts.
2. Firestore Database > Create database (production mode, asia-southeast1).
3. Firestore > Rules > paste firestore.rules > Publish.
4. If sign in fails on 127.0.0.1, open the app at http://localhost:5500 or add
   127.0.0.1 under Authentication > Settings > Authorized domains.

## Things to edit
- js/app.js: array V = vehicles (speed, capacity, fuel use, hourly cost, effort).
- js/app.js: st.fuel defaults and FUEL_API_URL = your live fuel price feed (optional).
- js/app.js: D = translations (English | Tagalog | Taglish), TIPS = cargo advice.

## Notes
- Fuel prices are editable placeholders unless you set FUEL_API_URL.
- Distance is an estimate (straight line x 1.3), not real road routing.
- Boats do not check for a water route.
