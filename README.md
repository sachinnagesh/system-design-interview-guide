# System Design Interview Guide — HLD + LLD

A free, interactive study guide for system design interviews. Covers both **High-Level Design** and **Low-Level Design** with real-world case studies, trade-off analysis, and a structured interview framework.

**Live site →** [system-design-interview-guide.vercel.app](https://system-design-interview-guide.vercel.app)

---

## What's Inside

**15 topics · 80+ concepts · 40+ case studies · Every concept with trade-offs**

### High-Level Design (8 topics)

| Topic | Concepts | Case Studies |
|-------|----------|-------------|
| ⚡ **Scalability** | Vertical vs Horizontal Scaling, Load Balancers, Stateless Architecture, Auto-scaling | Netflix (200M+ subs), Twitter/X (election surges) |
| 🗄️ **Databases** | SQL vs NoSQL, Sharding, Replication, Indexing, Partitioning | Instagram (sharding), Discord (Cassandra migration), Uber (polyglot persistence) |
| ⚡💾 **Caching** | Cache-Aside, Write-Through, Write-Behind, Eviction Policies, Redis vs Memcached | Facebook TAO, Twitter timeline fan-out, Stack Overflow multi-layer cache |
| 📨 **Message Queues** | Kafka, RabbitMQ/SQS, Pub/Sub, At-Least-Once vs Exactly-Once, Back-pressure | LinkedIn (Kafka origin story), Uber (async dispatch), DoorDash (order pipeline) |
| 🌐 **CDN & Networking** | CDN, DNS, TCP vs UDP, HTTP vs WebSockets vs SSE, Edge Computing | Netflix Open Connect, Discord WebSockets, Cloudflare anycast DDoS |
| ⚖️ **CAP & Consistency** | CAP Theorem, Strong vs Eventual Consistency, ACID, BASE, Isolation Levels | Amazon DynamoDB (AP), Banking systems (CP), Google Spanner (TrueTime) |
| 🔧 **Microservices** | Monolith vs Microservices, API Gateway, Service Discovery, Circuit Breaker, Saga Pattern | Amazon (two-pizza teams), Netflix Hystrix, Spotify squads |
| 🚦 **Rate Limiting** | Token Bucket, Leaky Bucket, Fixed Window, Sliding Window, Distributed Rate Limiting | GitHub API limits, Stripe fraud prevention, Cloudflare edge limiting |

### Low-Level Design (6 topics)

| Topic | Concepts | Case Studies |
|-------|----------|-------------|
| 🎯 **OOP Principles** | Encapsulation, Inheritance, Polymorphism, Abstraction, Composition over Inheritance | Java Collections Framework, Stripe payment processor |
| 📐 **SOLID Principles** | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion | Spring Framework DI, AWS SDK design |
| 🏗️ **Design Patterns** | Singleton, Factory, Observer, Strategy, Decorator, Builder | React state (Observer), Java I/O (Decorator), Spring (combined patterns) |
| 🔄 **Concurrency** | Threads vs Processes, Locks/Mutex/Semaphore, Deadlock, Async/Await, Producer-Consumer | Node.js event loop, Java ConcurrentHashMap, Go goroutines |
| 🔌 **API Design** | REST, GraphQL, gRPC, Idempotency, Versioning, Pagination | Stripe idempotency keys, GitHub cursor pagination, Facebook GraphQL |
| 📊 **Schema & Modeling** | Normalization, Denormalization, Indexing Strategy, Soft Deletes, Embedding vs Referencing | Instagram feed denormalization, Shopify multi-tenant, Airbnb soft deletes |

### Interview Framework (1 topic)

A structured 5-step approach to answering any system design question — clarify requirements, capacity estimation, high-level design, deep dive, bottlenecks — with complete FAANG walkthrough examples.

---

## Features

- **Trade-off panels** for every concept (Pros / Cons / When to use)
- **Real case studies** from Netflix, Uber, Discord, Instagram, Stripe, Amazon, Google, and more
- **Interview tips** with exact talking points for each topic
- **Category filters** (HLD / LLD / Framework) for focused studying
- **Responsive design** — works on desktop, tablet, and mobile
- **Dark theme** optimized for reading
- **Zero external dependencies** — just React and Next.js
- **No tracking, no ads, no data collection**

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher

### Run Locally

```bash
git clone https://github.com/sachinnagesh/system-design-interview-guide.git
cd system-design-interview-guide
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/system-design-interview-guide)

Or manually:

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Click Deploy

### Other Platforms

Works on **Netlify**, **Cloudflare Pages**, **Railway**, **Docker**, or any Node.js host. See [Next.js deployment docs](https://nextjs.org/docs/deployment) for details.

---

## Project Structure

```
├── app/
│   ├── layout.jsx              # Root layout, metadata, SEO
│   └── page.jsx                # Home page
├── components/
│   └── SystemDesignGuide.jsx   # Main component (all content + UI)
├── public/
│   ├── robots.txt              # Search engine crawling
│   └── sitemap.xml             # Search engine indexing
├── package.json
├── next.config.js
├── jsconfig.json
└── README.md
```

All content lives in `components/SystemDesignGuide.jsx` inside the `topics` array. Each topic follows this structure:

```javascript
{
  id: "scalability",
  category: "HLD",            // HLD | LLD | FRAMEWORK
  icon: "⚡",
  title: "Scalability",
  color: "#00D4FF",
  tagline: "Handle more load without breaking",
  simple: "ELI5 explanation...",
  concepts: [
    {
      name: "Horizontal Scaling",
      desc: "Description...",
      tradeoffs: {
        pros: ["..."],
        cons: ["..."]
      },
      when: "When to use...",
      interview: "What to say in an interview..."
    }
  ],
  use_cases: [
    {
      company: "Netflix",
      title: "Handling 200M+ subscribers",
      problem: "...",
      solution: "...",
      tradeoff: "...",
      takeaway: "..."
    }
  ],
  interview_tips: ["...", "..."]
}
```

---

## Contributing

Contributions are welcome. You can:

- **Add a topic** — add a new object to the `topics` array
- **Add concepts** — expand the `concepts` array within a topic
- **Add case studies** — add to the `use_cases` array
- **Fix errors** — correct any inaccuracies in explanations
- **Improve UI** — enhance the responsive design or interactions

### How to Contribute

1. Fork this repository
2. Create a branch: `git checkout -b add-new-topic`
3. Make your changes in `components/SystemDesignGuide.jsx`
4. Test locally: `npm run dev`
5. Submit a pull request

Please keep the same content structure and tone. Every concept should include trade-offs (pros/cons), a "when to use" section, and an interview tip.

---

## Study Plan

A suggested 4-week preparation schedule:

**Week 1 — HLD Foundations**
- Day 1–2: Scalability, Databases
- Day 3–4: Caching, Message Queues
- Day 5–6: CDN & Networking, CAP & Consistency
- Day 7: Microservices, Rate Limiting

**Week 2 — LLD Foundations**
- Day 1–2: OOP Principles, SOLID
- Day 3–4: Design Patterns, Concurrency
- Day 5–6: API Design, Schema & Modeling
- Day 7: Review all LLD topics

**Week 3 — Deep Dive & Case Studies**
- Read every case study across all topics
- Practice explaining trade-offs aloud
- Draw architecture diagrams on paper/whiteboard

**Week 4 — Mock Interviews**
- Use the Interview Framework topic as your template
- Practice 2 full mock interviews per day
- Review weak areas using the guide

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 14
- **UI:** [React](https://react.dev/) 18
- **Styling:** Inline CSS (zero dependencies)
- **Fonts:** Google Fonts (Playfair Display, DM Sans, DM Mono)
- **Hosting:** [Vercel](https://vercel.com/)

---

## License

MIT — free to use, modify, and distribute.

---

## Acknowledgments

Content is synthesized from publicly available engineering blogs, conference talks, and documentation from companies including Netflix, Uber, Discord, Instagram, Stripe, Amazon, Google, Facebook, LinkedIn, Spotify, Cloudflare, DoorDash, Shopify, and Airbnb.

---

**If this helped you prepare for interviews, consider giving it a ⭐ on GitHub.**