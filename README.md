# Queueless: Walk-In Queue

A digital token system for small clinics and shops. The owner opens a queue and shows a QR code. Customers scan it, get a token, and watch their position and estimated wait update live on their phone.

Stack: React Native (Expo), Node.js (Express + Socket.io), MongoDB. JavaScript only. The full specification is in [PRD.md](PRD.md).

## Set it up

**You need**

- **Node.js 20.19.4 or newer** (22 LTS recommended). Check with `node -v`. Older versions, including Node 18, fail on the app's dependencies.
- **MongoDB**: either MongoDB Community installed on your computer, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
- **Expo Go** on a phone (current version from the app store), for the phone app.
- The computer and the phone on the **same Wi-Fi network**.

No IP address or other machine-specific value needs to be edited in the code.

**1. Clone and install**

```
git clone git@github.com:subhaan0804/Queueless.git
cd Queueless
cd server && npm install && cd ..
cd app && npm install && cd ..
```

**2. Configure the server**

```
cp server/.env.example server/.env
```

Open `server/.env`. For a local MongoDB nothing needs changing. For Atlas, paste your connection string into `MONGO_URI` (the file explains how). `server/.env` is git-ignored, so your password never reaches GitHub.

**3. Start MongoDB** (skip this for Atlas)

```
sudo systemctl start mongod        # Linux with the system service
brew services start mongodb-community   # macOS
```

Or run `mongod --dbpath <any empty folder>` in its own terminal.

**4. Start the server**

```
cd server
npm run dev
```

You should see `MongoDB connected`, then the addresses the server is reachable at. `curl localhost:4000/health` should answer `{"ok":true}`.

**5. Start the app**

```
cd app
npx expo start
```

Scan the QR code with Expo Go (Camera app on iPhone, the Expo Go app on Android). The phone finds the server by itself: it asks the Expo dev server for the computer's address and uses port 4000. For the demo use two phones, or one phone plus the web admin below.

**6. Optional: the web admin.** The owner side also runs in a browser from the same code:

```
cd app
npx expo start --web
```

It opens on "Start a queue" and has no customer screens, so it is an admin console for the shop. The browser talks to the server on the same host that served the page (port 4000). For a static build, run `npx expo export --platform web` and serve the `dist` folder with any static host.

## If something does not work

| Symptom | Cause and fix |
|---|---|
| App says "Cannot reach the server at http://X:4000" | The message shows the address the app tried. It must match an address the server printed at startup. Make sure the phone and computer are on the same Wi-Fi, and that the server is running. |
| Same, but the addresses match | The computer's firewall is blocking port 4000 (Linux: allow it in `ufw` or `firewalld`; Windows: allow Node.js through the firewall), or the router isolates devices (guest Wi-Fi, "AP/client isolation"). A phone hotspot with the laptop connected to it is a quick workaround. |
| Using `npx expo start --tunnel`, or a built app | The tunnel only forwards Expo, not the API. Copy `app/.env.example` to `app/.env`, set `EXPO_PUBLIC_API_URL` to the server's address, and restart with `npx expo start -c`. |
| Server prints `MONGO_URI is not set` | You skipped step 2. Run `cp server/.env.example server/.env`. |
| Server prints `MongoDB connection failed` | Local MongoDB is not running (step 3), or, for Atlas, your IP is not in Network Access, the password is wrong (avoid special characters), or the database name is missing from the string. |
| `Error: listen EADDRINUSE ... 4000` | Something already uses port 4000. Stop it, or change `PORT` in `server/.env` and set `EXPO_PUBLIC_API_URL` in `app/.env` to match. |
| Expo Go: "Project is incompatible" | Update Expo Go to the latest version from the app store. |
| Camera denied | Type the 6-character code instead. |
| No system notification when your number is called | System notifications need a development or production build; in Expo Go you get the in-app banner and the buzz. |

Dependency versions are pinned by `package-lock.json` in both folders.

## Your-turn alerts

When a number the phone holds is called, the customer is told on any screen: a yellow banner slides down and the phone buzzes. If the app is in the background, a system notification appears instead (tap it to open the ticket). The notification permission is requested right after joining a queue.

These are local notifications raised by the phone itself, so there is no Firebase and no account or token.

- **Expo Go:** the banner and the buzz work. System notifications do not, because Expo Go on Android cannot load the notifications library at all (since SDK 53), so the app skips it there.
- **Development or production build:** both work. Build one with `npx expo run:android` (needs the Android SDK) or EAS Build.
- **The limit:** the alerts need the app's connection to the server to be alive. A phone the system has fully put to sleep, or an app that was swiped away, is not reached.

## Leave-in timer

On a waiting ticket the customer taps how many minutes away they are (Here, 5, 10, 20 or 30). The ticket then says **"Leave in N min."**, turning to **"Leave now."** when it is time to set off. It counts down by itself and follows the line: when people are served faster or slower, the time moves. At that moment the phone shows a banner and buzzes. In a development or production build it also schedules a system notification for the same moment, so it can arrive when the app is in the background.

The time is the estimated wait minus the distance, minus a 2-minute buffer, so the person arrives before their number is called.

## Shop display screen

The web admin can show a screen for a TV or wall monitor: the number being served in giant type that rolls when it changes, the next five numbers, and the QR and code to join. Open the dashboard in the browser and press **Open display**, or open the link it shows under the code (`http://<host>:8081/?display=<CODE>`, using the address you use for the admin) on any other computer or TV browser on the same network. To get a link a TV can use, open the admin through the computer's network address (for example `http://192.168.0.10:8081`, shown by `npx expo start`) rather than `localhost`, since `localhost` only means "this computer". The display is public and read-only, and shows numbers only, never names.

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
