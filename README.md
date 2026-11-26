# RUTO - Transportation / Delivery Least Cost System

## Files
- index.html            - the page (sign in, plan, calendar, history, navigation, assistant)
- css/style.css         - styling (light and dark)
- js/config.js          - **your settings and API keys (edit this one)**
- js/i18n.js            - translations (English | Tagalog | Taglish) and cargo tips
- js/app.js             - sign in, plan screen, vehicles, cost
- js/routing.js         - road routes, traffic, land/water detection
- js/store.js           - save, history, calendar, device calendar
- js/fuel.js            - fuel price refresh
- js/nav.js             - live navigation
- js/assistant.js       - chat and voice assistant, nearby places
- js/main.js            - start-up
- data/fuel-prices.json - published nationwide fuel prices
- firestore.rules, storage.rules, firebase.json

## Run it
1. Open this folder in Visual Studio Code, install "Live Server".
2. Right-click index.html > Open with Live Server, then use http://localhost:5500
   (do not open the file directly). Internet is required. Create an account or sign in to use
   the dashboard.
3. GPS, microphone and navigation need http://localhost or an https:// address.
   To use it on a phone, deploy it (see "Put it online").
4. On a supported browser, use the Install banner to add RUTO to your device. On iPhone/iPad,
   open the site in Safari, tap Share, then choose Add to Home Screen. Installation requires
   HTTPS (or localhost while developing).
The layout adapts to phone, tablet, and desktop viewport sizes.

Inside the app, use the menu button for Plan, Calendar, History, Profile settings, and Sign out.
Click the circular avatar at the bottom of the menu to open Profile settings. Email/password
accounts can change their password there after confirming the current password; social/phone
accounts manage sign-in through their provider. Sign out is at the bottom of the menu.
Open the RUTO Assistant by tapping the orange chat bubble at the bottom-right of the signed-in app.
Fuel prices per liter are editable in the planner; changes are saved on this device and update trip
cost estimates. During an active route, use **Simulate** to move along the route without GPS.
After saving a delivery, choose **Start delivery** to open RUTO's in-app, Waze-style navigation.
It follows the saved drop-off order with live location, spoken turn guidance, and rerouting while
the app is open. GPS permission is required; external Google Maps and Waze links are also available.

## Firebase console (project ruto-6b418)
1. Firestore Database > Create database (production mode, asia-southeast1).
   Without this, deliveries are saved on the device only.
2. Firestore > Rules > paste firestore.rules > Publish. **The rules changed in this version.**
3. Storage > Get started, select the configured bucket, then publish the rules in storage.rules.
   Profile photos are resized and stored under a user-scoped path protected by those rules.
4. Authentication > Sign-in method: enable Email/Password, Google (pick a support email), Apple and Phone.
   Apple sign-in also requires an Apple Developer configuration (Services ID, Team ID, key ID and private key)
   entered in Firebase Console; never put the Apple private key in browser code.
   In Authentication > Settings, keep **One account per email address** enabled. Firebase then
   rejects a second email/password account for an email already in use; the app also checks this
   in its local-only sign-in fallback when Firebase is not configured. Google and other providers
   follow Firebase's account-linking policy and may require the existing sign-in method. Enable
   email-enumeration protection and use
   the strongest practical password policy in Authentication settings.
5. Company accounts currently have a company name and an individual login; team deliveries are not
   shared yet. A ₱199 subscription is planned, but the billing period and launch date are unconfirmed.
   The team feature and payments remain disabled pending BIR registration. Publish the updated
   Firestore rules so company details sync.
6. Password recovery: the sign-in form reveals Forgot password only after an incorrect
   email/password attempt, and opens password-reset.html?method=email. Firebase sends a secure
   password-reset link by email (not an email OTP). Phone sign-in uses an SMS code, so a failed
   phone-code attempt should resend/verify a code rather than show a password-recovery link. SMS
   password recovery works only for a phone number already linked to the password-enabled account.
   Enable Phone sign-in and configure SMS billing/regions as described below.
7. Phone sign-in:
   - Real SMS needs the Blaze (pay as you go) plan; each SMS is charged.
   - Authentication > Settings > SMS region policy: allow Philippines.
   - Free testing: Phone > "Phone numbers for testing" (e.g. +63 900 000 0000 with code 123456).
   - Firebase does not allow "localhost" for phone sign-in; test it on the deployed address.
8. Authentication > Settings > Authorized domains: add your production domain and localhost only
   for development. Remove domains that are no longer used.
9. App Check > register the web app with reCAPTCHA Enterprise, use its site key in
   AI.appCheckSiteKey in js/config.js, and monitor valid traffic before enforcing App Check for
   Cloud Firestore and Firebase AI Logic. For local development, copy the App Check debug token
   from the browser console into App Check > Apps > Manage debug tokens. Keep it private and never
   add localhost to the production reCAPTCHA key.

## Live traffic (optional, recommended)
1. Make a free key at https://developer.tomtom.com (no credit card; monthly free limit).
2. Paste it into TOMTOM_KEY in js/config.js. Restrict the key to your domain, since it is visible in the browser.
Without a key, roads come from OpenStreetMap (OSRM) and traffic is an estimate by day and time
(rush hours, Friday evening, payday, December). The route results show the forecast traffic level,
estimated delay, and total delivery time for the selected vehicle; this is not live or segment-level
traffic data. If a road route cannot be found, RUTO reports the failure instead of drawing a straight
line across land or water. Use "By water only" for an intentional direct water estimate.
Edit trafficFactor() in js/routing.js.

## AI assistant (optional)
1. Firebase console > AI Logic > Get started > Gemini Developer API.
2. App Check for AI uses the same AI.appCheckSiteKey configured for the web app above.
3. Model names are in AI.models.
Without this the assistant works in basic mode (nearby gas, market, eatery, repair, ice and more).
Voice input works in Chrome, Edge and Safari. A Tagalog speaking voice depends on the device.
The "AI web search" for fuel prices uses Google Search grounding, which may not be included in the free tier.

## Fuel prices (nationwide)
There is no official live fuel price API. "Refresh prices" takes the newest of:
1. data/fuel-prices.json
2. Firestore document public/fuel (best for weekly updates; every user gets it)
   fields: asOf (string "2026-12-01"), source (string), gas, diesel, kero (numbers)
3. FUEL_API_URL, if you set one
4. AI web search (button only; shown with sources; applied only when you press Apply)
Update number 1 or 2 every Tuesday. Included values: 24 Nov 2026, from fuelprice.ph.

## Put it online
    npm install -g firebase-tools
    firebase login
    firebase deploy --project ruto-6b418

## Security notes
- Browser code is public: users can inspect or copy JavaScript and Firebase web config. Never put
  service-account keys, private API secrets, or passwords in this project. A Firebase web API key is
  an identifier, not authorization; restrict it to the production website referrers and the APIs
  the app uses. Restrict any TomTom key to the deployed site as well.
- Firestore rules restrict each account to its own profile and delivery documents, validate their
  fields, and prohibit client writes to published fuel data. Publish `firestore.rules` after changes.
- Firebase Hosting adds HTTPS-only transport, framing, MIME-sniffing, referrer, and browser-permission
  headers. These apply after deployment, not when opening files locally.
- No website can be guaranteed unhackable. Keep Firebase and dependencies updated, monitor App Check
  metrics before enforcement, and watch Firebase Authentication and usage for abuse.

## Limits
- The device calendar cannot be written silently by a website: the user confirms in Google Calendar
  or opens the .ics file. Later edits or deletes do not update the device calendar automatically.
- Navigation runs while the page is open and the screen is on; it is not a background app.
  Google Maps and Waze buttons are provided.
- Water legs are straight-line estimates (except ferry routes found on the map). Ferry fares,
  port fees and sailing schedules are not included. Land/water detection reads the map colour
  at each pin; use "Travel type" to override it.
- Vehicle speeds, costs and range limits are assumptions: edit array V in js/app.js.
- The free OSRM, Overpass, Nominatim and map tile servers are for light use only.
