# Spike: 1-Hour Development Plan for Instantly.AI Email App

## Overview
This spike outlines a strategic plan to build a functional AI-powered email composition app within 1 hour for the job interview assignment. Focus is on core functionality over polish.

## Time Allocation (60 minutes total)

### Phase 1: Foundation Setup (15 minutes)
1. **TypeScript Conversion** (10 minutes)
   - Convert backend to TypeScript (.js → .ts)
   - Add TypeScript to frontend (already Next.js, just add types)
   - Essential type definitions only

2. **LangChain Backend Setup** (5 minutes)
   - Install LangChain dependencies
   - Basic streaming endpoint structure

### Phase 2: Core Backend Development (20 minutes)
1. **Database Operations** (5 minutes)
   - Email CRUD operations in TypeScript
   - Database connection with proper types

2. **AI Agent System** (15 minutes)
   - Router agent for classification (sales vs follow-up)
   - Two specialized agents (sales, follow-up)
   - Streaming response implementation
   - **Critical**: Use simple LangChain streaming, not complex React agents

### Phase 3: Frontend Implementation (20 minutes)
1. **Email List Sidebar** (8 minutes)
   - Basic email list component
   - Select email functionality
   - Material-UI layout

2. **Compose Form** (7 minutes)
   - Form fields: To, CC, BCC, Subject, Body
   - AI button integration
   - Basic validation

3. **Streaming Integration** (5 minutes)
   - Connect to backend streaming endpoint
   - Real-time text updates in form fields

### Phase 4: Integration & Testing (5 minutes)
1. **End-to-end functionality test**
2. **Basic error handling**
3. **Quick demo preparation**

## Priority Decisions

### MUST HAVE (Core Assignment Requirements)
- Email list sidebar with selection
- Compose form with all fields
- AI button with prompt input
- Router agent deciding between sales/follow-up
- Streaming text generation
- Save emails to database

### NICE TO HAVE (If time permits)
- Email editing after AI generation
- Better UI/UX polish
- Error handling
- Loading states

### EXPLICITLY SKIP (Time constraints)
- Complex form validation
- Email search functionality
- Advanced styling
- Unit tests
- Advanced error handling
- Authentication

## Technical Approach

### Backend Architecture
```
POST /api/emails/generate-stream
- Accept: prompt, email context
- Router agent classifies intent
- Delegate to specialized agent
- Stream response back
- Save final email to database
```

### Frontend Architecture
```
- EmailList component (sidebar)
- ComposeForm component (main area)
- AIGeneration hook for streaming
- Simple state management (no Redux)
```

## Risk Mitigation

### High Risk Items
1. **Streaming implementation complexity** → Use simple Server-Sent Events
2. **LangChain agent setup** → Use basic OpenAI integration first, upgrade if time
3. **TypeScript conversion time** → Focus on essential types only

### Fallback Plans
- If streaming fails → Use simple async API calls
- If LangChain is complex → Use direct OpenAI API
- If TypeScript conversion is slow → Convert only critical files

## Success Criteria

### Minimum Viable Demo
1. User can see email list
2. User can click compose
3. User can enter AI prompt
4. System generates appropriate email content
5. Email is saved and appears in list

### Ideal Demo (if time allows)
- Smooth streaming text generation
- Clear distinction between sales/follow-up emails
- Professional UI with Material-UI

## Dependencies to Install

### Backend
```bash
npm install @langchain/core @langchain/openai
npm install typescript @types/node ts-node
```

### Frontend
```bash
npm install typescript @types/react @types/node
```

## Notes
- Keep scope minimal but functional
- Document any shortcuts taken
- Prepare to explain architecture decisions
- Focus on working demo over perfect code