# Queueless

> A real-time digital walk-in queue for small clinics, shops, and service counters.

[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Local-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

Queueless replaces a physical waiting line with a digital token. An owner opens a queue, displays a QR code, and serves people in order. Customers join from their phones, keep their place while they wait, and receive live position updates and a turn alert.

The project is a JavaScript end-to-end application built for a clear walk-in experience across Android, iOS, and web, with REST commands, Socket.io live updates, and MongoDB persistence.

## Contents

- [Product overview](#product-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API and real-time protocol](#api-and-real-time-protocol)
- [Data model](#data-model)
- [Security and privacy](#security-and-privacy)
- [Notifications](#notifications)
- [Leave-in timer](#leave-in-timer)
- [Shop display screen](#shop-display-screen)
- [Design system](#design-system)
- [Troubleshooting](#troubleshooting)
- [Limitations and roadmap](#limitations-and-roadmap)

## Product overview

### Problem

Small clinics and shops often rely on physical lines, handwritten names, or verbal announcements. Customers must remain nearby, no-shows waste service capacity, and owners have limited visibility into queue state.

### Solution

| Role | Experience |
| --- | --- |
| Owner | Opens one queue, shares a QR code, calls the next person, skips or recalls people, pauses joining, and closes the queue with a summary. |
| Customer | Scans or enters a six-character code, receives a numbered ticket, watches position and estimated wait update live, leaves if necessary, and is alerted when called. |

### Goals

- Make joining take only a few seconds.
- Let customers leave the physical line without losing their place.
- Deliver live updates in roughly a second on a normal local network.
- Make queue operations readable at a glance.
- Keep the implementation small enough to explain and extend.

### Scope

The current product intentionally excludes accounts, passwords, payments, SMS, appointments, multiple counters, staff roles, analytics, and production deployment configuration. Background push is optional and best effort (see Notifications).

## Features

### Customer

- Join through QR scanning or manual six-character code entry.
- Optional name visible to the owner.
- Ticket number, serving number, people ahead, and estimated wait.
- Live updates through Socket.io.
- “Almost there” feedback when two or fewer people remain ahead.
- “Your turn” visual state with haptics.
- A banner and a buzz on any screen when the number is called, and a system notification in supported development or production builds.
- “Leave in N min” timer: say how far away you are and the ticket tells you when to set off.
- Hold tickets in several queues at once, with a My tickets screen to open or leave each.
- Leave while waiting.
- Restore stored tickets after reopening the app.

### Owner

- Create a queue with a shop or clinic name.
- Set the initial estimated minutes per person.
- Share a QR code and queue code.
- See the now-serving ticket and named waiting list.
- Call next, skip no-shows, and recall skipped customers.
- Pause and resume new joins.
- Close the queue and view served, skipped, left, and average service-time totals.
- Restore the owner dashboard after reopening the app.
- Web console: open a full-screen shop display for a TV (see Shop display screen).

### Experience and accessibility

- Large token numbers designed for quick reading.
- Status communicated with both text and color.
- Minimum 48 dp touch targets for frequent actions.
- Safe-area handling, keyboard-aware forms, and native back behavior.
- Reduced-motion support.

## Architecture

```text
 Expo mobile customer app ─┐
                           ├── REST + Socket.io ── Express server ── Mongoose ── MongoDB
 Expo web owner console ───┘
```

REST is used for commands and reads. Socket.io distributes the resulting queue snapshot to clients in the queue room.

### Update flow

1. A client sends a REST action, such as `POST /api/queues/:code/next`.
2. The server validates the request and owner key where required.
3. MongoDB updates the queue or ticket.
4. The server builds a fresh snapshot.
5. Socket.io broadcasts `queue:update` to that queue’s room.
6. Each client derives its own position and visual state from the snapshot.

### Consistency decisions

- Ticket numbers use an atomic MongoDB `$inc`, preventing duplicates during simultaneous joins.
- `sortKey` controls queue order; recalled tickets move to the back.
- Owner transitions only operate on valid states, keeping one ticket as `serving`.
- Public snapshots contain numbers and statuses, not customer names.

## Technology

### Client

- React Native 0.86 and Expo SDK 57
- React Navigation and React Native Web
- Socket.io client
- AsyncStorage for local ticket and owner persistence
- Expo Camera, Haptics, Notifications, and Keep Awake
- Archivo and Archivo Narrow fonts

### Server

- Node.js 20.19.4 or newer
- Express 5
- Socket.io 4
- Mongoose 9
- MongoDB local or Atlas
- dotenv, CORS, and Nodemon

## Repository layout

```text
Queueless/
├── app/
│   ├── App.js                 App bootstrap and persisted-session loading
│   ├── app.json               Expo configuration
│   ├── src/components/        Reusable UI components
│   ├── src/hooks/             Live queue, alerts, motion, and persistence hooks
│   ├── src/lib/               API, socket, storage, navigation, and domain helpers
│   ├── src/screens/           Customer and owner screens
│   ├── src/Navigator.js       Native navigation
│   ├── src/Navigator.web.js   Web owner navigation
│   ├── .env.example           Client environment template
│   └── package.json
├── server/
│   ├── src/index.js           Express, HTTP, Socket.io, and startup
│   ├── src/routes/            Queue, owner, and ticket endpoints
│   ├── src/models/            Queue and Ticket models
│   ├── src/lib/               Auth, snapshots, validation, and code generation
│   ├── .env.example           Server environment template
│   └── package.json
├── PRD.md                     Product and interface specification
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20.19.4 or newer (22 LTS recommended) and npm. Check with `node -v`: older versions, including Node 18, fail on the dependencies.
- Expo Go, or an Android/iOS development environment
- MongoDB local or MongoDB Atlas
- A PC and phone on the same Wi-Fi for local phone testing

### Install

```bash
git clone git@github.com:subhaan0804/Queueless.git
cd Queueless
cd server && npm install
cd ../app && npm install
```

### Create environment files

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Linux/macOS:

```bash
cp server/.env.example server/.env
```

`app/.env` is optional (see below), so most people only need the server file. No IP address or other machine-specific value needs to be edited in the code.

### Configure MongoDB

For Atlas, put the connection string in `server/.env`, allow the server’s public IP in Atlas **Network Access**, and use a database user with access to the selected database.

For local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/queueless
```

### Configure the client (usually nothing to do)

In development the phone finds the server by itself: it asks the Expo dev server for the computer’s address and uses port 4000, so it follows whatever Wi-Fi network you are on. The server prints the addresses it is reachable at when it starts.

Set the address by hand only when that does not work, for example with `npx expo start --tunnel`, a built app, or a server on another machine. Copy `app/.env.example` to `app/.env` and set:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

Use the server computer’s own network address (on Windows, `ipconfig`; on Linux/macOS, `ip addr` or `ifconfig`). Do not use `localhost` or `127.0.0.1` on a physical phone; those addresses refer to the phone itself. Restart with `npx expo start -c` after changing it: the value is baked in when the app is bundled.

Atlas does not change this value. The phone connects to the Queueless server, and only the server connects to Atlas.

### Start the server

```bash
cd server
npm run dev
```

Verify locally:

```bash
curl http://localhost:4000/health
```

Expected response: `{"ok":true}`.

### Start the app

```bash
cd app
npx expo start
```

Scan the Expo QR code with Expo Go. Use two phones or one phone and an emulator for an owner/customer demonstration.

### Start the web owner console

```bash
cd app
npx expo start --web
```

The browser talks to the server on the same host that served the page, on port 4000, so nothing needs configuring. For a static build hosted elsewhere, set `EXPO_PUBLIC_API_URL` before exporting:

```bash
npx expo export --platform web
```

## Environment variables

| File | Variable | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| `server/.env` | `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://user:password@cluster.mongodb.net/queueless` |
| `server/.env` | `MONGO_DB_NAME` | No | Explicit MongoDB database name; overrides the URI path | `QLess` |
| `server/.env` | `PORT` | No | HTTP and Socket.io port; defaults to `4000` | `4000` |
| `server/.env` | `EXPO_PUSH_URL` | No (enables background push) | Expo Push Service endpoint | `https://exp.host/--/api/v2/push/send` |
| `app/.env` | `EXPO_PUBLIC_API_URL` | No | Overrides the auto-detected API and Socket.io origin (tunnel, built app, remote server) | `http://192.168.1.20:4000` |

Never commit `.env` files. Expo public variables are bundled into the client and must not contain secrets. The MongoDB URI must remain server-side.

## API and real-time protocol

All application endpoints are under `/api`. Owner requests send the generated key in the `x-owner-key` header.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/queues` | Public | Create a queue: `{ name, defaultServiceMin }`. |
| `GET` | `/api/queues/:code` | Public | Read the public queue snapshot. |
| `POST` | `/api/queues/:code/join` | Public | Join an open queue: `{ name? }`. |
| `GET` | `/api/tickets/:id` | Ticket holder | Read ticket status and queue identity. |
| `POST` | `/api/tickets/:id/leave` | Ticket holder | Leave while waiting. |
| `POST` | `/api/tickets/:id/notifications` | Ticket holder | Register `{ token }` for background turn notifications. |
| `GET` | `/api/queues/:code/owner` | Owner key | Read named serving, waiting, and skipped lists. |
| `POST` | `/api/queues/:code/next` | Owner key | Finish current ticket and serve next. |
| `POST` | `/api/queues/:code/skip` | Owner key | Skip the current ticket. |
| `POST` | `/api/queues/:code/recall/:ticketId` | Owner key | Return a skipped ticket to the back. |
| `POST` | `/api/queues/:code/pause` | Owner key | Set `{ paused: true/false }`. |
| `POST` | `/api/queues/:code/close` | Owner key | Close the queue and return a summary. |

### Socket.io events

| Event | Direction | Payload | Behavior |
| --- | --- | --- | --- |
| `room:join` | Client → server | Queue code | Joins the room and receives a fresh snapshot. |
| `queue:update` | Server → clients | Snapshot | Broadcast after queue or ticket changes. |

The socket is not used for mutations. REST remains the command source and Socket.io distributes resulting state.

## Data model

### Queue

`name`, `code`, `ownerKey`, `status` (`open`, `paused`, `closed`), `defaultServiceMin`, `lastNumber`, `createdAt`, and `closedAt`.

### Ticket

`queueId`, `number`, `sortKey`, optional `name`, `status` (`waiting`, `serving`, `done`, `skipped`, `left`), `joinedAt`, `calledAt`, and `finishedAt`.

The estimated wait uses recent completed service times when available and falls back to the owner’s default estimate until enough observations exist.

## Security and privacy

- Owner routes require the queue’s `x-owner-key` capability key.
- Public snapshots do not include customer names.
- MongoDB credentials remain server-side.
- CORS is open for local development.
- The demo uses HTTP on a trusted local network and has no accounts, HTTPS, rate limiting, or abuse protection.

For production, add HTTPS, authenticated owner accounts, secure secret management, origin restrictions, rate limiting, audit logging, and a stronger customer identity model.

## Notifications

Turn alerts use two paths:

1. The live socket drives the in-app banner and haptics while the app is open. A system notification is also raised by the phone itself when the app is in the background but still connected (development or production builds).
2. The customer registers an Expo push token for the ticket. When the owner calls that ticket, the server sends a push notification through Expo Push Service, allowing the phone to alert the customer while the app is backgrounded.

Requirements for background notifications:

- Use an Android/iOS development or production build. Expo Go cannot load the notifications library on Android, so there it gets the in-app banner only.
- Grant notification permission after joining a queue.
- Configure an EAS project ID so Expo can issue the push token; EAS adds this to the app configuration during setup. Without it, no token is registered and push is silently skipped.
- On Android, delivery goes through Google’s Firebase Cloud Messaging, whose credentials EAS sets up. This is the one place the project depends on a third-party push service; everything else works without it.
- Set `EXPO_PUSH_URL` in `server/.env`.
- Keep the phone connected to the internet so Expo can deliver the notification.

The server treats push as best effort: a notification outage never prevents the queue from advancing. A phone that has disabled notifications, has no network, or has been force-stopped may not receive the alert.

## Leave-in timer

On a waiting ticket the customer taps how many minutes away they are (Here, 5, 10, 20 or 30). The ticket then says **“Leave in N min.”**, turning to **“Leave now.”** when it is time to set off. It counts down by itself and follows the line: when people are served faster or slower, the time moves. At that moment the phone shows a banner and buzzes. In a development or production build it also schedules a system notification for the same moment, so it can arrive while the app is in the background.

The time is the estimated wait minus the distance, minus a 2-minute buffer, so the person arrives before their number is called.

## Shop display screen

The web console can show a screen for a TV or wall monitor: the number being served in large type that rolls when it changes, the next five numbers, and the QR and code to join. Press **Open display** on the dashboard, or open the link shown under the code (`http://<host>:8081/?display=<CODE>`) on any other computer or TV browser on the same network. To get a link a TV can use, open the console through the computer’s network address (shown by `npx expo start`) rather than `localhost`, which only means “this computer”. The display is public and read-only, and shows numbers only, never names.

## Design system

The interface takes cues from physical tickets and departure boards: one dominant token, generous spacing, clear states, and restrained motion.

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#101820` | Primary text and numbers |
| Ticket blue | `#2453D4` | Waiting state and primary actions |
| Stub yellow | `#F4C84A` | Now serving and your-turn state |
| Paper | `#E9EEF2` | Owner and completed states |
| Called green | `#167A54` | Successful service state |
| Stamp red | `#B83228` | Errors and destructive actions |

The values live in `app/src/theme.js`. They differ slightly from the first palette in the PRD.

Archivo is used for interface text and Archivo Narrow for large token numerals. Color is never the only status signal; status text changes with the visual state.

## Troubleshooting

### Phone cannot reach the server

The app’s error names the address it tried (“Cannot reach the server at http://X:4000”). Compare it with the addresses the server printed when it started.

1. Confirm `http://localhost:4000/health` works on the PC.
2. From the phone browser, open `http://PC-IP:4000/health`.
3. If you set `EXPO_PUBLIC_API_URL` in `app/.env`, confirm it uses the PC’s current Wi-Fi IPv4 address, not `localhost`, `127.0.0.1`, or an old IP. Otherwise delete `app/.env` and let the app find the server itself.
4. Restart Expo after changing the file: `npx expo start -c`.
5. Allow Node.js through Windows Defender Firewall on private networks, or allow inbound TCP port 4000.
6. Check that the Wi-Fi network does not use client isolation or guest-network isolation.

### The server will not start

- `MONGO_URI is not set`: you skipped creating `server/.env` (copy `server/.env.example`).
- `Error: listen EADDRINUSE ... 4000`: something already uses port 4000. Stop it, or change `PORT` in `server/.env` and set `EXPO_PUBLIC_API_URL` in `app/.env` to match.
- Dependency errors on install: check `node -v` is 20.19.4 or newer.

### Expo Go says the project is incompatible

Update Expo Go to the latest version from the app store (this project uses Expo SDK 57).

### MongoDB connection fails

Check the exact `MONGO_URI`, Atlas credentials, password encoding, cluster hostname, database name, and Atlas Network Access allowlist. Restart the server after changing `.env`.

### Camera or notifications do not work

Camera permission is required; manual code entry remains available. Expo Go supports the in-app banner and buzz, while system notifications and push require a development or production build.

## Limitations and roadmap

### Current limitations

- One owner device controls a queue.
- Clearing app data removes locally stored tickets and owner state.
- The system is designed for a trusted local-network demo.
- There is no multi-counter, staff, appointment, or service-category model.
- Wait estimates do not model different service types.
- The leave-in time is a prediction from the last update; a scheduled reminder cannot be revised while the phone is asleep.
- Production hosting configuration is not included.

### Possible next steps

- Owner accounts and staff roles.
- HTTPS deployment and managed secrets.
- Push that works without a third-party service.
- Multiple counters and service categories.
- Configurable service times during an active queue.
- Historical analytics and daily exports.
- Automated tests for queue transitions, authorization, and concurrent joins.

## Development commands

```bash
# Server
cd server
npm run dev       # Nodemon development server
npm start         # Node process

# App
cd app
npm start         # Expo development server
npm run android   # builds and runs a native Android app (needs the Android SDK)
npm run ios       # builds and runs a native iOS app (needs Xcode)
npm run web       # Web target
```

## Demo and release checklist

- Health endpoint responds successfully.
- Queue creation and QR/code sharing work.
- Concurrent joins receive unique numbers.
- Next, Skip, Recall, Pause, and Close behave correctly.
- Customer snapshots update after every owner action.
- Leave and app-reopen persistence work.
- Phone can reach the PC over the selected network.
- Camera denial falls back to manual code entry.
- Large text, reduced motion, keyboard behavior, and safe areas remain usable.

## References

- [Product requirements and interface specification](PRD.md)
- [App environment template](app/.env.example)
- [Server environment template](server/.env.example)

## License

The server package is currently marked as ISC. Add a root `LICENSE` file before publishing a formal license statement or redistributing the project.
