# STORY-001-002: Backend AI Agent System

## Story Information
- **Story ID**: STORY-001-002
- **Epic**: [EPIC-001: AI-Powered Email App Development](README.md)
- **Title**: Backend AI Agent System
- **Status**: Not Started
- **Priority**: High
- **Estimate**: 4 Story Points
- **Assignee**: TBD
- **Sprint**: Interview Assignment Sprint

## Description
Implement the core AI agent system using LangChain with a router agent that classifies user prompts and delegates to specialized email generation agents. This story creates the streaming API endpoints and implements both sales and follow-up email generation agents with proper streaming responses.

## Acceptance Criteria
- [ ] Router agent successfully classifies prompts as "sales" or "followup"
- [ ] Sales agent generates concise emails under 40 words with 7-10 words per sentence
- [ ] Follow-up agent generates appropriate polite follow-up emails
- [ ] Streaming API endpoint delivers real-time text generation
- [ ] Generated emails include both subject and body content

## Subtasks

### 1. Router Agent Implementation
- [ ] Create router agent with classification system prompt
- [ ] Implement prompt analysis logic for sales vs follow-up detection
- [ ] Add error handling for ambiguous or unclear prompts
- [ ] Test classification accuracy with sample prompts

### 2. Specialized Agent Development
- [ ] Implement sales agent with 40-word limit constraint
- [ ] Create follow-up agent with polite, professional tone
- [ ] Design system prompts for both agent types
- [ ] Add content validation and formatting logic

### 3. Streaming API Implementation
- [ ] Create POST /api/emails/generate-stream endpoint
- [ ] Implement Server-Sent Events for real-time streaming
- [ ] Add proper CORS headers for frontend communication
- [ ] Handle streaming errors and connection issues

### 4. Verification
- [ ] End-to-end test with sample prompts
- [ ] Verify streaming functionality works in browser
- [ ] Validate email content meets requirements
- [ ] Test error handling scenarios

## Technical Notes
- Use OpenAI GPT-3.5-turbo or GPT-4 for reliable performance
- Implement simple classification rather than complex routing logic
- Keep system prompts concise but specific to avoid token usage issues
- Use EventSource-compatible streaming format for frontend integration
- Add timeout handling for slow API responses

## Files to Create
```
backend/src/agents/router.ts
backend/src/agents/sales.ts
backend/src/agents/followup.ts
backend/src/routes/emails.ts
backend/src/types/agents.ts
backend/src/utils/streaming.ts
```

## API Endpoint Design
```typescript
POST /api/emails/generate-stream
Content-Type: application/json

Request:
{
  "prompt": "Meeting request for Tuesday",
  "context": {
    "recipient": "john@company.com",
    "senderName": "Jane Doe"
  }
}

Response: Server-Sent Events
data: {"type": "classification", "result": "sales"}
data: {"type": "subject", "content": "Quick Meeting Request"}
data: {"type": "body", "content": "Hi John,\n\nCould we meet Tuesday..."}
data: {"type": "complete"}
```

## Agent System Prompts
Sales Agent:
```
You are a sales email specialist. Generate concise sales emails under 40 words total.
Use 7-10 words per sentence maximum. Be direct, professional, and compelling.
Always include a clear call-to-action.
```

Follow-up Agent:
```
You are a follow-up email specialist. Generate polite, professional follow-up emails.
Be courteous but persistent. Reference previous interactions when possible.
Maintain a helpful, non-pushy tone.
```

## Definition of Done
- [ ] All agents respond correctly to classification tests
- [ ] Streaming endpoint delivers content in real-time
- [ ] Sales emails meet word count and sentence length requirements
- [ ] Follow-up emails maintain appropriate professional tone
- [ ] Error handling covers common failure scenarios
- [ ] Code review completed
- [ ] Changes committed to version control

## Dependencies
- STORY-001-001 (TypeScript Foundation Setup) - prerequisite

## Blockers
None identified

## Testing Notes
- Test with various prompt types: sales requests, follow-ups, meeting requests
- Verify streaming works with slow network conditions
- Validate content quality meets assignment requirements
- Test error scenarios: API failures, network timeouts, invalid prompts

---
**Created**: 2025-08-20
**Last Updated**: 2025-08-20