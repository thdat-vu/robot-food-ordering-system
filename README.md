# Robot Food-Ordering System

This is a monorepo for the Robot Food-Ordering System, inspired by the sport-ink-admin structure.

## Structure

- `app/` - Main Next.js application (client web app)
- `components/` - Shared and UI components
  - `ui/` - Custom UI components
- `authentication/` - Authentication logic (actions, hooks, etc.)
- `hooks/` - Custom React hooks
- `lib/` - Utility libraries (e.g., axios, utils)
- `prisma/` - Prisma schema and seed scripts for mock data
- `features/` - Future features (e.g., chat, notifications)
- `public/avatars/` - Avatar images

## Roles

The app currently supports 4 main roles:
- User (Customer)
- Waiter
- Chief
- Moderator

Admin page will be implemented in the future.

## Future Features
- Real-time chat
- Notifications

## Getting Started

- Install dependencies: `yarn install`
- Run the app: `yarn dev`
