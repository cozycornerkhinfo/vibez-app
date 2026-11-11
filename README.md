# VIBEZ

**City Activities, Events & Community Discovery Platform**

VIBEZ helps people discover things to do, places to explore, and communities to connect with around their city.

## Current MVP

- Responsive React interface built with Vite
- City selector placeholder (currently Phnom Penh)
- Activity discovery cards and category filters
- Search by activity, category, place, and description
- Save/unsave activities locally in the current browser session
- Community submission entry points (coming soon)

> The current listings are sample preview content. They are not live event listings and are not connected to a database yet.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Tech stack

- React 18
- Vite 6
- Lucide React icons
- Plain CSS

## Next steps

1. Connect a free-tier database and authentication.
2. Create event and place submission workflows.
3. Add moderation and admin management.
4. Integrate a Telegram bot for event discovery and submissions.
5. Deploy the web app on a free hosting tier.

## Project structure

```
.
├── index.html
├── package.json
└── src
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```
