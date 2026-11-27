# RUTO - Smart Logistics/Delivery Planner Management System

RUTO is currently free to use: there are no subscriptions, free trials, or payment walls.
Network, carrier SMS, and infrastructure charges charged by third parties may still apply.

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

## What RUTO is for
RUTO is a free Smart Logistics/Delivery Planner Management System for individuals and small
businesses that need to plan deliveries with one pickup and multiple stops.
The planner lets users search for places or select them on the map, enter cargo and scheduling
details, choose priorities and land/water travel preferences, and compare suitable vehicles.

The comparison estimates trip distance, time, fuel or energy use, and cost, and can indicate when
the load may require multiple vehicles or trips. Map categories help users find nearby useful
places such as gas stations, food stops, and repair services to add as stop-overs. Saved plans can
be reviewed in History, arranged on the calendar, or followed with the in-app navigation while
location access is allowed. RuBot can answer questions about RUTO and help users find nearby places.

RUTO is a planning aid, not a dispatch service or a source of guaranteed live traffic, prices, ETAs,
or delivery results. Actual vehicle capacity, road conditions, fuel prices, and delivery requirements
should be checked before departure. The app is currently free to users with no subscription or
payment wall; third-party service, carrier, or infrastructure charges may still apply.

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
5. When launched as an installed standalone app, RUTO restores a saved signed-in session and
   opens the intro/dashboard instead of the landing page. In a regular browser, a returning
   account opens the sign-in form. Select **Keep me logged in on this device** during sign-in or
   sign-up to restore the app automatically on future browser visits; otherwise browser sign-in
   lasts only for the current session. Standalone apps retain their sign-in regardless of this
   browser preference. Browsers do not provide a reliable uninstall event, so
   deleting the home-screen icon itself cannot be detected or used to clear account data;
   clearing site data also clears locally stored app data.
The layout adapts to phone, tablet, and desktop viewport sizes.
The Plan page includes a six-step guide for adding drop-offs, setting a pickup, entering cargo,
choosing delivery preferences, reviewing estimates, and saving or scheduling the plan.

Inside the app, use the menu button for Plan, Calendar, History, About, Profile settings, and Sign out.
Click the circular avatar at the bottom of the menu to open Profile settings. Email/password
accounts can change their password there after confirming the current password; social/phone
accounts manage sign-in through their provider. Sign out is at the bottom of the menu.
On the first sign-in for each account on a browser or installed device, RUTO opens a guided,
step-by-step tour that highlights the menu, pickup and stop controls, nearby places, map location,
fuel estimates, delivery preferences, route comparisons, saving, scheduling, notifications, and
RuBot. Choose **Skip tutorial** to continue immediately, or reopen it later from
**About > Show the quick-start tutorial**.
Open the RUTO Assistant by tapping the orange chat bubble at the bottom-right of the signed-in app.
Fuel prices per liter are editable in the planner; changes are saved on this device and update trip
cost estimates. Road fuel estimates use average speed divided by km/L, multiplied by driving time,
with a traffic adjustment; EV energy is calculated in kWh. Boat fuel is estimated by cruising
liters per hour: the motorized-banca preset is 1.75 L/h (the midpoint of 1–2.5 L/h), while the
cargo-boat preset retains its existing equivalent of 22.5 L/h. The comparison shows both trip
quantity and hourly use. During an active route, use **Simulate** to move along the route without GPS.
After saving a delivery, choose **Start delivery** to open RUTO's in-app, Waze-style navigation.
It follows the saved drop-off order with live location, spoken turn guidance, and rerouting while
the app is open. GPS permission is required; external Google Maps and Waze links are also available.

## Firebase console (project ruto-6b418)
1. Firestore Database > Create database (production mode, asia-southeast1).
   Without this, deliveries are saved on the device only.
2. Firestore > Rules > paste `firestore.rules` > Publish. **The rules changed in this version.**
   New user documents require a consent record, and the consent record cannot be edited or removed.
   The signed-in owner can delete their own user document and delivery documents. Deleting a user
   document does not automatically delete Firestore subcollections; handle full account erasure
   through the privacy-request process described in `privacy.html`.
3. Storage > Get started, select the bucket matching `storageBucket` in `js/config.js`, then publish
   `storage.rules` (or run `firebase deploy --only storage`). The default bucket requires the Blaze
   pay-as-you-go plan under Firebase's current Storage requirements. Users can crop and zoom a photo
   before it is converted to a 512 x 512 JPEG and uploaded to `users/{uid}/profile.jpg` in Firebase
   Storage; Firestore stores the download URL in the user's profile. Storage rules allow replacement
   only after 30 days and prohibit deletion to prevent bypassing the cooldown.
4. Authentication > Sign-in method: enable Email/Password, Google (pick a support email), Facebook and Phone.
   To configure Facebook sign-in:
   - Create a Facebook app in Meta for Developers and add the Facebook Login product.
   - In Facebook Login > Settings, add the exact OAuth redirect URI shown by Firebase, normally
     `https://<your-firebase-project>.firebaseapp.com/__/auth/handler`. Set the app domain to the deployed
     host (`markryantalento-git.github.io`) and publish the Meta app when ready for public sign-in.
   - In Firebase Console > Authentication > Sign-in method > Facebook, enter the Meta App ID and App Secret,
     enable the provider, and confirm the Firebase callback URI. Keep the App Secret private; never commit
     it or put it in browser code. Add the deployed host under Authentication > Settings > Authorized domains.
   - Facebook sign-in uses Firebase's OAuth flow; configure both Meta and Firebase before testing it.
   In Authentication > Settings, keep **One account per email address** enabled. Firebase then
   rejects a second email/password account for an email already in use; the app also checks this
   in its local-only sign-in fallback when Firebase is not configured. Google and other providers
   follow Firebase's account-linking policy and may require the existing sign-in method. Enable
   email-enumeration protection and use
   the strongest practical password policy in Authentication settings.
5. Company accounts currently have a company name and an individual login; team deliveries are not
   shared. RUTO has no subscription or payment wall.
6. Password recovery: the sign-in form opens `password-reset.html?method=email`. Firebase sends
   a secure reset link, not a one-time email code. In Authentication > Templates > Password reset,
   set the sender display name to **RUTO Support** and the reply-to address to
   `ruto.supportph@gmail.com`. Firebase controls the actual From address; changing it to a Gmail
   sender cannot be done from browser code. A custom From address or email OTP needs a verified
   email-sending service and a secure server-side integration; never put SMTP credentials in this
   static app. SMS password recovery works only for a number already linked to a password-enabled
   account.
7. Phone sign-in:
   - In Authentication > Sign-in method, enable Phone. In Authentication > Settings > SMS region
     policy, allow the Philippines (+63).
   - Add the deployed host (for GitHub Pages, `markryantalento-git.github.io`) under Authorized
     domains. Real phone sign-in does not work on localhost; use the deployed HTTPS site.
   - Complete the visible Firebase reCAPTCHA in the phone flow. This is separate from the
     reCAPTCHA Enterprise site key used for Firebase App Check.
   - Real verification SMS requires Firebase's Blaze pay-as-you-go plan and can incur project-owner
     charges. RUTO itself remains free to users.
   - For development without sending/charging real SMS, add a fictional number and verification
     code under Authentication > Sign-in method > Phone numbers for testing, then use that pair in
     the app. Do not hardcode test numbers in production.
8. Authentication > Settings > Authorized domains: remove domains that are no longer used.
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
### GitHub Pages (automatic versioned deployments)
The workflow in `.github/workflows/deploy-pages.yml` deploys each push to the repository's
default branch (or a manual run on that branch) to GitHub Pages. Each deployment receives a
version such as `0.2.123`, uses the commit subject as its change note, and changes the service
worker cache name so returning users can load the new release. In the repository settings, set
**Pages > Build and deployment > Source** to **GitHub Actions**. The project files, including
`.github/workflows`, must be at the repository root for this workflow.

### Firebase Hosting (manual deployments)
    npm install -g firebase-tools
    firebase login
    firebase deploy --project ruto-6b418
For a manual Firebase Hosting release, update `release.json` with the next version and its
`changes` list before deploying. Account notifications are in-app and appear the next time a
signed-in user opens RUTO; this does not send background push notifications.

## Security notes
- Browser code is public: users can inspect or copy JavaScript and Firebase web config. Never put
  service-account keys, private API secrets, or passwords in this project. A Firebase web API key is
  an identifier, not authorization; restrict it to the production website referrers and the APIs
  the app uses. Restrict any TomTom key to the deployed site as well.
- Fixed-version CDN scripts and the Leaflet stylesheet use SHA-384 Subresource Integrity checks.
  Update the hashes whenever those exact asset versions change. Google Fonts CSS and the Firebase AI
  Logic modules loaded dynamically at runtime are not SRI-pinned; self-host them for stricter supply
  chain control. The right-click and text-selection deterrent is only a UI convenience and does not
  prevent DevTools, source downloads, screenshots, or automated scraping.
- Firestore rules restrict each account to its own profile and delivery documents, validate their
  fields, require consent on account creation, freeze the saved consent record, and prohibit client
  writes to published fuel data. Publish `firestore.rules` after changes.
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

## Privacy and consent
- `privacy.html` and `terms.html` are standalone pages linked from the signup consent gate and footer.
- Registration, Google/Facebook sign-in, and phone account creation stay gated until the user checks
  the consent box. The first Firestore profile write stores policy version `1.0` and a server
  timestamp. Existing users without a consent record must also accept before continuing.
- To request access, correction, consent withdrawal, or full account/data deletion, contact
  `ruto.supportph@gmail.com` as described in `privacy.html`. Review the legal text with qualified
  Philippine privacy counsel before representing it as a legal compliance certification.
