# Queueless

> A real-time digital walk-in queue for small clinics, shops, and service counters.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
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

The current product intentionally excludes accounts, passwords, payments, SMS, remote push infrastructure, appointments, multiple counters, staff roles, analytics, and production deployment configuration.

## Features

### Customer

- Join through QR scanning or manual six-character code entry.
- Optional name visible to the owner.
- Ticket number, serving number, people ahead, and estimated wait.
- Live updates through Socket.io.
- “Almost there” feedback when two or fewer people remain ahead.
- “Your turn” visual state with haptics.
- Local turn notifications in supported development or production builds.
- Leave while waiting.
- Restore a stored ticket after reopening the app.

### Owner

- Create a queue with a shop or clinic name.
- Set the initial estimated minutes per person.
- Share a QR code and queue code.
- See the now-serving ticket and named waiting list.
- Call next, skip no-shows, and recall skipped customers.
- Pause and resume new joins.
- Close the queue and view served, skipped, left, and average service-time totals.
- Restore the owner dashboard after reopening the app.

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

- Node.js 18+
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

- Node.js 18 or newer and npm
- Expo Go, or an Android/iOS development environment
- MongoDB local or MongoDB Atlas
- A PC and phone on the same Wi-Fi for local phone testing

### Install

```bash
git clone <repository-url>
cd Queueless
cd server && npm install
cd ../app && npm install
```

### Create environment files

Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item app/.env.example app/.env
```

Linux/macOS:

```bash
cp server/.env.example server/.env
cp app/.env.example app/.env
```

### Configure MongoDB

For Atlas, put the connection string in `server/.env`, allow the server’s public IP in Atlas **Network Access**, and use a database user with access to the selected database.

For local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/queueless
```

### Configure the client

For a phone or emulator, set the server address reachable from that device:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

On Windows, run `ipconfig` and use the Wi-Fi adapter’s current IPv4 address. Do not use `localhost` or `127.0.0.1` on a physical phone; those addresses refer to the phone itself.

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

When served from the API host, web uses the current browser origin automatically. For a static build hosted elsewhere, set `EXPO_PUBLIC_API_URL` before exporting:

```bash
npx expo export --platform web
```

## Environment variables

| File | Variable | Required | Purpose | Example |
| --- | --- | --- | --- | --- |
| `server/.env` | `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://user:password@cluster.mongodb.net/queueless` |
| `server/.env` | `PORT` | No | HTTP and Socket.io port; defaults to `4000` | `4000` |
| `server/.env` | `EXPO_PUSH_URL` | For background notifications | Expo Push Service endpoint | `https://exp.host/--/api/v2/push/send` |
| `app/.env` | `EXPO_PUBLIC_API_URL` | Native: yes; web: optional | API and Socket.io origin | `http://192.168.1.20:4000` |

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

1. The live socket drives the in-app banner and haptics while the app is open.
2. The customer registers an Expo push token for the ticket. When the owner calls that ticket, the server sends a push notification through Expo Push Service, allowing the phone to alert the customer while the app is backgrounded.

Requirements for background notifications:

- Use an Android/iOS development or production build; Expo Go does not support the complete notification path on Android.
- Grant notification permission after joining a queue.
- Configure an EAS project ID so Expo can issue the push token; EAS adds this to the app configuration during setup.
- Set `EXPO_PUSH_URL` in `server/.env`.
- Keep the phone connected to the internet so Expo can deliver the notification.

The server treats push as best effort: a notification outage never prevents the queue from advancing. A phone that has disabled notifications, has no network, or has been force-stopped may not receive the alert.

## Design system

The interface takes cues from physical tickets and departure boards: one dominant token, generous spacing, clear states, and restrained motion.

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#14171F` | Primary text and numbers |
| Ticket blue | `#1F3FBF` | Waiting state and primary actions |
| Stub yellow | `#FFD23F` | Now serving and your-turn state |
| Paper | `#F2F4F7` | Owner and completed states |
| Called green | `#1E8E5A` | Successful service state |
| Stamp red | `#C8321F` | Errors and destructive actions |

Archivo is used for interface text and Archivo Narrow for large token numerals. Color is never the only status signal; status text changes with the visual state.

## Troubleshooting

### Phone cannot reach the server

1. Confirm `http://localhost:4000/health` works on the PC.
2. From the phone browser, open `http://PC-IP:4000/health`.
3. Confirm `app/.env` uses the PC’s current Wi-Fi IPv4 address, not `localhost`, `127.0.0.1`, or an old IP.
4. Restart Expo after changing the file: `npx expo start -c`.
5. Allow Node.js through Windows Defender Firewall on private networks, or allow inbound TCP port 4000.
6. Check that the Wi-Fi network does not use client isolation or guest-network isolation.

### MongoDB connection fails

Check the exact `MONGO_URI`, Atlas credentials, password encoding, cluster hostname, database name, and Atlas Network Access allowlist. Restart the server after changing `.env`.

### Camera or notifications do not work

Camera permission is required; manual code entry remains available. Expo Go supports in-app feedback, while full system notifications require a development or production build.

## Limitations and roadmap

### Current limitations

- One owner device controls a queue.
- Clearing app data removes locally stored tickets and owner state.
- The system is designed for a trusted local-network demo.
- There is no multi-counter, staff, appointment, or service-category model.
- Wait estimates do not model different service types.
- Production hosting configuration is not included.

### Possible next steps

- Owner accounts and staff roles.
- HTTPS deployment and managed secrets.
- Remote push notifications.
- Multiple counters and service categories.
- TV or wall-display mode.
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
npm run android   # Android target
npm run ios       # iOS target
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
