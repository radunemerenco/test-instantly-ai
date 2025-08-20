# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for an Instantly.AI coding assignment - an email composition and management web application with AI-powered drafting capabilities. The project consists of:

- **Frontend**: Next.js application (port 3000) using Material-UI for the interface
- **Backend**: Fastify server (port 3001) with SQLite database using Knex for migrations

## Development Commands

### Frontend (from `frontend/` directory)
- `yarn install` - Install dependencies
- `yarn dev` - Start development server on http://localhost:3000
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Backend (from `backend/` directory)
- `yarn install` - Install dependencies
- `yarn migrate` - Run database migrations (required before first run)
- `yarn dev` - Start development server on http://localhost:3001
- `yarn start` - Start production server

## Architecture

### Database Schema
The application uses SQLite with a single `emails` table containing:
- `id` (primary key)
- `to`, `cc`, `bcc` (text fields)
- `subject` (string)
- `body` (text)
- `created_at`, `updated_at` (timestamps)

### Backend Structure
- `index.js` - Main Fastify server entry point
- `src/routes/index.js` - API routes (currently minimal with ping endpoint)
- `src/db/index.js` - Database connection and methods
- `knexfile.js` - Knex configuration for SQLite
- `migrations/` - Database migration files

### Frontend Structure
- `src/pages/_app.js` - App wrapper with sidebar navigation (Email and AccountBox icons)
- `src/pages/index.js` - Main page (currently minimal)
- `src/pages/api/` - Next.js API routes
- Material-UI components integrated for styling

## Key Features to Implement

The assignment requires:
1. Apple Mail-style sidebar with email list
2. Email composition form with To/CC/BCC/Subject/Body fields
3. AI-powered email drafting with router assistant and specialized assistants:
   - Sales Assistant (40-word max, 7-10 words/sentence)
   - Follow-up Assistant
4. Streaming content generation to Subject/Body fields
5. Email storage in database (no actual sending required)

## Development Notes

- No actual email sending - emails are stored in database only
- Remove build artifacts before submission: `.next/`, `dev.sqlite3`, `node_modules/`
- Assignment time limit: 1 hour
- Both frontend and backend servers need to run simultaneously for full functionality