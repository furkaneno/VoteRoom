# 🗳️ VoteRoom — Real-Time Collaborative Voting

A production-grade planning poker / voting SaaS built with Next.js 14, TypeScript, Firebase, and Framer Motion.

## ✨ Features

- **Instant rooms** — create a room with a nickname, get a shareable link in seconds
- **Real-time sync** — all votes, participants, and state sync instantly via Firestore
- **Secret voting** — votes are hidden until the host reveals
- **Multiple scales** — Fibonacci, Numeric (1–10), T-Shirt sizes, or Custom
- **Live timer** — synced countdown/stopwatch across all participants
- **Results analytics** — average, min/max, vote distribution chart, per-user breakdown
- **Anonymous auth** — no sign-up required, Firebase anonymous auth handles identity
- **Animal avatars** — each participant gets a unique emoji avatar
- **Topic tracking** — host can label what's being estimated
- **Dark theme** — deep navy glassmorphism aesthetic

## 🚀 Getting Started

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create a new project
2. Enable **Firestore Database** (start in test mode, then apply rules below)
3. Enable **Authentication** → Sign-in methods → **Anonymous** ✓
4. Register a **Web App** and copy the config

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Firestore Security Rules

In Firebase Console → Firestore → Rules, paste the contents of `firestore.rules`.

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts + Toaster
│   ├── page.tsx                # Landing page (create room)
│   ├── join/[roomId]/page.tsx  # Join page via direct link
│   └── room/[roomId]/page.tsx  # Main room (with join gate)
│
├── components/
│   ├── room/
│   │   ├── RoomHeader.tsx      # Top bar: logo, timer controls, copy link
│   │   ├── HostControls.tsx    # Reveal, reset, scale picker
│   │   ├── ParticipantGrid.tsx # Avatar cards with vote status
│   │   ├── TimerWidget.tsx     # Reusable timer UI
│   │   └── TopicBar.tsx        # Editable topic display
│   ├── voting/
│   │   └── VotingPanel.tsx     # Playing card vote selector
│   └── results/
│       └── ResultsPanel.tsx    # Stats + bar chart + individual votes
│
├── hooks/
│   ├── useAuth.ts              # Firebase anonymous auth
│   ├── useRoom.ts              # Room state, timer, host actions
│   └── useVotes.ts             # Vote state, casting, stats computation
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts           # Firebase app init
│   │   └── rooms.ts            # All Firestore operations
│   └── utils.ts                # cn(), formatTime(), getRandomAvatar()
│
├── types/
│   └── index.ts                # All TypeScript types + constants
│
└── styles/
    └── globals.css             # Tailwind + custom CSS variables + fonts
```

## 🗺️ Firestore Data Model

```
rooms/{roomId}
  ├── id: string
  ├── hostId: string
  ├── hostNickname: string
  ├── votingType: "fibonacci" | "numeric" | "tshirt" | "custom"
  ├── isRevealed: boolean
  ├── round: number
  ├── topic: string
  ├── createdAt: number
  ├── timer: { seconds, isRunning, startedAt, pausedAt }
  │
  ├── participants/{userId}
  │     ├── id, nickname, avatar, isHost, joinedAt, isOnline
  │
  └── votes/{userId}
        ├── userId, value, votedAt, round
```

## 🎯 UX Flow

1. **Host** enters nickname → clicks "Create Room" → room created → redirected to `/room/[id]`
2. **Host** copies link → shares with team
3. **Participants** open link → enter nickname → join gate submits → enter room
4. Everyone votes secretly (cards flip, checkmark appears, but value hidden)
5. **Host** clicks "Reveal Results" → all votes shown simultaneously with animation
6. Stats panel shows: average, min/max, distribution chart, individual results
7. **Host** clicks "New Round" → votes clear → UI resets for next story

## 🔐 Security Model

- Anonymous Firebase auth ensures every user has a stable `uid` per session
- Firestore rules enforce: only vote owners can write their vote, only host can update room
- Votes are readable by all participants but the UI hides them until host reveals

## 🎨 Design System

- **Fonts**: Syne (display/headings) + DM Sans (body) + JetBrains Mono (code/timer)
- **Theme**: Dark navy (`#05060f`) with glassmorphism cards and indigo/purple accents
- **Motion**: Framer Motion for card reveals, participant joins, result animations
- **Components**: All glass-morphism with `backdrop-filter: blur(20px)`

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` 14 | App Router, SSR/CSR |
| `firebase` | Firestore + Anonymous Auth |
| `framer-motion` | Animations & transitions |
| `recharts` | Vote distribution bar chart |
| `react-hot-toast` | Toast notifications |
| `nanoid` | Unique room ID generation |
| `clsx` + `tailwind-merge` | Class name utilities |

## 🚢 Deployment

### Vercel (recommended)
```bash
npx vercel
```
Add your Firebase env vars in Vercel project settings.

### Environment Variables Required
All `NEXT_PUBLIC_FIREBASE_*` vars from `.env.example`.
