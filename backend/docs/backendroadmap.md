# 🧭 12-Week Backend Developer Roadmap (C# + ASP.NET Core)

> Goal: Move from REST basics → production-style backend engineering with authentication, databases, caching, and system thinking.

---

# A note on resources

**Microsoft Learn** covers Phases 1–2 well (C#, ASP.NET Core, EF Core, JWT) and is always free. It does **not** cover Redis internals, distributed systems, or system design depth — for those, use the dedicated resources listed in each phase.

Recurring resources worth bookmarking now:
- [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/) — official, free, structured paths for all .NET topics
- [Code-Maze](https://code-maze.com/) — practical ASP.NET Core tutorials, very hands-on
- [codewithmukesh.com](https://codewithmukesh.com/) — real-world .NET patterns with full source code
- *Designing Data-Intensive Applications* by Martin Kleppmann — the backend bible for Phases 3–4
- [System Design Primer (GitHub)](https://github.com/donnemartin/system-design-primer) — free, exhaustive
- [roadmap.sh/system-design](https://roadmap.sh/system-design) — community-curated system design path
- [Hussein Nasser on YouTube](https://www.youtube.com/@hnasr) — protocols, databases, backend internals

---

# 🟢 Phase 1 — C# + ASP.NET Core Foundations (Weeks 1–3)

## Week 1 — C# + .NET Refresh

### 🎯 Focus
- C# syntax (classes, interfaces, async/await)
- OOP principles
- .NET project structure
- NuGet basics

### 🛠 Build
- Console app: Task tracker (in-memory CRUD)

### 📚 Resources
- [C# fundamentals — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/) — free, official, structured
- [C# for Beginners — freeCodeCamp YouTube](https://www.youtube.com/watch?v=GhQdlIFylQ8) — 4-hour free video course
- *C# in Depth* by Jon Skeet — the best book once you have the basics

---

## Week 2 — ASP.NET Core Basics

### 🎯 Focus
- Controllers + routing
- Middleware pipeline
- Dependency Injection
- HTTP lifecycle

### 🛠 Build
- REST API (no DB yet): Users or Tasks

### 📚 Resources
- [ASP.NET Core Web API — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api) — official step-by-step tutorial
- [Free ASP.NET Core Web API Course — codewithmukesh.com](https://codewithmukesh.com/courses/dotnet-webapi-zero-to-hero/) — 125+ lessons covering REST, middleware, DI, and more
- [Julio Casal's free backend course for beginners — YouTube](https://www.youtube.com/@juliocasal) — highly rated, project-based

---

## Week 3 — Databases + EF Core

### 🎯 Focus
- Entity Framework Core
- SQL basics (joins, indexes)
- Migrations
- Repository pattern (light intro)

### 🛠 Build
- Full CRUD API with database

### 📚 Resources
- [EF Core for Beginners — Microsoft Learn (video series)](https://learn.microsoft.com/en-us/shows/entity-framework-core-for-beginners/) — official 5-part free series
- [learnentityframeworkcore.com](https://www.learnentityframeworkcore.com/) — free, comprehensive reference site
- [EF Core official docs](https://learn.microsoft.com/en-us/ef/core/) — reference for migrations, relationships, querying

---

# 🔐 Phase 2 — Authentication & Authorization (Weeks 4–5)

## Week 4 — Authentication (JWT)

### 🎯 Focus
- Password hashing (bcrypt concept)
- JWT structure
- Login vs signup flow
- Access vs refresh tokens

### 🛠 Build
- Auth system (register/login + JWT + protected routes)

### 📚 Resources
- [JWT Authentication in ASP.NET Core — Code-Maze](https://code-maze.com/authentication-aspnetcore-jwt-1/) — 3-part series covering auth, refresh tokens, and Angular integration
- [Configure JWT bearer authentication — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) — official reference
- [jwt.io](https://jwt.io/) — paste any token to inspect its header, payload, and signature

---

## Week 5 — Authorization

### 🎯 Focus
- Role-based access control (RBAC)
- Claims-based identity
- Policies in ASP.NET Core

### 🛠 Build
- Admin vs user roles system

### 📚 Resources
- [ASP.NET Core authorization — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction) — official docs covering roles, claims, and policies
- [Authentication and Authorization with JWT — Telerik Blog](https://www.telerik.com/blogs/asp-net-core-basics-authentication-authorization-jwt) — practical walkthrough with Swagger

---

# ⚙️ Phase 3 — Core Backend Engineering (Weeks 6–8)

## Week 6 — Databases Deep Dive

### 🎯 Focus
- Indexing
- Query optimization
- Transactions (ACID)
- N+1 problem

### 🛠 Build
- Optimize API + pagination/filtering

### 📚 Resources
- [Use The Index, Luke](https://use-the-index-luke.com/) — free, the best resource on SQL indexing that exists
- [EF Core performance docs — Microsoft Learn](https://learn.microsoft.com/en-us/ef/core/performance/) — covers N+1, compiled queries, bulk ops

---

## Week 7 — Caching (Redis)

### 🎯 Focus
- Caching strategies
- Cache invalidation
- Redis basics

### 🛠 Build
- Add caching layer to API

### 📚 Resources
- [Redis University — free courses](https://university.redis.io/) — official free courses covering all data types and patterns
- [Distributed caching in ASP.NET Core — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed) — how to wire Redis into your API
- [Repository Pattern with Caching — codewithmukesh.com](https://codewithmukesh.com/blog/repository-pattern-caching-hangfire-aspnet-core/) — practical cache-aside with Hangfire

---

## Week 8 — Background Jobs & Messaging

### 🎯 Focus
- Queues concept
- Background workers
- Async processing

### 🛠 Build
- Email simulation on signup
- Background job system

### 📚 Resources
- [Hangfire official docs](https://docs.hangfire.io/) — fire-and-forget, delayed, and recurring jobs in .NET
- [Background Jobs in .NET: Hangfire vs Queues vs Hosted Services](https://medium.com/real-world-net/background-jobs-in-net-hangfire-vs-queues-vs-hosted-services-b57412ca243b) — practical guide on choosing the right approach
- [ASP.NET Core Background Jobs — BoldSign Blog](https://boldsign.com/blogs/aspnet-core-background-jobs-hosted-services-hangfire-quartz/) — deep dive comparing Hosted Services, Hangfire, and Quartz.NET

---

# 🌐 Phase 4 — System Thinking (Weeks 9–10)

## Week 9 — API Design Best Practices

### 🎯 Focus
- Pagination
- Versioning
- Error handling
- Rate limiting

### 🛠 Build
- Refactor API into production style

### 📚 Resources
- [Microsoft REST API Guidelines (GitHub)](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md) — versioning, pagination, error formats
- [Stripe Engineering Blog](https://stripe.com/blog/engineering) — real-world API design decisions (versioning, idempotency, rate limiting)

---

## Week 10 — Observability & Reliability

### 🎯 Focus
- Logging
- Monitoring basics
- Retry patterns
- Idempotency

### 🛠 Build
- Add logging + failure simulation

### 📚 Resources
- [Logging in ASP.NET Core — Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/) — built-in logging and Serilog integration
- [Stripe's idempotency blog post](https://stripe.com/blog/idempotency) — the canonical reference on idempotency keys and retry safety

---

# 🚀 Phase 5 — Capstone + System Design (Weeks 11–12)

## Week 11 — Capstone Project

### 🎯 Build ONE:
- Blog API (Medium-like)
- E-commerce backend
- Task management SaaS backend

### Must include:
- Auth + roles
- DB + migrations
- Caching
- Logging
- Pagination

### 📚 Resources
- [codewithmukesh.com full .NET Web API course](https://codewithmukesh.com/courses/dotnet-webapi-zero-to-hero/) — covers all capstone requirements end-to-end
- [Code-Maze ASP.NET Core series](https://code-maze.com/asp-net-core-web-api-with-ef-core/) — full series from setup to deployment

---

## Week 12 — System Thinking + Polish

### 🎯 Focus
- Load balancing basics
- Scaling concepts
- Bottlenecks
- System design intro

### 🛠 Output
- Final polished GitHub project
- Swagger documentation
- Clean README

### 📚 Resources
- [System Design Primer (GitHub)](https://github.com/donnemartin/system-design-primer) — free, exhaustive coverage of every system design concept
- [roadmap.sh/system-design](https://roadmap.sh/system-design) — community-curated learning path
- *Designing Data-Intensive Applications* by Martin Kleppmann — start with Chapters 1 and 5

---

# 🧠 Final Rule

Each week:
- 70% BUILD
- 30% LEARN

Don't move on until your API actually works.

---

# 🏁 Outcome After 12 Weeks

You will be able to:
- Build production-style APIs in C#
- Implement secure authentication systems
- Work with databases properly (not just CRUD)
- Understand caching, queues, and performance
- Read real backend engineering blogs confidently
- Start thinking like a backend engineer, not just a coder