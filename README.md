# Queueless: Walk-In Queue

A digital token system for small clinics and shops. The owner opens a queue and shows a QR code. Customers scan it, get a token, and watch their position and estimated wait update live on their phone.

Stack: React Native (Expo), Node.js (Express + Socket.io), MongoDB. JavaScript only. The full specification is in [PRD.md](PRD.md).

## Run it

You need Node 18+, MongoDB, and Expo Go on a phone. The laptop and the phone must be on the same Wi-Fi.

1. **Start MongoDB** (local install, or put an Atlas connection string in `server/.env`):

   ```
   mongod --dbpath ~/mongo-data
   ```

   or, with the system service: `sudo systemctl start mongod`.

2. **Start the server**:

   ```
   cd server
   npm install
   npm run dev
   ```

   `curl localhost:4000/health` should return `{"ok":true}`.

3. **Point the app at your laptop.** Find the laptop's LAN IP (for example `192.168.1.20`) and set it in [app/src/config.js](app/src/config.js):

   ```js
   export const API_URL = 'http://192.168.1.20:4000';
   ```

4. **Start the app**:

   ```
   cd app
   npm install
   npx expo start
   ```

   Scan the Expo QR code with Expo Go. For the demo, use two phones, or one phone and an emulator.

5. **Optional: the web admin.** The owner side also runs in a browser, from the same code:

   ```
   cd app
   npx expo start --web
   ```

   It opens on "Start a queue" and has no customer screens, so it is an admin console for the shop. The browser talks to the server at the same host that served the page (port 4000), so no config is needed. For a static build, run `npx expo export --platform web` and serve the `dist` folder with any static host.

## Your-turn alerts

When a number the phone holds is called, the customer is told on any screen: a yellow banner slides down and the phone buzzes. If the app is in the background, a system notification appears instead (tap it to open the ticket). The notification permission is requested right after joining a queue.

These are local notifications raised by the phone itself, so there is no Firebase and no account or token.

- **Expo Go:** the banner and the buzz work. System notifications do not, because Expo Go on Android cannot load the notifications library at all (since SDK 53), so the app skips it there.
- **Development or production build:** both work. Build one with `npx expo run:android` (needs the Android SDK) or EAS Build.
- **The limit:** the alerts need the app's connection to the server to be alive. A phone the system has fully put to sleep, or an app that was swiped away, is not reached.

## How it fits together

- You ask by REST, you are told by socket. REST (`/api/...`) changes things; Socket.io only pushes the shared `queue:update` snapshot to everyone in the queue's room.
- Token numbers come from one atomic MongoDB `$inc`, so two people scanning together never get the same number.
- The public snapshot carries token numbers only. Names stay with the owner, who fetches them with the `x-owner-key` header.
- Each phone finds its own place in the snapshot. One broadcast serves every customer.
- The wait estimate is the average of the last 10 real services (the owner's guess until 3 exist).

```
server/src   index.js (HTTP + Socket.io)  models/  routes/  lib/
app/src      screens/  components/  hooks/  lib/  theme.js  config.js
             Navigator.js (phone: all screens)  Navigator.web.js (browser: owner only)
```

One codebase, two targets: Metro picks `Navigator.web.js` for the browser, so the camera and ticket screens are never bundled into the web build.

## Known limitations

- Losing the owner's phone loses control of the queue.
- A customer who clears app data loses their ticket.
- Local network only: no HTTPS and no authentication beyond the owner key.
- The estimate ignores that different services take different amounts of time.
