# README Writing Guide — Todo REST API

---

## Why write a README?

Your README is the first thing anyone sees when they find your project on GitHub. For a learning project like this one, it serves two purposes: telling others how to use it, and demonstrating to potential employers that you understand what you built and why you made the decisions you did.

---

## Section 1 — Project Title and Overview

**What to write:** A short paragraph (3-5 sentences) covering:
- What the project is
- What it does
- The key technology choices and why you made them

**Questions to answer in this section:**
- Why Node.js with no framework?
- Why the native MongoDB driver instead of Mongoose?
- What does the API actually do?

**Example structure:**
```
[Project name] is a REST API built with [what]. It does [what].
I chose [technology] because [reason]. I used [other technology] because [reason].
```

---

## Section 2 — Prerequisites

**What to write:** A simple list of what needs to be installed before the project can run. Include version numbers where relevant.

**Cover:**
- Node.js (minimum version)
- MongoDB (version you used)
- Any global tools needed

---

## Section 3 — Getting Started

**What to write:** Step-by-step instructions to get the project running locally. Assume the reader has the prerequisites installed but nothing else.

**Cover in order:**
1. Clone the repository
2. Install dependencies
3. Set up the `.env` file — list every required variable and what it should contain
4. Start MongoDB
5. Start the server
6. Confirm it's running

**Tip:** Actually follow your own steps on a fresh terminal to make sure they work before writing them down.

---

## Section 4 — Project Structure

**What to write:** The folder/file layout with a one-line explanation of each file's responsibility.

**Use a code block with comments:**
```
todo-api/
├── config/
│   └── db.js        ← explanation
├── utils/
│   └── ...          ← explanation
└── server.js        ← explanation
```

---

## Section 5 — API Reference

**What to write:** Every endpoint your API exposes. This is the most important section for anyone consuming your API.

**For each endpoint include:**
- Method and URL
- Description of what it does
- Request body (if applicable) — show the shape as JSON
- Success response — status code and response body shape
- Error responses — every possible error, its status code, and when it occurs

**Format each endpoint consistently. Example:**

```
### GET /todos
Returns all todos.

Response 200:
[{ "_id": "...", "title": "...", "completed": false, "date": "..." }]

---

### POST /todos
Creates a new todo.

Request body:
{ "title": "string" }

Response 201:
{ "_id": "...", "title": "...", "completed": false, "date": "..." }

Errors:
- 400: Title is missing or empty
```

Repeat this pattern for all 5 endpoints.

---

## Section 6 — Error Handling

**What to write:** A brief explanation of how your API handles errors consistently, and a reference table of all possible status codes.

**Cover:**
- The shape of every error response (e.g. always `{ "error": "message" }`)
- A table of status codes your API uses and what each means in context

---

## Section 7 — Key Decisions and Learnings (optional but valuable)

**What to write:** A short section explaining the non-obvious decisions you made. This is what separates a generic todo API README from one that shows genuine understanding.

**Ideas to cover:**
- Why no framework (what you learned about how Node actually works)
- Why native MongoDB driver (what you learned about the difference from Mongoose)
- The ObjectId conversion problem and why it matters
- How you structured the connection (connectDB once at startup vs per request)
- What you would do differently next time

This section won't mean much to someone just trying to use your API, but it means a lot to someone evaluating your understanding as a developer.

---

## Writing order

Write the sections in this order — it matches how the information flows naturally:

```
1. Project overview       (what and why)
2. Prerequisites          (what you need)
3. Getting started        (how to run it)
4. Project structure      (how it's organized)
5. API reference          (how to use it)
6. Error handling         (what can go wrong)
7. Key decisions          (what you learned)
```

---

## Before you publish

Run through this checklist:

```
□ Follow your own Getting Started steps on a fresh terminal — do they work?
□ Test every endpoint in the API Reference section — are the responses accurate?
□ Check all code blocks are properly formatted with backticks
□ Remove any sensitive information (no real credentials, no personal data)
□ Make sure your .env is in .gitignore before pushing
```