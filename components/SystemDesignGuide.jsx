import { useState } from "react";

const topics = [
  // ============ HIGH LEVEL DESIGN ============
  {
    id: "scalability",
    category: "HLD",
    icon: "⚡",
    title: "Scalability",
    color: "#00D4FF",
    tagline: "Handle more load without breaking",
    simple: "Scalability means your system can handle more users or data without crashing or slowing down — like a highway that can add more lanes when traffic grows.",
    concepts: [
      {
        name: "Vertical Scaling (Scale Up)",
        desc: "Add more power to the same machine — more RAM, faster CPU. Simple but has limits. Like upgrading your laptop.",
        tradeoffs: {
          pros: ["Simple — no code changes", "No data distribution complexity", "Strong consistency stays easy"],
          cons: ["Hardware ceiling (you can only buy so much RAM)", "Single point of failure", "Downtime needed to upgrade", "Cost grows non-linearly (a 2x faster CPU costs 5x)"]
        },
        when: "Use early-stage apps, internal tools, or databases that need strong consistency.",
        interview: "Mention limits: single point of failure, hardware ceiling, downtime during upgrade."
      },
      {
        name: "Horizontal Scaling (Scale Out)",
        desc: "Add more machines to share the load. Harder to set up but nearly unlimited growth. Like hiring more workers instead of one super-worker.",
        tradeoffs: {
          pros: ["Near-unlimited scale", "Failure of one node doesn't kill the system", "Cost scales linearly with commodity hardware"],
          cons: ["Requires stateless services or session affinity", "Distributed systems complexity (CAP, network failures)", "Data partitioning becomes a problem", "Debugging is harder across nodes"]
        },
        when: "Use for any system expected to grow, especially user-facing web apps.",
        interview: "Preferred for most modern systems. Leads to discussions on load balancing & statelessness."
      },
      {
        name: "Load Balancer",
        desc: "Sits in front of your servers and distributes traffic evenly. If one server dies, others handle the load. Like a traffic cop at an intersection.",
        tradeoffs: {
          pros: ["Distributes load evenly", "Health checks remove dead servers automatically", "Enables zero-downtime deploys"],
          cons: ["Itself becomes a single point of failure (need redundant LBs)", "Adds 1-2ms latency", "Layer 7 LBs are CPU-intensive (need to parse HTTP)"]
        },
        when: "Always — even single-server apps benefit from a LB for SSL termination and future-proofing.",
        interview: "Common algorithms: Round Robin, Least Connections, IP Hash. Can be Layer 4 (TCP) or Layer 7 (HTTP)."
      },
      {
        name: "Stateless vs Stateful",
        desc: "Stateless: server stores no user data between requests. Stateful: server remembers things about you. Stateless scales easily.",
        tradeoffs: {
          pros: ["Stateless: any server can handle any request", "Easy to add/remove servers", "Simple load balancing"],
          cons: ["Stateless requires external session storage (Redis)", "Each request carries more data (auth tokens, etc.)", "Stateful has lower latency but harder to scale"]
        },
        when: "Default to stateless for web tier. Use stateful only when you need ultra-low latency (gaming, trading).",
        interview: "If asked 'how do you handle sessions?', answer: store in Redis with a session ID cookie."
      }
    ],
    use_cases: [
      {
        company: "Netflix",
        title: "Handling 200M+ subscribers globally",
        problem: "When everyone watches Stranger Things at 9 PM on a Friday, traffic spikes 10x. A single server would melt.",
        solution: "Netflix runs thousands of stateless microservices on AWS that auto-scale horizontally. AWS ELB (Elastic Load Balancer) distributes traffic across servers in multiple availability zones. When CPU usage hits 60%, new instances spin up automatically. When the spike ends, they shut down to save cost.",
        tradeoff: "Auto-scaling has a 2-5 minute warm-up time. To handle sudden spikes, Netflix keeps a buffer of pre-warmed instances — costing extra but worth it during launches.",
        takeaway: "Stateless services + auto-scaling + load balancers = handle any spike. The key insight: any server can handle any request because no session data is stored locally."
      },
      {
        company: "Twitter/X",
        title: "Election night traffic surges",
        problem: "During major events, tweets per second jump from 5K to 150K+. Static infrastructure would crash within minutes.",
        solution: "Twitter uses horizontal scaling with consistent hashing for tweet storage. Multiple read replicas of the timeline service handle the read-heavy load. They pre-warm caches before predicted events using their 'Decider' system that gradually rolls out load.",
        tradeoff: "Pre-warming costs money in idle capacity. Twitter accepts this cost because failing during the Super Bowl is a brand-damaging event.",
        takeaway: "Predict and prepare. Horizontal scaling alone isn't enough — you need warm capacity ready for predictable spikes."
      }
    ],
    interview_tips: [
      "Always clarify: read-heavy or write-heavy system?",
      "Start with vertical, mention horizontal when limits are hit",
      "Draw the load balancer explicitly in your diagram",
      "Mention auto-scaling triggers (CPU %, request rate, queue depth)"
    ]
  },
  {
    id: "databases",
    category: "HLD",
    icon: "🗄️",
    title: "Databases",
    color: "#FF6B6B",
    tagline: "Where your data lives",
    simple: "A database is an organized way to store and retrieve data. Think of it like a giant spreadsheet (SQL) or a folder full of documents (NoSQL).",
    concepts: [
      {
        name: "SQL (Relational)",
        desc: "Data in tables with rows and columns. Relationships between tables. Strong consistency. Examples: PostgreSQL, MySQL.",
        tradeoffs: {
          pros: ["ACID transactions (data is always correct)", "Powerful queries with JOINs", "Mature ecosystem (40+ years of tools)", "Strong consistency by default"],
          cons: ["Vertical scaling is the easy path; horizontal scaling is hard", "Schema changes require migrations", "JOINs across millions of rows are slow"]
        },
        when: "Use for: financial transactions, e-commerce orders, anything where data must be exactly right.",
        interview: "Use for: transactions, structured data, complex queries (e.g., banking, e-commerce orders)."
      },
      {
        name: "NoSQL",
        desc: "Flexible schema. Scales horizontally well. Types: Key-Value (Redis), Document (MongoDB), Column (Cassandra), Graph (Neo4j).",
        tradeoffs: {
          pros: ["Scales horizontally with ease", "Schema flexibility (just add fields)", "Great for specific patterns (key-value, time-series)"],
          cons: ["Usually eventual consistency (you read stale data sometimes)", "No JOINs — denormalize and duplicate data", "Querying outside your access pattern is painful or impossible"]
        },
        when: "Use for: massive scale, flexible/changing schemas, simple access patterns (get-by-key).",
        interview: "Use for: unstructured data, massive scale, flexible schema (e.g., social feeds, catalogs)."
      },
      {
        name: "Database Sharding",
        desc: "Split your database into smaller pieces (shards) across multiple machines. Each shard holds a subset of data. Like splitting a phone book A-M and N-Z.",
        tradeoffs: {
          pros: ["Scale beyond a single machine's limits", "Failure of one shard doesn't affect others", "Parallel queries can be fast"],
          cons: ["Cross-shard queries are slow or impossible", "Re-sharding is painful (moving data)", "Hot shards if shard key is poorly chosen", "Joins across shards = nightmare"]
        },
        when: "Only when a single machine's capacity isn't enough. Don't shard prematurely.",
        interview: "Shard key choice is critical. Common strategies: range-based, hash-based, directory-based."
      },
      {
        name: "Replication",
        desc: "Copy data to multiple servers. Primary handles writes, replicas handle reads. Improves availability and read performance.",
        tradeoffs: {
          pros: ["More read throughput (read from any replica)", "High availability (failover to replica)", "Geographic distribution for low latency"],
          cons: ["Replication lag — replicas might be milliseconds behind", "Stale reads possible from replicas", "More expensive (multiple copies)", "Async replication can lose data on failover"]
        },
        when: "Read-heavy workloads. Always replicate for any production system.",
        interview: "Sync vs Async replication. Leader-follower vs leaderless (Dynamo-style)."
      },
      {
        name: "Indexes",
        desc: "A separate data structure that maps column values to row locations. Like the index at the back of a book.",
        tradeoffs: {
          pros: ["Reads become 1000x faster (O(log n) vs O(n))", "Enable efficient range queries", "Power ORDER BY without sorting"],
          cons: ["Writes become slower (must update index too)", "Indexes take disk space (can double your DB size)", "Wrong index = useless or counter-productive"]
        },
        when: "Index columns used in WHERE, JOIN, ORDER BY. Don't index everything — too many indexes hurt writes.",
        interview: "B-tree indexes are default. Hash indexes for exact matches. Composite indexes follow leftmost-prefix rule."
      }
    ],
    use_cases: [
      {
        company: "Instagram",
        title: "Storing 500M+ photos and metadata",
        problem: "Single PostgreSQL instance couldn't handle billions of photo records and the queries needed to render feeds in <100ms.",
        solution: "Instagram shards PostgreSQL by user ID. Each shard contains a subset of users and all their data. They use logical shards (thousands) mapped to physical machines, so they can rebalance without changing app code. Photo metadata is in PostgreSQL; actual images go to S3.",
        tradeoff: "Sharding by user ID means user A can't easily query user B's data. Cross-user features (search, trending) need separate denormalized indexes — costing extra storage and write amplification.",
        takeaway: "Shard by access pattern. User ID is a great shard key because most queries are 'show me MY data'. Separate hot data (metadata) from large blobs (photos)."
      },
      {
        company: "Discord",
        title: "Trillions of chat messages",
        problem: "MongoDB couldn't keep up. Hot partitions and increasing memory pressure made queries unpredictable.",
        solution: "Migrated to Cassandra (later ScyllaDB) for messages. Partition key: (channel_id, bucket) where bucket = time-window. This means messages from the same channel/time live together on disk, making 'load latest 50 messages' a single fast read. They use Redis for online presence.",
        tradeoff: "Cassandra's eventual consistency means a message might appear out of order for a few milliseconds. Discord accepted this — chat order is rarely critical, and the throughput gain was massive.",
        takeaway: "Choose database based on access pattern. Wide-column stores (Cassandra) excel at time-series data with known partition keys."
      },
      {
        company: "Uber",
        title: "Driver-rider matching at scale",
        problem: "Need to find nearest available drivers from millions of moving locations in real-time, while also storing trip history reliably.",
        solution: "Uber uses multiple databases: Schemaless (built on MySQL) for ride records (ACID needed for billing), Cassandra for high-write data, and Redis for real-time driver locations using GEOHASH. Trip data lives in MySQL because financial accuracy matters.",
        tradeoff: "Multiple databases = multiple things to operate, monitor, and keep in sync. Uber pays this cost because no single DB does everything well at their scale.",
        takeaway: "Polyglot persistence: use different databases for different needs. Money = SQL. Real-time location = Redis. Logs = NoSQL."
      }
    ],
    interview_tips: [
      "SQL vs NoSQL is about tradeoffs, not one being 'better'",
      "Mention CAP theorem when discussing distributed databases",
      "Index your columns — most performance questions involve missing indexes",
      "Always justify shard key choice with the access pattern"
    ]
  },
  {
    id: "caching",
    category: "HLD",
    icon: "🚀",
    title: "Caching",
    color: "#FFD93D",
    tagline: "Store it once, serve it fast",
    simple: "Caching is like keeping your most-used tools on your desk instead of walking to the storage room every time. Store frequently accessed data in fast memory so you don't hit the slow database repeatedly.",
    concepts: [
      {
        name: "Cache-Aside (Lazy Loading)",
        desc: "App checks cache first. If not found (cache miss), fetch from DB and store in cache. Most common pattern.",
        tradeoffs: {
          pros: ["Simple to implement", "Only cache what's actually used", "Cache failures don't break the app (fall through to DB)"],
          cons: ["Cache miss = slow first request", "Stale data possible", "Thundering herd: many cache misses at once can overwhelm DB"]
        },
        when: "Default choice for read-heavy systems. Use this 80% of the time.",
        interview: "Risk: stale data. Mitigate with TTL (time-to-live). Good for read-heavy workloads."
      },
      {
        name: "Write-Through",
        desc: "Write to cache AND database simultaneously. Data always fresh. Slower writes but consistent reads.",
        tradeoffs: {
          pros: ["Cache always fresh", "Reads are always fast (no cache miss after writes)", "Simpler consistency"],
          cons: ["Writes are slower (two systems updated)", "Cache fills with data that may never be read", "More expensive in cache memory"]
        },
        when: "Write rare, read often, and freshness is critical (e.g., user profile pages).",
        interview: "Trade-off: write latency increases. Use when fresh reads are critical."
      },
      {
        name: "Write-Behind (Write-Back)",
        desc: "Write to cache only. Cache flushes to DB asynchronously in batches. Fast writes but risk of data loss.",
        tradeoffs: {
          pros: ["Very fast writes", "Reduces DB write load (batching)", "Great for write-heavy workloads"],
          cons: ["Data loss if cache crashes before flush", "Complex to implement correctly", "Read-after-write consistency requires extra care"]
        },
        when: "Use for analytics, metrics, or any case where some data loss is acceptable.",
        interview: "Don't use for financial data. Mention durability concerns."
      },
      {
        name: "Redis vs Memcached",
        desc: "Redis: supports rich data types (lists, sets, sorted sets), persistence, pub/sub. Memcached: simpler, faster for pure key-value.",
        tradeoffs: {
          pros: ["Redis: rich data structures (sorted sets for leaderboards)", "Redis: persistence (recovers after restart)", "Memcached: simpler, marginally faster for pure key-value"],
          cons: ["Redis: more memory overhead", "Memcached: no persistence (cold start is brutal)", "Memcached: limited data types"]
        },
        when: "Use Redis 95% of the time. Memcached only if you literally need just key-value at extreme scale.",
        interview: "Redis is almost always the answer in interviews. Mention it for rate limiting, sessions, leaderboards."
      },
      {
        name: "Cache Eviction Policies",
        desc: "LRU (Least Recently Used): evict oldest unused item. LFU: evict least accessed. FIFO: evict oldest inserted.",
        tradeoffs: {
          pros: ["LRU: simple, works well for most patterns", "LFU: better when access patterns are stable", "TTL-based: auto-cleanup, predictable memory"],
          cons: ["LRU: a one-time scan can flush hot data", "LFU: complex to track, slow updates", "FIFO: ignores actual usage patterns"]
        },
        when: "LRU is the default. Switch to LFU only if you measure that LRU isn't working.",
        interview: "LRU is the default correct answer. Explain the eviction reasoning."
      }
    ],
    use_cases: [
      {
        company: "Facebook",
        title: "TAO + Memcached for the social graph",
        problem: "Every page load needs hundreds of queries: friends, posts, likes, comments. Hitting MySQL for each = pages take 10+ seconds.",
        solution: "Facebook built TAO, a graph cache layer on top of Memcached and MySQL. 99%+ of reads are served from Memcached. They have multiple tiers: regional caches near data centers, and edge caches near users. Cache invalidation uses the McSqueal protocol to broadcast updates.",
        tradeoff: "Cache invalidation across regions takes ~100ms — so you might see your own like appear, refresh, and briefly see it disappear. Facebook accepted this for the throughput gain.",
        takeaway: "When read:write ratio is 500:1 (typical for social), caching isn't optional — it's the primary path. The DB becomes a backup."
      },
      {
        company: "Twitter/X",
        title: "Home timeline pre-computation",
        problem: "Computing 'who are my friends and what did they post' on every refresh would require thousands of DB lookups per user.",
        solution: "Twitter uses Redis to pre-compute timelines. When you tweet, a fan-out service writes your tweet ID to all your followers' Redis lists (sorted set, scored by time). Loading your timeline = single Redis call returning a list of tweet IDs. Celebrities (with 50M+ followers) are excluded from fan-out and merged in on read.",
        tradeoff: "Fan-out write cost is huge: a tweet from someone with 1M followers triggers 1M Redis writes. Twitter paid this cost to make reads (the more frequent operation) instant.",
        takeaway: "Trade write-time computation for fast reads. Hybrid approach (push for normal, pull for celebrities) handles edge cases."
      },
      {
        company: "Stack Overflow",
        title: "Serving billions of pageviews on minimal hardware",
        problem: "Same questions get viewed millions of times. Recomputing the rendered HTML every time wastes resources.",
        solution: "Stack Overflow caches at multiple layers: Redis for query results, in-process .NET caches for hot data, and CDN-cached HTML for popular questions. They run on surprisingly few servers because 90%+ of traffic never reaches the database.",
        tradeoff: "Multi-layer caching means edits to a question take seconds to propagate everywhere. Stack Overflow accepts this — a few seconds of staleness is fine for Q&A content.",
        takeaway: "Cache the most expensive thing — often that's the rendered output, not just the raw data. Multi-layer caching compounds savings."
      }
    ],
    interview_tips: [
      "Always mention what to cache: DB query results, computed data, sessions",
      "State the cache invalidation strategy — it's the hardest problem",
      "CDN = cache for static assets at the edge",
      "Mention TTL values explicitly (e.g., 'cache user profiles for 5 min')"
    ]
  },
  {
    id: "messaging",
    category: "HLD",
    icon: "📨",
    title: "Message Queues",
    color: "#C77DFF",
    tagline: "Decouple and async everything",
    simple: "A message queue is like a to-do list between services. Service A drops a task in the queue and moves on. Service B picks it up when ready. They never need to wait for each other.",
    concepts: [
      {
        name: "Why Use Queues?",
        desc: "Decouple producers from consumers. Handle traffic spikes by buffering. Enable retry logic. Process tasks asynchronously.",
        tradeoffs: {
          pros: ["Decouples services (A doesn't know about B)", "Buffers traffic spikes", "Built-in retry semantics", "Enables async processing"],
          cons: ["Adds latency (not instant)", "Eventual consistency", "Another component to operate", "Debugging is harder (where's my message?)"]
        },
        when: "Use whenever the producer doesn't need an immediate response from the consumer.",
        interview: "Classic use: sending emails, processing payments, image resizing after upload."
      },
      {
        name: "Kafka",
        desc: "Distributed event streaming. Retains messages for configurable time. Multiple consumers can read independently. High throughput.",
        tradeoffs: {
          pros: ["Massive throughput (millions of messages/sec)", "Replay messages (e.g., re-process last week's events)", "Multiple consumers read same data independently", "Durable on disk"],
          cons: ["Complex to operate (Zookeeper, brokers, partitions)", "Higher latency than pure in-memory queues", "Overkill for simple task queues"]
        },
        when: "Use for event sourcing, analytics pipelines, log aggregation, microservice events.",
        interview: "Use for event sourcing, audit logs, real-time analytics. Topics → Partitions → Offsets."
      },
      {
        name: "RabbitMQ / SQS",
        desc: "Traditional message brokers. Message delivered once (usually). Simpler than Kafka. SQS is AWS-managed.",
        tradeoffs: {
          pros: ["Simple mental model (queue → consumer)", "Built-in retry and DLQ", "SQS is fully managed (no ops)", "RabbitMQ supports complex routing"],
          cons: ["Lower throughput than Kafka", "Once consumed, message is gone (no replay)", "Order is per-queue, not strict"]
        },
        when: "RabbitMQ for complex routing or task queues. SQS for AWS-native, simple async tasks.",
        interview: "RabbitMQ for complex routing. SQS for simple, managed queue. Mention dead-letter queues."
      },
      {
        name: "Pub/Sub Pattern",
        desc: "Publishers emit events to a topic. Multiple subscribers receive them independently. Loose coupling at scale.",
        tradeoffs: {
          pros: ["One event triggers N reactions", "Easy to add new subscribers without changing publisher", "Natural fit for event-driven architecture"],
          cons: ["Hard to know who's subscribed (debugging)", "Subscriber failures are independent (one might miss events)", "Schema changes affect many consumers"]
        },
        when: "Use when one event needs to fan out to many independent reactions.",
        interview: "Good for notifications, fan-out scenarios (one event → many services react)."
      },
      {
        name: "At-Least-Once vs Exactly-Once Delivery",
        desc: "At-least-once: message might be delivered twice. Exactly-once: delivered exactly once (very hard). Most queues are at-least-once.",
        tradeoffs: {
          pros: ["At-least-once: simple, fast, reliable", "Exactly-once: no duplicates, simpler consumer logic"],
          cons: ["At-least-once: consumers must be idempotent", "Exactly-once: complex, slower, often theoretical"]
        },
        when: "Default to at-least-once + idempotent consumers. Exactly-once only when truly needed.",
        interview: "Make consumers idempotent (use unique message IDs to dedupe). This is the standard pattern."
      }
    ],
    use_cases: [
      {
        company: "LinkedIn",
        title: "The birthplace of Kafka",
        problem: "LinkedIn had 100+ services and they all needed each other's data. Point-to-point integrations created an unmaintainable spaghetti mess.",
        solution: "LinkedIn built Kafka as a central nervous system. Every service publishes events to Kafka topics (user signed up, profile viewed, message sent). Other services subscribe to topics they care about. Result: services don't know about each other, just topics. They process trillions of messages per day across thousands of topics.",
        tradeoff: "Centralizing on Kafka means it becomes a critical dependency. If Kafka goes down, the whole company stops. LinkedIn invested heavily in Kafka reliability and multi-cluster setups.",
        takeaway: "Kafka inverts dependencies. Instead of A calling B calling C, all three publish/subscribe to a central log. New services plug in without touching existing ones."
      },
      {
        company: "Uber",
        title: "Surge pricing and ride dispatch",
        problem: "When you request a ride, the system needs to: find drivers, calculate price, send notifications, update analytics, log for fraud detection. Doing this synchronously = users wait forever.",
        solution: "Uber uses Kafka heavily. The ride request publishes one event; multiple consumers react: dispatch service finds drivers, pricing service calculates surge, notification service alerts the driver, analytics consumes events for ML models. Each service moves at its own pace.",
        tradeoff: "Async processing means the user sees 'finding driver...' for 2-3 seconds while events propagate. This is acceptable UX but requires careful loading state design.",
        takeaway: "Async + pub/sub lets one event trigger N parallel reactions. Critical path stays fast (just publish), heavy work happens after."
      },
      {
        company: "DoorDash",
        title: "Order processing pipeline",
        problem: "An order goes through 10+ stages: payment, restaurant notify, dasher assignment, ETA calc, delivery tracking. If any step fails, you can't lose the order.",
        solution: "DoorDash uses SQS for task queues with dead-letter queues (DLQ) for failures. Each stage is a worker that pulls from a queue, processes, then publishes to the next queue. Failed messages go to DLQ for retry or manual review. They use exponential backoff for retries.",
        tradeoff: "Multi-stage async pipelines mean a single order touches 10+ queues — operationally complex. DoorDash builds tooling to trace orders across stages, which is significant engineering investment.",
        takeaway: "Queues provide durability and retry semantics for free. DLQ is non-negotiable — you must have a place for poison messages to go."
      }
    ],
    interview_tips: [
      "Use queues whenever you see 'async processing' or 'decouple services'",
      "Always mention what happens on failure — retries, DLQ (dead-letter queue)",
      "Kafka = event log (replay-able). RabbitMQ/SQS = task queue (consumed once)",
      "Make consumers idempotent — assume duplicate delivery"
    ]
  },
  {
    id: "cdn",
    category: "HLD",
    icon: "🌐",
    title: "CDN & Networking",
    color: "#06D6A0",
    tagline: "Serve content close to the user",
    simple: "A CDN (Content Delivery Network) is a network of servers spread around the world. Instead of all users hitting your one server in New York, a user in Tokyo gets content from a nearby Tokyo server. Fast!",
    concepts: [
      {
        name: "How CDN Works",
        desc: "Edge servers cache your static content (images, CSS, JS, videos). First request fetches from origin, subsequent requests served from edge (cache hit).",
        tradeoffs: {
          pros: ["Massive latency reduction (200ms → 20ms)", "Reduces origin load", "DDoS protection (absorbs attacks at edge)", "Bandwidth cost savings"],
          cons: ["Costs money for CDN service", "Cache invalidation across edges takes minutes", "Hard to use for personalized content", "Not free if you have low traffic"]
        },
        when: "Always use for static assets (images, JS, CSS). For dynamic content, evaluate edge caching with short TTLs.",
        interview: "Examples: Cloudflare, AWS CloudFront, Akamai. Reduces latency + origin server load."
      },
      {
        name: "DNS",
        desc: "Translates domain names to IP addresses. Like the internet's phone book. DNS load balancing can route users to nearest server.",
        tradeoffs: {
          pros: ["Free, ubiquitous, well-understood", "GeoDNS routes users globally", "TTL caching reduces lookups"],
          cons: ["Propagation delays (TTL means changes take minutes)", "DNS hijacking is a real attack", "Not real load balancing — clients cache results"]
        },
        when: "Always. For multi-region deployments, GeoDNS is the first layer of routing.",
        interview: "Mention TTL, DNS propagation delays. GeoDNS routes users to closest region."
      },
      {
        name: "TCP vs UDP",
        desc: "TCP: reliable, ordered, connection-based. UDP: fast, no guarantee, connectionless. TCP for web. UDP for video streaming, games.",
        tradeoffs: {
          pros: ["TCP: reliable, ordered, no app-level retry needed", "UDP: low latency, no handshake overhead", "UDP: better for real-time (one lost packet ≠ buffering)"],
          cons: ["TCP: 3-way handshake adds latency", "TCP: head-of-line blocking", "UDP: app must handle packet loss/reordering"]
        },
        when: "TCP for web, files, anything where correctness matters. UDP for video/voice/gaming where latency wins over correctness.",
        interview: "HTTP/3 uses QUIC (UDP-based) for speed. WebSockets use TCP."
      },
      {
        name: "HTTP vs WebSockets vs SSE",
        desc: "HTTP: request-response, stateless. WebSockets: persistent two-way. Server-Sent Events: server pushes to client only.",
        tradeoffs: {
          pros: ["HTTP: stateless, scales easily, cacheable", "WebSockets: full duplex, low latency, real-time", "SSE: simpler than WS, auto-reconnect"],
          cons: ["HTTP: polling for updates is wasteful", "WebSockets: persistent connections expensive", "WS: harder to scale (load balancers, sticky sessions)"]
        },
        when: "HTTP for most APIs. WebSockets for chat, gaming, live collaboration. SSE for one-way feeds (live scores, notifications).",
        interview: "Long polling is a fallback when WebSockets aren't available."
      }
    ],
    use_cases: [
      {
        company: "Netflix",
        title: "Open Connect — their own CDN",
        problem: "Netflix is 15%+ of global internet traffic. Buying that much CDN bandwidth from Akamai/CloudFront would bankrupt them.",
        solution: "Netflix built Open Connect: custom servers placed inside ISPs around the world. When you watch a show, the video streams from a server inside your ISP's data center — never crossing the public internet. They pre-position popular content overnight when networks are idle.",
        tradeoff: "Building/maintaining a global CDN requires huge engineering investment and ongoing relationships with ISPs. Only worth it at extreme scale — most companies should use Cloudflare/CloudFront.",
        takeaway: "At extreme scale, building your own CDN is cheaper than buying. Pre-positioning content based on prediction beats reactive caching."
      },
      {
        company: "Discord",
        title: "WebSockets for real-time chat (millions concurrent)",
        problem: "Polling for new messages every second × millions of users = server meltdown. Plus messages would feel laggy.",
        solution: "Discord uses WebSockets so each user has a persistent connection. When someone sends a message, Discord pushes it instantly to all connected users in that channel. They use Elixir/Erlang for the WebSocket gateway because the BEAM VM handles millions of lightweight processes per server.",
        tradeoff: "Persistent connections mean a server reboot kicks everyone off. Discord built sophisticated reconnection logic and uses zero-downtime deploys to minimize disruption.",
        takeaway: "WebSockets are the right primitive for real-time. Choose your runtime carefully — most languages can't handle millions of persistent connections per box."
      },
      {
        company: "Cloudflare",
        title: "DDoS protection via global edge",
        problem: "A site getting hit with 1 Tbps of attack traffic can't handle it locally. Even huge servers crumble.",
        solution: "Cloudflare's anycast network has 300+ data centers. When traffic comes in, BGP routes it to the nearest edge. Attack traffic spreads across the entire network instead of hitting one location, where it's filtered. Legitimate traffic gets cached responses.",
        tradeoff: "Routing through Cloudflare adds 1-5ms of latency and means trusting them with your TLS keys. Most companies accept this for the security and performance gains.",
        takeaway: "Anycast + global edge = absorb attacks by dividing them. CDN is not just performance — it's also security."
      }
    ],
    interview_tips: [
      "CDN = always mention for media-heavy systems",
      "WebSockets for real-time features (chat, live scores)",
      "Latency vs throughput: latency = time for one request, throughput = requests per second",
      "Mention typical CDN latencies: 20-50ms vs 200ms+ from origin"
    ]
  },
  {
    id: "consistency",
    category: "HLD",
    icon: "⚖️",
    title: "CAP & Consistency",
    color: "#FF9F1C",
    tagline: "The unavoidable trade-offs",
    simple: "In distributed systems, you can't have everything. The CAP theorem says: during a network failure, you must choose between keeping data consistent OR staying available. You can't have both.",
    concepts: [
      {
        name: "CAP Theorem",
        desc: "Consistency (all nodes see same data), Availability (system always responds), Partition Tolerance (works despite network splits). Pick 2 of 3. In practice: P is unavoidable, so it's CP vs AP.",
        tradeoffs: {
          pros: ["CP: data is always correct or unavailable", "AP: system is always responsive", "Forces clarity on what your system actually needs"],
          cons: ["CP: downtime during partitions", "AP: stale or conflicting data", "Real systems live on a spectrum, not binary CP/AP"]
        },
        when: "CP for money, inventory, anything requiring correctness. AP for social feeds, recommendations, anything where staleness is OK.",
        interview: "CP: banks (a wrong answer is unacceptable). AP: social media likes (prefer available with slight staleness)."
      },
      {
        name: "Strong vs Eventual Consistency",
        desc: "Strong: read always returns latest write. Eventual: all nodes will eventually agree, but reads might be slightly stale. DNS is eventually consistent.",
        tradeoffs: {
          pros: ["Strong: simple mental model, no surprises", "Eventual: faster reads, higher availability"],
          cons: ["Strong: slower (coordination required)", "Strong: lower availability during failures", "Eventual: app must handle stale data", "Eventual: read-your-own-writes problem"]
        },
        when: "Strong for financial, inventory, auth. Eventual for likes, view counts, recommendations.",
        interview: "Strong = slower but safe. Eventual = faster but may read stale data. Match to use case."
      },
      {
        name: "ACID (SQL Transactions)",
        desc: "Atomicity (all or nothing), Consistency (valid state always), Isolation (transactions don't interfere), Durability (committed = permanent).",
        tradeoffs: {
          pros: ["Bulletproof guarantees for critical data", "Simplifies app code (DB handles correctness)", "Required for financial and legal use cases"],
          cons: ["Performance cost (locks, coordination)", "Hard to scale across multiple databases", "Strict isolation reduces concurrency"]
        },
        when: "Always for money, bookings, inventory, auth. Don't sacrifice ACID without a strong reason.",
        interview: "Critical for financial systems. Mention when designing payment or booking systems."
      },
      {
        name: "BASE (NoSQL)",
        desc: "Basically Available, Soft state, Eventually consistent. The NoSQL trade-off. Prioritizes availability and performance over strict consistency.",
        tradeoffs: {
          pros: ["Massive scale", "High availability even during failures", "Better performance for read-heavy workloads"],
          cons: ["App must handle stale/conflicting data", "Complex conflict resolution logic", "Hard to reason about correctness"]
        },
        when: "Use when scale demands it and your data tolerates staleness.",
        interview: "Contrast with ACID when justifying NoSQL choice."
      },
      {
        name: "Isolation Levels",
        desc: "How much transactions can see each other. Read Uncommitted (least strict) → Serializable (most strict).",
        tradeoffs: {
          pros: ["Read Committed: balances performance/correctness (default in most DBs)", "Serializable: bulletproof, no anomalies", "Repeatable Read: prevents most common issues"],
          cons: ["Serializable: dramatically slower (locks everything)", "Read Committed: phantom reads possible", "Read Uncommitted: dirty reads"]
        },
        when: "Read Committed is default. Use Serializable only for critical financial transactions.",
        interview: "Anomalies: dirty read, non-repeatable read, phantom read, lost update. Each isolation level prevents specific ones."
      }
    ],
    use_cases: [
      {
        company: "Amazon DynamoDB",
        title: "Choosing AP for the shopping cart",
        problem: "If a network partition happens during Black Friday, should the cart system go offline or potentially show slightly old data?",
        solution: "Amazon famously chose availability. Their original Dynamo paper described how shopping carts are eventually consistent — if you add an item during a partition, it gets merged later (using vector clocks for conflict resolution). The worst case: an item appears twice and you remove it. Customers prefer this over 'cart unavailable'.",
        tradeoff: "Eventual consistency means complex conflict resolution code. Amazon's vector clock implementation took years of engineering. Most companies should use a managed DB (DynamoDB) instead of building their own.",
        takeaway: "Choose availability when downtime costs more than reconciliation. Conflicts can be resolved later; lost sales can't be recovered."
      },
      {
        company: "Banking Systems",
        title: "Choosing CP for money transfers",
        problem: "If you transfer $100 from A to B, both accounts must update or neither. Showing different balances on different servers = financial disaster.",
        solution: "Banks use CP databases (typically traditional RDBMS with strong consistency, or systems like Google Spanner). Transactions are wrapped in ACID guarantees. If a partition happens, the system refuses to process the transfer until consistency is restored, even if it means downtime.",
        tradeoff: "Strict consistency means downtime during failures. Banks accept this — better to refuse a transaction than execute it twice or lose it.",
        takeaway: "When correctness > availability, choose CP. Money, inventory, bookings — any domain where double-spending is unacceptable."
      },
      {
        company: "Google Spanner",
        title: "Trying to have both with TrueTime",
        problem: "Google needed strong consistency AND global availability for AdWords. CAP says impossible. They got close anyway.",
        solution: "Spanner uses GPS and atomic clocks in every data center to maintain a globally synchronized 'TrueTime' API. Transactions wait out the clock uncertainty (typically ~7ms) to guarantee external consistency across continents. It's CP technically, but the partition window is so rare and recovery so fast that it feels like CA.",
        tradeoff: "Spanner pays a 7ms+ latency cost on every committed transaction (waiting out clock uncertainty). Plus it requires specialized hardware (atomic clocks). Massive cost only Google could justify.",
        takeaway: "Throwing money and engineering at the problem can shrink trade-offs. But there's no magic — Spanner still pays a latency cost for consistency."
      }
    ],
    interview_tips: [
      "CAP is about network partitions — not everyday trade-offs",
      "Always ask: does this system need strong consistency? (banking yes, social feed no)",
      "PACELC extends CAP: even without partition, there's latency vs consistency trade-off",
      "Most real systems are 'tunable' — strong for some operations, eventual for others"
    ]
  },
  {
    id: "microservices",
    category: "HLD",
    icon: "🧩",
    title: "Microservices",
    color: "#4CC9F0",
    tagline: "Small services, big systems",
    simple: "Instead of one giant application (monolith), split it into small independent services that each do one thing. Like a restaurant where the kitchen, cashier, and waiter are separate teams with their own job.",
    concepts: [
      {
        name: "Monolith vs Microservices",
        desc: "Monolith: simple to develop early, hard to scale specific parts. Microservices: independent deployment/scaling, but operational complexity increases.",
        tradeoffs: {
          pros: ["Monolith: simple deploy, easy local dev, no network calls", "Microservices: independent scaling, team autonomy, polyglot stacks"],
          cons: ["Monolith: scaling everything at once is wasteful", "Microservices: distributed systems complexity, network failures, hard debugging", "Microservices: 10x ops overhead"]
        },
        when: "Start with monolith. Move to microservices only when you have clear bounded contexts and >50 engineers.",
        interview: "Start with monolith, break into services when you have clear boundaries and scaling needs."
      },
      {
        name: "API Gateway",
        desc: "Single entry point for all client requests. Routes to right microservice, handles auth, rate limiting, SSL termination.",
        tradeoffs: {
          pros: ["Single entry point simplifies clients", "Centralizes cross-cutting concerns (auth, rate limiting)", "Can aggregate multiple services into one response", "Hides internal topology"],
          cons: ["Single point of failure (must be redundant)", "Adds latency (extra hop)", "Can become a bottleneck", "Yet another thing to operate"]
        },
        when: "Use as soon as you have 3+ microservices.",
        interview: "Examples: AWS API Gateway, Kong, Nginx. Prevents clients from knowing internal topology."
      },
      {
        name: "Service Discovery",
        desc: "Services register themselves. Others find them dynamically instead of hardcoded IPs. Like a company directory.",
        tradeoffs: {
          pros: ["Services can move/scale without breaking clients", "Health checks remove dead instances", "Enables rolling deploys"],
          cons: ["Discovery service is a critical dependency", "Stale entries cause failed requests", "Adds latency for first lookup"]
        },
        when: "Use as soon as you have dynamic instances (auto-scaling, Kubernetes).",
        interview: "Tools: Consul, Eureka, Kubernetes DNS. Client-side vs server-side discovery."
      },
      {
        name: "Circuit Breaker",
        desc: "If a downstream service keeps failing, stop calling it temporarily. Fail fast, return a fallback. Prevents cascade failures.",
        tradeoffs: {
          pros: ["Prevents cascade failures", "Fails fast (no waiting for timeouts)", "Gives downstream service time to recover"],
          cons: ["Tuning thresholds is tricky (false positives)", "Fallback logic must exist (often hard)", "Adds code complexity"]
        },
        when: "Wrap every external service call. Non-negotiable in microservices.",
        interview: "Pattern: Closed → Open → Half-Open. Tools: Hystrix, Resilience4j."
      },
      {
        name: "Saga Pattern (Distributed Transactions)",
        desc: "Break a transaction across services into a sequence of local transactions, each with a compensating action if something fails.",
        tradeoffs: {
          pros: ["Avoids distributed locks (which don't scale)", "Each service stays autonomous", "Failure recovery via compensation"],
          cons: ["Eventual consistency (no atomicity)", "Compensating actions can themselves fail", "Hard to reason about, hard to debug"]
        },
        when: "When you need a transaction across services — but only when truly needed. Often you can redesign to avoid it.",
        interview: "Two flavors: Choreography (event-driven) vs Orchestration (central coordinator). Orchestration is easier to debug."
      }
    ],
    use_cases: [
      {
        company: "Amazon",
        title: "The 'two-pizza team' model",
        problem: "By 2001, Amazon's monolith was so tangled that any change required coordinating dozens of teams. Deployments took weeks.",
        solution: "Jeff Bezos mandated: every team must expose its functionality as an API, and teams can only communicate via these APIs. Each team owns its service end-to-end (small enough to be fed by two pizzas). Today Amazon runs thousands of microservices. Adding a new feature = deploying one service, not the whole stack.",
        tradeoff: "Team autonomy means inconsistent tooling, duplicated effort, and a steep learning curve when changing teams. Amazon accepts this for the deployment velocity gain.",
        takeaway: "Microservices solve organizational scaling, not just technical scaling. Conway's Law: your architecture mirrors your team structure."
      },
      {
        company: "Netflix",
        title: "Hystrix and the circuit breaker pattern",
        problem: "When the recommendations service slowed down, every Netflix screen would hang waiting for it — even though recommendations are optional.",
        solution: "Netflix built Hystrix (now Resilience4j). Each service call is wrapped in a circuit breaker: if the recommendations service times out 5 times in 10 seconds, the breaker 'opens' and calls fail fast with a fallback (popular movies). After 30 seconds, it tries again. Result: degraded experience instead of total failure.",
        tradeoff: "Circuit breakers can mask real problems — if the breaker is always open, alerts must fire. Tuning thresholds requires production experience.",
        takeaway: "In microservices, failure is constant. Design for graceful degradation. Each call to another service should have a timeout, retry policy, and fallback."
      },
      {
        company: "Spotify",
        title: "Squad model with microservices",
        problem: "Hundreds of engineers working on one codebase = constant merge conflicts, deployment bottlenecks, and slow feature delivery.",
        solution: "Spotify organized into autonomous 'squads' (~8 people), each owning one or more microservices (search, playlist, recommendations, social, etc.). Squads pick their own tech stack, deploy independently, and communicate via APIs. They use 'tribes' and 'guilds' for cross-cutting concerns like security.",
        tradeoff: "Squad autonomy creates duplicated infrastructure (every team building its own deployment, monitoring). Spotify invests in platform teams to provide shared tooling.",
        takeaway: "Microservices enable team autonomy. The real win is parallel feature development without coordination overhead."
      }
    ],
    interview_tips: [
      "Mention service boundaries — each service owns its own database",
      "Distributed tracing (Jaeger, Zipkin) for debugging across services",
      "Saga pattern for distributed transactions across microservices",
      "Don't over-engineer — start with monolith unless team size demands services"
    ]
  },
  {
    id: "ratelimiting",
    category: "HLD",
    icon: "🛡️",
    title: "Rate Limiting",
    color: "#FF6B9D",
    tagline: "Protect your system from abuse",
    simple: "Rate limiting controls how many requests a user can make in a given time. Like a bouncer at a club — 'you've been in 10 times tonight, wait an hour.' Protects your system from being overwhelmed.",
    concepts: [
      {
        name: "Token Bucket",
        desc: "Each user gets a bucket of tokens. Each request consumes a token. Tokens refill at a fixed rate. Allows short bursts.",
        tradeoffs: {
          pros: ["Allows bursts (good UX for legitimate users)", "Smooth steady rate over time", "Easy to implement with Redis"],
          cons: ["Bursts can still overwhelm if many users coordinate", "Memory per user (one bucket each)"]
        },
        when: "Default choice for most APIs. Allows legitimate burst traffic.",
        interview: "Most common and flexible algorithm. Easy to implement with Redis."
      },
      {
        name: "Leaky Bucket",
        desc: "Requests go in a bucket, processed at constant rate. Smooths out bursty traffic. Output rate is constant.",
        tradeoffs: {
          pros: ["Strictly uniform processing rate", "Predictable backend load", "Good for downstream protection"],
          cons: ["Rejects legitimate bursts", "Bad UX for users who want occasional fast operations"]
        },
        when: "Use when downstream system needs constant rate (payment processors, batch APIs).",
        interview: "Use when you want uniform processing rate (e.g., payment processing)."
      },
      {
        name: "Fixed Window Counter",
        desc: "Count requests per fixed time window (e.g., 100/minute). Simple but has edge case: 200 requests at window boundary.",
        tradeoffs: {
          pros: ["Dead simple to implement", "Low memory (one counter per user)", "Easy to explain to users"],
          cons: ["Boundary problem: 2x burst at window edges", "Not smooth"]
        },
        when: "OK for non-critical limits. Avoid for security-sensitive cases.",
        interview: "Explain the boundary problem, then mention sliding window as improvement."
      },
      {
        name: "Sliding Window",
        desc: "Tracks requests in a rolling time window. Smoother than fixed window. Two flavors: log (precise, expensive) and counter (approximation, cheap).",
        tradeoffs: {
          pros: ["No boundary problem", "Smooth rate enforcement", "Counter version is cheap on memory"],
          cons: ["Log version stores every request timestamp (memory heavy)", "Counter version is approximate", "More complex than fixed window"]
        },
        when: "Use sliding window counter for production. Sliding window log only for high-stakes (security) limits.",
        interview: "Sliding window log is most accurate but memory-heavy. Counter is the practical choice."
      },
      {
        name: "Where to Store State",
        desc: "Single server: in-memory. Distributed: Redis with atomic operations (INCR + EXPIRE). Consistent across all servers.",
        tradeoffs: {
          pros: ["In-memory: fastest, no network hop", "Redis: consistent across all app servers", "Redis: atomic operations prevent race conditions"],
          cons: ["In-memory: not shared across servers", "Redis: network latency, Redis is critical dep", "Both: must handle counter rollover"]
        },
        when: "Always use Redis (or similar) in production. In-memory only for single-server scenarios.",
        interview: "Redis is the standard answer. Mention race conditions and atomic operations."
      }
    ],
    use_cases: [
      {
        company: "GitHub API",
        title: "5000 requests/hour per user",
        problem: "When automated tools (CI bots, scrapers) hit the API in tight loops, they can take down GitHub for everyone else.",
        solution: "GitHub uses a token bucket per authenticated user (5000 req/hour) and per IP (60 req/hour for unauthenticated). Every response includes X-RateLimit-Remaining and X-RateLimit-Reset headers so clients know their budget. Exceeding the limit returns HTTP 429 with a Retry-After header.",
        tradeoff: "Per-user limits mean a power user with 100 repos gets the same budget as a casual user. GitHub offers 'app installations' with separate budgets to address this — adding complexity but fixing fairness.",
        takeaway: "Make rate limits transparent. Returning headers with current usage lets well-behaved clients self-throttle. Punish only abusers."
      },
      {
        company: "Stripe",
        title: "Preventing payment fraud and abuse",
        problem: "Attackers test stolen credit cards by hitting payment APIs thousands of times per second, looking for valid cards.",
        solution: "Stripe applies multi-layered rate limiting: per-API-key (legitimate customers' rates), per-IP (catch attackers), and per-card (stop card testing). They use Redis with sliding window counters. Suspicious patterns trigger CAPTCHAs or full blocks. Different endpoints have different limits — /charges is stricter than /customers.",
        tradeoff: "Strict limits can block legitimate large merchants during sales. Stripe has account-tier overrides and human review queues — operational overhead but necessary.",
        takeaway: "Layer rate limits by dimension (user, IP, resource). Different endpoints need different limits. Combine with anomaly detection for sophisticated abuse."
      },
      {
        company: "Cloudflare",
        title: "Edge rate limiting for DDoS",
        problem: "When a website faces a botnet sending 10M requests/sec, no origin server can handle that — even with a load balancer.",
        solution: "Cloudflare rate limits at the edge across 300+ data centers using a globally synchronized counter (with eventual consistency). Customers configure rules like 'max 100 req/min per IP to /login'. Excess traffic is dropped before it reaches the origin. They use the Sliding Window Log algorithm for accuracy.",
        tradeoff: "Eventually consistent counters mean a user might briefly exceed limits across edges. Cloudflare accepts this — the goal is order-of-magnitude protection, not perfect counting.",
        takeaway: "Rate limit at the edge, not the origin. The earlier in the request path you reject traffic, the more resources you save."
      }
    ],
    interview_tips: [
      "Rate limit by: IP, user ID, API key — mention all three",
      "Return HTTP 429 (Too Many Requests) with Retry-After header",
      "Sliding window log is most accurate but memory-heavy",
      "Layer limits: edge → API gateway → service-level"
    ]
  },

  // ============ LOW LEVEL DESIGN ============
  {
    id: "oop",
    category: "LLD",
    icon: "🎯",
    title: "OOP Principles",
    color: "#FF99C8",
    tagline: "The four pillars of clean code",
    simple: "Object-Oriented Programming organizes code into objects (things with data + behavior). Like organizing a kitchen: every appliance has its own job (encapsulation) and works with others (inheritance, polymorphism).",
    concepts: [
      {
        name: "Encapsulation",
        desc: "Bundle data and methods together. Hide internal details. Expose only what's needed. Like a TV remote — you press a button, you don't care how it works inside.",
        tradeoffs: {
          pros: ["Internal changes don't break callers", "Validates state before changes", "Easier to debug (state changes localized)"],
          cons: ["More boilerplate (getters/setters)", "Can over-encapsulate trivial data", "Sometimes hides too much (debugging)"]
        },
        when: "Always. Use private fields, public methods. Prefer immutability where possible.",
        interview: "Mention: private fields, public methods, validation in setters, builder pattern for complex objects."
      },
      {
        name: "Inheritance",
        desc: "A class can inherit properties and methods from another. Dog IS-A Animal. Reuse code without copying.",
        tradeoffs: {
          pros: ["Code reuse", "Models real-world hierarchies naturally", "Polymorphism enables clean abstractions"],
          cons: ["Tight coupling between parent and child", "Deep hierarchies become brittle", "'Diamond problem' in multiple inheritance"]
        },
        when: "Use sparingly. Favor composition over inheritance. Use only for true IS-A relationships.",
        interview: "Always say: 'Favor composition over inheritance.' Inheritance is overused; composition is more flexible."
      },
      {
        name: "Polymorphism",
        desc: "One interface, many implementations. A Shape can be Circle or Square — both have area(), but compute it differently. Code works with the abstraction.",
        tradeoffs: {
          pros: ["Caller doesn't need to know concrete type", "Easy to add new types without changing existing code", "Enables clean abstractions (e.g., List interface)"],
          cons: ["Indirection makes debugging harder", "Performance overhead (virtual dispatch)", "Can over-abstract simple things"]
        },
        when: "Whenever you have multiple types that share an interface (payment processors, notification channels, etc.).",
        interview: "Mention: method overriding (runtime), method overloading (compile-time), interfaces vs abstract classes."
      },
      {
        name: "Abstraction",
        desc: "Hide complexity behind a simple interface. You drive a car without knowing how the engine works. Define what something does, not how.",
        tradeoffs: {
          pros: ["Clients depend on interface, not implementation", "Easy to swap implementations (e.g., MySQL → Postgres)", "Easier testing (mock the interface)"],
          cons: ["Wrong abstraction is worse than no abstraction", "Adds layers (more code to navigate)", "Premature abstraction is a common mistake"]
        },
        when: "Abstract when you have 2+ implementations or expect change. Don't abstract speculatively.",
        interview: "Mention: abstract classes, interfaces, dependency inversion principle."
      }
    ],
    use_cases: [
      {
        company: "Java Collections Framework",
        title: "Polymorphism done right",
        problem: "Thousands of code paths need to work with lists, sets, maps — but with different implementations (ArrayList, LinkedList, HashSet, TreeSet) optimized for different use cases.",
        solution: "Java defines interfaces (List, Set, Map) with multiple implementations. You write code against the interface. Want fast random access? ArrayList. Frequent inserts in middle? LinkedList. The caller code doesn't change.",
        tradeoff: "Interface methods that don't fit all implementations (LinkedList.get(index) is O(n)) lead to subtle performance bugs. Java's solution: separate interfaces (RandomAccess marker interface) — added complexity.",
        takeaway: "Good interfaces are minimal. They expose the operations all implementations can do well, and let specific implementations add capabilities."
      },
      {
        company: "Stripe",
        title: "Payment processor abstraction",
        problem: "Stripe needs to integrate with dozens of payment networks (Visa, Mastercard, ACH, SEPA), each with completely different APIs and rules.",
        solution: "Stripe defines a PaymentMethod interface with charge(), refund(), and authorize() methods. Each network has its own implementation. Internal services just call paymentMethod.charge() — they don't know if it's a credit card or bank transfer.",
        tradeoff: "Forcing all networks into one interface means losing network-specific features. Stripe handles this with optional capabilities and feature flags — increased complexity but enables unified internal logic.",
        takeaway: "Strategy pattern + abstraction = swap implementations without touching core logic. The abstraction is your contract; pick it carefully."
      }
    ],
    interview_tips: [
      "Be ready to identify which OOP principle applies to a given problem",
      "Always say 'composition over inheritance'",
      "Mention SOLID principles when discussing OOP design",
      "Don't over-abstract — YAGNI (You Aren't Gonna Need It)"
    ]
  },
  {
    id: "solid",
    category: "LLD",
    icon: "📐",
    title: "SOLID Principles",
    color: "#9D4EDD",
    tagline: "Five rules for maintainable code",
    simple: "SOLID is five rules that make code easier to change without breaking things. Like building with LEGO — each piece does one job and snaps cleanly with others.",
    concepts: [
      {
        name: "S — Single Responsibility",
        desc: "A class should have one reason to change. If your User class handles auth, profile, AND email sending, splitting them is better.",
        tradeoffs: {
          pros: ["Changes are localized — touch one class, not many", "Easier to test (smaller surface area)", "Easier to understand"],
          cons: ["More classes to navigate", "Can fragment related logic", "'Reason to change' is subjective"]
        },
        when: "Apply when a class grows beyond ~200 lines or has multiple distinct responsibilities.",
        interview: "Classic example: split UserService into AuthService, ProfileService, NotificationService."
      },
      {
        name: "O — Open/Closed",
        desc: "Open for extension, closed for modification. Add new behavior by adding new code, not changing existing code. Use polymorphism.",
        tradeoffs: {
          pros: ["Existing tested code stays untouched", "New features = new classes (less risky)", "Reduces regression bugs"],
          cons: ["Requires upfront design (what to make extensible?)", "Can lead to over-engineering", "Performance overhead from indirection"]
        },
        when: "When you have a feature that varies (payment types, notification channels, file formats).",
        interview: "Use Strategy pattern, abstract classes, or interfaces. Show 'add new payment type without changing PaymentService.'"
      },
      {
        name: "L — Liskov Substitution",
        desc: "Subclasses must be usable wherever parent class is expected. If Dog extends Animal, anywhere expecting Animal must work with Dog. No surprises.",
        tradeoffs: {
          pros: ["Polymorphism works as expected", "Prevents subtle bugs from broken contracts", "Forces clean inheritance design"],
          cons: ["Limits inheritance use cases", "Some real-world hierarchies don't fit (Square IS-A Rectangle? Not really)"]
        },
        when: "Apply whenever using inheritance. If a subclass throws unexpected exceptions or has stricter preconditions, you've violated LSP.",
        interview: "Classic violation: Square extends Rectangle but setWidth changes height. Better: separate interfaces."
      },
      {
        name: "I — Interface Segregation",
        desc: "Don't force classes to implement methods they don't need. Split fat interfaces into smaller, focused ones.",
        tradeoffs: {
          pros: ["Classes only implement what they need", "Less coupling", "Easier to test (smaller mocks)"],
          cons: ["More interfaces to manage", "Can lead to micro-interfaces", "Refactoring existing fat interfaces is painful"]
        },
        when: "When an interface has methods that are irrelevant to some implementations.",
        interview: "Example: split Printer interface into Printer, Scanner, Fax — not all printers scan."
      },
      {
        name: "D — Dependency Inversion",
        desc: "Depend on abstractions, not concrete classes. High-level code shouldn't import database-specific code; both should depend on an interface.",
        tradeoffs: {
          pros: ["Easy to swap implementations (e.g., for testing)", "Loose coupling between modules", "Enables dependency injection"],
          cons: ["More interfaces", "Indirection makes 'jump to definition' less useful", "Over-application = abstraction soup"]
        },
        when: "Always for cross-module dependencies (services calling DBs, external APIs).",
        interview: "Tied to dependency injection. Mention: 'inject the dependency through constructor; depend on the interface.'"
      }
    ],
    use_cases: [
      {
        company: "Spring Framework",
        title: "Dependency injection at scale",
        problem: "Java enterprise apps in the early 2000s had components tightly coupled to specific implementations. Testing required massive setup, and swapping a database meant rewriting half the app.",
        solution: "Spring built a framework around dependency injection. Components declare what they need via interfaces, Spring wires them at runtime. Want to use Postgres instead of MySQL? Change one config file. Need a mock for tests? Provide a mock implementation. The DIP is the foundation.",
        tradeoff: "Spring's flexibility comes with magic — annotations and runtime wiring make it harder to trace what's happening. Spring Boot reduced the boilerplate but introduced its own learning curve.",
        takeaway: "DIP enables flexibility, but the cost is indirection. Frameworks like Spring exist to manage that indirection — don't build your own."
      },
      {
        company: "AWS SDK",
        title: "Open/Closed with service plugins",
        problem: "AWS adds new services constantly. SDKs can't ship a new version every time a service launches.",
        solution: "AWS SDKs are designed around the Open/Closed principle. The core HTTP client, auth, and retry logic are closed (stable). New services plug in as new modules implementing existing interfaces. A new AWS service = new package, no SDK rewrite.",
        tradeoff: "Generic interfaces sometimes don't fit a service's unique features (S3 multipart uploads need custom logic). AWS handles this with service-specific extensions — slight inconsistency for flexibility.",
        takeaway: "Open/Closed enables ecosystems. Define stable cores, let extensions plug in. This is how plugins, frameworks, and SDKs scale."
      }
    ],
    interview_tips: [
      "SOLID is a checklist, not a religion — apply pragmatically",
      "SRP and DIP are the most commonly tested in interviews",
      "Always tie SOLID to a specific design pattern (Strategy, Factory, etc.)",
      "Be ready to refactor a violation in a code-review style question"
    ]
  },
  {
    id: "patterns",
    category: "LLD",
    icon: "🧱",
    title: "Design Patterns",
    color: "#F77F00",
    tagline: "Battle-tested solutions to common problems",
    simple: "Design patterns are reusable templates for solving common code problems. Like cooking recipes — you don't reinvent how to bake bread; you use a proven recipe. Each pattern solves a specific problem.",
    concepts: [
      {
        name: "Singleton",
        desc: "Only one instance of a class exists, globally accessible. Used for shared resources like config, logger, DB connection pool.",
        tradeoffs: {
          pros: ["Single source of truth", "Lazy initialization", "Saves memory for shared resources"],
          cons: ["Hard to test (global state)", "Hidden dependencies", "Concurrency issues if not careful", "Overused — often a code smell"]
        },
        when: "Use only for genuinely global resources (config, connection pool). Default to dependency injection instead.",
        interview: "Mention thread safety (double-checked locking, enum singleton in Java). Often considered an anti-pattern."
      },
      {
        name: "Factory",
        desc: "A method/class that creates objects without exposing the creation logic. Like ordering a coffee — you say 'latte' and get one, you don't make it.",
        tradeoffs: {
          pros: ["Decouples creation from use", "Easy to swap implementations", "Centralizes complex creation logic"],
          cons: ["More classes to manage", "Can hide what's actually created", "Overkill for simple objects"]
        },
        when: "When object creation is complex or when you need to return different concrete types based on input.",
        interview: "Variants: Simple Factory, Factory Method, Abstract Factory. Use case: payment processor creation."
      },
      {
        name: "Observer (Pub/Sub)",
        desc: "Objects subscribe to events from another object. When the event fires, all subscribers are notified. Like newspaper subscribers — paper is published, all subscribers receive it.",
        tradeoffs: {
          pros: ["Loose coupling between publisher and subscribers", "Easy to add new subscribers", "Models event-driven systems naturally"],
          cons: ["Order of notification not guaranteed", "Memory leaks if subscribers aren't unsubscribed", "Hard to debug (who reacts to what?)"]
        },
        when: "Event-driven systems, UI frameworks (React state changes), notification systems.",
        interview: "Foundation of event-driven architecture. Mention: weak references prevent memory leaks."
      },
      {
        name: "Strategy",
        desc: "Define a family of algorithms, make them interchangeable at runtime. Like Google Maps offering driving, walking, transit modes — same problem, different strategies.",
        tradeoffs: {
          pros: ["Swap algorithms at runtime", "Clean alternative to if/else chains", "Each strategy is independently testable"],
          cons: ["Caller must know which strategy to use", "More classes/files", "Over-application for simple variations"]
        },
        when: "When you have multiple ways to do the same thing (sorting, payment methods, compression algorithms).",
        interview: "Classic OCP enabler. Use case: PaymentStrategy interface with CreditCard, PayPal, Crypto implementations."
      },
      {
        name: "Decorator",
        desc: "Wrap an object to add behavior without changing the original. Like adding toppings to a pizza — base stays the same, you decorate it.",
        tradeoffs: {
          pros: ["Add behavior at runtime", "Open/Closed compliant", "Avoids subclass explosion"],
          cons: ["Many small classes (one per decoration)", "Order of decoration matters", "Hard to debug deep wrapping"]
        },
        when: "When you need to add cross-cutting concerns (logging, caching, auth) to existing code.",
        interview: "Java I/O streams are a classic example: BufferedReader wraps FileReader wraps InputStreamReader."
      },
      {
        name: "Builder",
        desc: "Construct complex objects step by step. Useful when an object has many optional parameters.",
        tradeoffs: {
          pros: ["Readable construction (fluent API)", "Immutable objects", "Avoids telescoping constructors"],
          cons: ["More boilerplate (or use Lombok/records)", "Overkill for simple objects with few fields"]
        },
        when: "When a class has 4+ fields, especially with optional ones.",
        interview: "Example: SQL query builder, HTTP request builder. Mention immutability + thread safety."
      }
    ],
    use_cases: [
      {
        company: "React",
        title: "Observer pattern in state management",
        problem: "When app state changes (user logs in, item added to cart), dozens of UI components need to update. Tightly coupling state to components creates spaghetti.",
        solution: "React (and Redux) use the Observer pattern. Components subscribe to state slices via useSelector or useState. When state changes, only subscribed components re-render. The state store doesn't know about specific components — just notifies subscribers.",
        tradeoff: "Pub/sub at scale leads to over-rendering if not careful (parent re-renders all children). React added memoization (useMemo, React.memo) to fix this — solving one problem with another concept.",
        takeaway: "Observer pattern is the foundation of reactive UIs. The challenge is fine-grained subscriptions to avoid wasteful updates."
      },
      {
        company: "Java I/O Streams",
        title: "Decorator pattern in the wild",
        problem: "Java needed a flexible way to read files: from disk, with buffering, with character encoding, with compression. Every combination as its own class = explosion.",
        solution: "Java's I/O uses Decorator pattern. You wrap streams: new BufferedReader(new InputStreamReader(new FileInputStream(file))). Each layer adds one capability: file reading, character decoding, buffering. Combine as needed.",
        tradeoff: "Verbose construction is the price. Modern Java added Files.readString() for common cases — but the underlying decorator chain is still there for flexibility.",
        takeaway: "Decorator excels when you have orthogonal features that combine. Each decorator does one thing, you stack them."
      },
      {
        company: "Spring Framework",
        title: "Singleton + Factory + Strategy",
        problem: "Java enterprise apps need shared services (DB connections, services), pluggable behavior (different DBs, message queues), and runtime configuration.",
        solution: "Spring Beans default to Singleton scope (one instance per app). Factories (BeanFactory, ApplicationContext) create them. Different strategies (JdbcTemplate vs JPA) are swapped via configuration. The patterns combine to enable Spring's flexibility.",
        tradeoff: "Singletons + global state make testing harder. Spring solved this with profiles and test-specific configurations — but tests still require Spring context, slowing them down.",
        takeaway: "Real systems combine patterns. Knowing each in isolation isn't enough — knowing how they work together is what makes you a senior engineer."
      }
    ],
    interview_tips: [
      "Recognize patterns when given a problem — don't memorize names, recognize structures",
      "Strategy and Factory are the most common in coding interviews",
      "Always ask: 'Is this pattern actually needed?' Avoid pattern-itis",
      "Be ready to write the pattern from scratch in code"
    ]
  },
  {
    id: "concurrency",
    category: "LLD",
    icon: "🧵",
    title: "Concurrency",
    color: "#80ED99",
    tagline: "Doing many things at once safely",
    simple: "Concurrency is when multiple things happen at the same time — like a kitchen where multiple cooks work in parallel. The challenge: making sure they don't bump into each other or use the same knife at the same time.",
    concepts: [
      {
        name: "Threads vs Processes",
        desc: "Process: independent program with its own memory. Thread: lightweight unit inside a process, shares memory with siblings. Threads are cheaper to create but more dangerous (shared state).",
        tradeoffs: {
          pros: ["Threads: cheap to create, shared memory = fast communication", "Processes: isolation = safety, can run on multiple cores easily"],
          cons: ["Threads: shared memory = race conditions", "Processes: expensive to create, IPC is slow"]
        },
        when: "Threads for I/O-bound work in same app. Processes for isolation or CPU-bound work that needs true parallelism.",
        interview: "Mention GIL in Python (threads don't help CPU-bound work). Mention thread pools for reuse."
      },
      {
        name: "Race Conditions",
        desc: "When two threads access the same data and the result depends on timing. Like two people grabbing the last cookie — only one should win, but both might think they did.",
        tradeoffs: {
          pros: ["Locks prevent races (correctness)", "Atomic operations are fast for simple cases"],
          cons: ["Locks add latency", "Locks can deadlock", "Atomic operations are limited (single variable)"]
        },
        when: "Anywhere multiple threads write to shared data. Default to immutability when possible.",
        interview: "Classic example: incrementing a counter (read-modify-write isn't atomic). Use AtomicInteger or synchronized."
      },
      {
        name: "Locks (Mutex, Semaphore)",
        desc: "Mutex: only one thread at a time. Semaphore: N threads at a time. Like a single-stall bathroom (mutex) vs a bathroom with N stalls (semaphore).",
        tradeoffs: {
          pros: ["Simple correctness guarantees", "Wide language support", "Granular control"],
          cons: ["Can deadlock if locks acquired in wrong order", "Reduces parallelism", "Easy to forget to unlock"]
        },
        when: "When you need to protect a critical section of code that modifies shared state.",
        interview: "Always mention: try-finally for unlocking, lock ordering to prevent deadlock, ReentrantLock vs synchronized."
      },
      {
        name: "Deadlock",
        desc: "Two threads each hold a lock the other needs. Both wait forever. Like two cars at an intersection, each waiting for the other to move.",
        tradeoffs: {
          pros: ["Detection tools exist (jstack, profilers)", "Lock ordering prevents most cases", "Timeouts limit damage"]
        },
        when: "Avoid by: always acquiring locks in the same order, using lock timeouts, minimizing lock scope.",
        interview: "Four conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Break any one to prevent."
      },
      {
        name: "Async/Await (Non-blocking)",
        desc: "Instead of blocking a thread waiting for I/O, register a callback. Thread can do other work meanwhile. Massively scales concurrent connections.",
        tradeoffs: {
          pros: ["One thread handles thousands of connections", "Lower memory than thread-per-request", "Great for I/O-bound work"],
          cons: ["Async code is harder to read", "'Function coloring' problem (async spreads through codebase)", "Doesn't help CPU-bound work"]
        },
        when: "Web servers, network clients, anything I/O-heavy. Default for modern web frameworks.",
        interview: "Foundation of Node.js, Python asyncio, Go goroutines (kind of). Mention event loops."
      },
      {
        name: "Producer-Consumer",
        desc: "Producers add work to a queue, consumers process from it. Decouples speed of production from consumption. Like a conveyor belt in a factory.",
        tradeoffs: {
          pros: ["Decouples producers and consumers", "Backpressure handles speed mismatches", "Easy to scale either side"],
          cons: ["Bounded queue can block producers", "Unbounded queue can run out of memory", "Complexity grows with multiple producers/consumers"]
        },
        when: "Whenever production rate differs from consumption rate. Background jobs, log processing, work queues.",
        interview: "Use BlockingQueue in Java, Channels in Go. Mention bounded queues to prevent memory issues."
      }
    ],
    use_cases: [
      {
        company: "Node.js",
        title: "Single-threaded async with massive scale",
        problem: "Traditional servers (Apache) used one thread per request — 10K concurrent users meant 10K threads, eating GBs of RAM and dying under load.",
        solution: "Node.js runs JavaScript on a single thread with an event loop. I/O operations are non-blocking — when waiting for a DB query, the thread serves another request. Result: one thread handles tens of thousands of concurrent connections in MBs of RAM.",
        tradeoff: "Single-threaded means CPU-heavy operations block everything. Node added Worker Threads and the Cluster module for CPU work — but the simplicity advantage is partially lost.",
        takeaway: "Async I/O scales better than threads for I/O-bound workloads. The trade-off: CPU-bound work needs separate handling."
      },
      {
        company: "Java's ConcurrentHashMap",
        title: "Lock striping for read-heavy maps",
        problem: "Original Hashtable used a single lock — every read/write blocked everyone else. With many threads, performance collapsed.",
        solution: "ConcurrentHashMap divides the map into segments (originally 16). Each segment has its own lock. Operations on different segments run in parallel. Reads are mostly lock-free using volatile reads. Java 8 went further with CAS operations and tree bins.",
        tradeoff: "Lock striping adds memory overhead and complexity. Iteration over the map is weakly consistent (might miss concurrent updates). Trade-offs accepted for the massive throughput gain.",
        takeaway: "Lock granularity is a key tuning knob. Coarse locks are simple but slow; fine-grained locks are complex but fast. Match to access patterns."
      },
      {
        company: "Go's Goroutines",
        title: "Lightweight concurrency primitives",
        problem: "OS threads are heavy (1MB+ stack each). Spawning 100K threads exhausts memory. Async code is hard to read.",
        solution: "Go introduced goroutines: lightweight (2KB stack, grows as needed), multiplexed onto OS threads by Go runtime. You write synchronous-looking code, the runtime handles scheduling. Channels provide safe communication: 'don't communicate by sharing memory; share memory by communicating.'",
        tradeoff: "Channels can deadlock if not careful. Goroutine leaks (forgotten goroutines holding memory) are common. Debugging is harder than synchronous code.",
        takeaway: "The right concurrency primitives matter. Goroutines + channels = readable concurrent code. Ergonomics drive adoption."
      }
    ],
    interview_tips: [
      "Always check for race conditions when two threads share state",
      "Prefer immutability — eliminates entire class of concurrency bugs",
      "Mention lock ordering to prevent deadlock",
      "For I/O-bound work, consider async over threads"
    ]
  },
  {
    id: "api",
    category: "LLD",
    icon: "🔌",
    title: "API Design",
    color: "#F4A261",
    tagline: "The contract between systems",
    simple: "An API is how two pieces of software talk to each other. Like a restaurant menu — it lists what you can order and how. Good API design = clear menu; bad API = confusing menu where customers leave hungry.",
    concepts: [
      {
        name: "REST",
        desc: "Use HTTP verbs (GET, POST, PUT, DELETE) on resources (URLs). Stateless. Standard, simple, ubiquitous. /users/123 is the user resource.",
        tradeoffs: {
          pros: ["Universally understood", "HTTP caching for free", "Stateless = scales easily", "Massive tooling ecosystem"],
          cons: ["Over-fetching (always returns whole resource)", "Multiple round trips for related data", "Versioning is painful"]
        },
        when: "Default for public APIs and CRUD operations.",
        interview: "Mention idempotency (PUT vs POST), HATEOAS (rarely used), proper status codes."
      },
      {
        name: "GraphQL",
        desc: "Client specifies exactly what data it needs. One endpoint, flexible queries. Solves over/under-fetching problem of REST.",
        tradeoffs: {
          pros: ["Client gets exactly what it needs", "Single round trip for nested data", "Strongly typed schema", "Great for mobile (limited bandwidth)"],
          cons: ["Caching is harder (every query is unique)", "N+1 query problem on backend", "Steeper learning curve", "Complexity attacks possible"]
        },
        when: "When clients need flexible queries (mobile, BFF pattern). Overkill for simple CRUD.",
        interview: "Mention DataLoader for N+1, depth limiting for security, schema federation for microservices."
      },
      {
        name: "gRPC",
        desc: "Binary protocol over HTTP/2. Define services in Protobuf. Strong types, streaming, fast. Used between microservices.",
        tradeoffs: {
          pros: ["Very fast (binary protocol)", "Strongly typed", "Native streaming support", "Generates client code in many languages"],
          cons: ["Not browser-friendly (needs gRPC-web)", "Less human-readable", "Steeper learning curve than REST", "Harder to debug"]
        },
        when: "Internal microservice communication where performance matters.",
        interview: "Mention: Protobuf efficiency, bidirectional streaming, contrast with REST for internal APIs."
      },
      {
        name: "Idempotency",
        desc: "Same request can be made multiple times with the same result. Critical for payments, retries. PUT is idempotent; POST usually isn't.",
        tradeoffs: {
          pros: ["Safe to retry (network failures handled cleanly)", "Simpler client code", "Required for distributed systems"],
          cons: ["Requires unique request IDs", "Backend must track processed IDs", "Harder to design (must think carefully)"]
        },
        when: "Always for write operations in distributed systems.",
        interview: "Mention idempotency keys (Stripe-style). Client sends UUID, server stores result for that UUID."
      },
      {
        name: "Versioning",
        desc: "Change an API without breaking existing clients. Common approaches: URL versioning (/v1/users), header versioning (Accept: v=1).",
        tradeoffs: {
          pros: ["URL versioning: visible, simple, easy to test", "Header versioning: clean URLs, content negotiation"],
          cons: ["Maintaining old versions is expensive", "URL versioning clutters URLs", "Header versioning is invisible to many tools"]
        },
        when: "Plan from day 1. Default to URL versioning for public APIs (most pragmatic).",
        interview: "Mention deprecation policy: 6-12 months notice, sunset headers, alerting heavy users."
      },
      {
        name: "Pagination",
        desc: "Large result sets split into pages. Two flavors: offset-based (page=2, size=20) and cursor-based (after=xyz).",
        tradeoffs: {
          pros: ["Offset: simple, jump to any page", "Cursor: stable across inserts/deletes, scales to large data"],
          cons: ["Offset: slow for deep pages (DB scans skipped rows)", "Offset: inconsistent if data changes during paging", "Cursor: can't jump to arbitrary page"]
        },
        when: "Cursor for infinite scroll/feeds. Offset for admin tables with stable data.",
        interview: "Cursor pagination is the modern default. Mention 'keyset pagination' for SQL."
      }
    ],
    use_cases: [
      {
        company: "Stripe API",
        title: "Idempotency keys for payment safety",
        problem: "Payment APIs cannot be 'retry-safe' by default — retrying a charge could double-bill. But network failures are common, so retries are necessary.",
        solution: "Stripe lets clients send an Idempotency-Key header (a UUID) with every write request. Stripe stores the response for that key for 24 hours. If the same key is used again, Stripe returns the cached response — no double charge. Clients can safely retry on any failure.",
        tradeoff: "Idempotency requires storing every request's response — expensive at Stripe's scale. They store only what's needed for replay and expire after 24 hours, balancing safety with cost.",
        takeaway: "Idempotency keys are the gold standard for payment APIs. Any API doing critical writes should support them."
      },
      {
        company: "GitHub API",
        title: "Cursor pagination for stable feeds",
        problem: "GitHub's events API returns activity feeds. With offset pagination, new events shifting the feed meant the same event could appear on multiple pages — or be skipped.",
        solution: "GitHub uses cursor-based pagination. Each page returns a 'next' link with an opaque cursor. The cursor encodes the last-seen ID. Even if new events arrive, you continue from where you left off. The Link header (RFC 5988) makes this discoverable.",
        tradeoff: "Cursors don't allow jumping to arbitrary pages — you can only go forward/backward. GitHub's UI doesn't need this, so the trade-off is acceptable.",
        takeaway: "Cursor pagination = stable, scalable, but inflexible. Offset pagination = flexible but inconsistent. Choose based on access pattern."
      },
      {
        company: "Facebook GraphQL",
        title: "Solving mobile bandwidth problems",
        problem: "Facebook's mobile app needed dozens of REST calls per screen — friends, posts, comments, likes, profiles. Slow networks made this painful.",
        solution: "Facebook invented GraphQL. The mobile client sends one query specifying exactly what it needs across all related data: 'give me my feed with posts, each post's comments, and each commenter's name.' One round trip, only the requested fields.",
        tradeoff: "GraphQL shifts complexity from client to server. The server must resolve arbitrary queries efficiently — solving N+1 problems with DataLoader, limiting query depth, etc. Backend engineering investment is significant.",
        takeaway: "GraphQL excels for clients with diverse, nested data needs. The server pays the cost; the client gets precision."
      }
    ],
    interview_tips: [
      "Always design idempotent write endpoints",
      "Use plural nouns for resource URLs: /users/123, not /user/123",
      "Return proper status codes: 200 for success, 4xx for client errors, 5xx for server errors",
      "Version from day 1 — adding versioning later is painful"
    ]
  },
  {
    id: "schema",
    category: "LLD",
    icon: "📋",
    title: "Schema & Modeling",
    color: "#7209B7",
    tagline: "Designing data structures right",
    simple: "Schema is the blueprint of your data — what tables, what columns, how they connect. Get this right and your app is easy to build. Get it wrong and you'll be fixing it for years.",
    concepts: [
      {
        name: "Normalization",
        desc: "Splitting data into tables to eliminate redundancy. Each fact stored once. Like a well-organized library where each book has one location.",
        tradeoffs: {
          pros: ["No data duplication (one source of truth)", "Updates are simple (change once)", "Smaller storage footprint"],
          cons: ["Reads require JOINs (slower)", "Complex queries", "Bad for analytics workloads"]
        },
        when: "Default for transactional (OLTP) systems. Normalize until you measure performance issues.",
        interview: "Mention normal forms (1NF, 2NF, 3NF). 3NF is the practical sweet spot."
      },
      {
        name: "Denormalization",
        desc: "Intentionally duplicate data to make reads faster. Trade write complexity for read speed. Common in NoSQL and analytics.",
        tradeoffs: {
          pros: ["Fast reads (no JOINs)", "Simpler queries", "Better for analytics and read-heavy workloads"],
          cons: ["Data duplication = update complexity", "Inconsistency risk", "More storage"]
        },
        when: "When read performance matters more than write simplicity. Most NoSQL designs use this.",
        interview: "Mention: read-heavy systems (social feeds), analytical databases, materialized views."
      },
      {
        name: "Indexing Strategy",
        desc: "Indexes speed up lookups. Choose columns that appear in WHERE, JOIN, ORDER BY clauses. Composite indexes for multi-column queries.",
        tradeoffs: {
          pros: ["1000x faster reads on indexed columns", "Enable efficient sorting", "Speed up JOINs"],
          cons: ["Slower writes (index must be updated)", "More storage", "Wrong indexes hurt without helping"]
        },
        when: "Index columns used in queries. Avoid indexing rarely-used or low-cardinality columns.",
        interview: "B-tree (default), Hash (exact match), Inverted (full-text). Mention covering indexes for read-only queries."
      },
      {
        name: "Foreign Keys vs Application-Level References",
        desc: "FKs enforce relationships at DB level. App-level: just store an ID, app code ensures integrity.",
        tradeoffs: {
          pros: ["FKs: bulletproof referential integrity, cascade operations", "App-level: more flexibility, easier sharding"],
          cons: ["FKs: harder to shard across databases, deadlock risk", "App-level: bugs cause orphaned records, more app code"]
        },
        when: "FKs for single-DB systems. App-level for sharded/distributed systems.",
        interview: "Mention: large-scale systems often skip FKs (Instagram, Facebook do). Trade safety for scalability."
      },
      {
        name: "Soft Deletes",
        desc: "Instead of DELETE, set a deleted_at timestamp. Data stays in DB but is filtered out. Allows recovery and audit trail.",
        tradeoffs: {
          pros: ["Recoverable deletes (oops, undo)", "Audit trail preserved", "Required for many compliance scenarios"],
          cons: ["Every query needs WHERE deleted_at IS NULL", "Storage grows forever without cleanup", "Easy to forget the filter (bugs leak deleted data)"]
        },
        when: "User data (often need recovery). Compliance scenarios. NOT for high-volume operational data.",
        interview: "Mention: partial indexes for active rows, periodic archival job, GDPR right-to-be-forgotten conflicts."
      },
      {
        name: "Embedding vs Referencing (NoSQL)",
        desc: "In document DBs: embed related data in one document, or reference by ID? Embedding = fast reads. Referencing = no duplication.",
        tradeoffs: {
          pros: ["Embedding: single read, atomic updates within doc, locality of reference", "Referencing: no duplication, smaller docs, flexible"],
          cons: ["Embedding: doc size limits (16MB in Mongo), update propagation issues", "Referencing: multiple queries (no JOINs in NoSQL), data inconsistency"]
        },
        when: "Embed when data is read together and changes together. Reference when data is large or shared across docs.",
        interview: "Example: blog post with comments — embed comments unless there are thousands. Then reference."
      }
    ],
    use_cases: [
      {
        company: "Instagram",
        title: "Denormalizing for fast feeds",
        problem: "Computing 'show me posts from people I follow' requires joining users → follows → posts. With billions of rows, this is too slow for a 200ms feed render.",
        solution: "Instagram denormalizes feed data. When User A posts, the post ID is written to the feed of every follower (Redis sorted sets). Reading a feed = single Redis call. They accept the write amplification (one post = thousands of writes) for instant reads.",
        tradeoff: "Write amplification is brutal — a celebrity posting triggers millions of writes. Instagram limits this with hybrid push/pull strategies for popular accounts.",
        takeaway: "Denormalization for reads is a key technique at scale. The cost is write complexity and potential inconsistency."
      },
      {
        company: "Shopify",
        title: "Multi-tenant schema design",
        problem: "Millions of stores share one Shopify infrastructure. Each store has its own products, orders, customers — but they share databases.",
        solution: "Shopify uses a 'tenant_id' (shop_id) column on every table. Every query is filtered by shop_id. They use Postgres schema-per-tenant for some workloads, but mostly column-based isolation. Sharding is by shop_id, so one shop's data lives on one shard.",
        tradeoff: "Shared schema means a schema change affects all tenants. Shopify built sophisticated migration tooling and rolling deployments to manage this safely.",
        takeaway: "Multi-tenant design: shared schema with tenant_id column is the most common approach. Schema-per-tenant for high isolation needs."
      },
      {
        company: "Airbnb",
        title: "Soft deletes for compliance and undo",
        problem: "When a host deletes a listing, related bookings, reviews, and messages reference it. Hard deletion would orphan data. Plus regulators require data retention.",
        solution: "Airbnb uses soft deletes (deleted_at column) for user-facing entities. Listings, reviews, messages stay in the DB but are filtered out. Background jobs archive old soft-deleted data after retention periods. GDPR right-to-be-forgotten triggers actual deletion via separate workflow.",
        tradeoff: "Every query needs the deleted_at filter. Forgetting it is a serious bug (leaks deleted data). Airbnb uses ORM defaults and code review to enforce it.",
        takeaway: "Soft deletes are about preserving relationships and enabling recovery. The cost is eternal vigilance with filters and storage growth."
      }
    ],
    interview_tips: [
      "Start with a normalized schema, denormalize only when measurements demand it",
      "Always discuss indexes — most performance interview questions hinge on this",
      "Mention sharding strategy if scale is mentioned",
      "For NoSQL: design schema around access patterns, not entities"
    ]
  },
  {
    id: "interview-framework",
    category: "FRAMEWORK",
    icon: "🎓",
    title: "Interview Framework",
    color: "#FFB703",
    tagline: "How to approach any system design question",
    simple: "Use a structured approach so you never freeze in an interview. Start broad, dive deep, discuss trade-offs. The framework matters more than perfect answers.",
    concepts: [
      {
        name: "Step 1: Clarify Requirements (5 min)",
        desc: "Ask questions before designing. Functional (what does it do?) and non-functional (how fast, how big?). Never assume.",
        tradeoffs: {
          pros: ["Prevents solving the wrong problem", "Shows engineering maturity", "Sets scope (interviewer can't trap you)"]
        },
        when: "Always. Spend the first 5 minutes asking questions, even if it feels slow.",
        interview: "Ask: How many users? Read/write ratio? Latency requirements? Geographic distribution? Specific features in scope?"
      },
      {
        name: "Step 2: Capacity Estimation (3 min)",
        desc: "Back-of-envelope numbers: QPS, storage, bandwidth. Establishes whether you need a small or massive system.",
        tradeoffs: {
          pros: ["Justifies architecture choices with numbers", "Shows quantitative thinking", "Sets the scale of the problem"]
        },
        when: "Always for system design rounds. Skip for pure LLD/coding rounds.",
        interview: "Memorize: 1B users → ~12K QPS at 1 req/day. 1KB per request × 1B requests = 1TB/day storage. Use these as anchors."
      },
      {
        name: "Step 3: High-Level Design (10 min)",
        desc: "Draw boxes: clients, load balancer, app servers, database, cache, queues. Show data flow. Don't dive into details yet.",
        tradeoffs: {
          pros: ["Communicates the big picture", "Easy to discuss alternatives", "Sets up the deep dive"]
        },
        when: "After clarifying and estimating. This is what interviewers expect to see by minute 15.",
        interview: "Standard components: client → CDN → LB → API gateway → services → DB + cache. Add queue for async. Don't over-engineer."
      },
      {
        name: "Step 4: Deep Dive (15 min)",
        desc: "Pick 1-2 components and go deep. Database schema. Caching strategy. API design. Show you understand the details.",
        tradeoffs: {
          pros: ["Demonstrates depth of knowledge", "Shows trade-off awareness", "Differentiates senior from junior"]
        },
        when: "After HLD. Let the interviewer guide which area to deep dive on.",
        interview: "Be ready to deep-dive: schema design, sharding, caching strategy, consistency model, failure modes."
      },
      {
        name: "Step 5: Address Bottlenecks (5 min)",
        desc: "Identify what breaks at scale. How do you handle it? Caching, sharding, replication, CDN, queues.",
        tradeoffs: {
          pros: ["Shows you can think about scale", "Anticipates interviewer's follow-ups", "Demonstrates production thinking"]
        },
        when: "Last 5-10 minutes. Discuss what you'd add for 10x or 100x scale.",
        interview: "Common bottlenecks: DB writes, single-region latency, hot keys, cache stampedes, cascade failures."
      },
      {
        name: "LLD-Specific: Class Design",
        desc: "For LLD rounds: identify entities (nouns), behaviors (verbs), relationships. Apply SOLID. Use design patterns where appropriate.",
        tradeoffs: {
          pros: ["Structured class design", "SOLID-compliant from start", "Easy to evolve"]
        },
        when: "LLD rounds (parking lot, elevator, library system, etc.).",
        interview: "Pattern: entities → relationships → operations → patterns. Justify every pattern you use."
      }
    ],
    use_cases: [
      {
        company: "FAANG Interview",
        title: "Designing Twitter",
        problem: "45-minute system design round. You need to design Twitter from scratch. How do you not freeze?",
        solution: "Apply the framework. (1) Clarify: 'How many users? Just tweets/timeline or also DMs?' (2) Estimate: '500M users, 200M DAU, ~5K tweets/sec at peak.' (3) HLD: client → LB → tweet service + timeline service → Cassandra (tweets) + Redis (timelines). (4) Deep dive: timeline fan-out strategy, hybrid push/pull for celebrities. (5) Bottlenecks: hot keys (Beyoncé), cache invalidation, geographic distribution.",
        tradeoff: "The framework can feel slow at first. But interviewers prefer structured candidates over fast-but-chaotic ones. Practice until it's automatic.",
        takeaway: "Structure beats brilliance. A clean framework produces consistent results across interviewers and problems."
      },
      {
        company: "FAANG LLD Round",
        title: "Designing a Parking Lot",
        problem: "30-minute LLD round. Design a parking lot system with classes and methods.",
        solution: "Apply LLD framework. (1) Clarify: 'Multi-floor? Vehicle types? Pricing?' (2) Entities: ParkingLot, Floor, ParkingSpot, Vehicle (with subclasses Car, Bike, Truck). (3) Relationships: Lot has Floors, Floor has Spots, Spot can hold Vehicle. (4) Patterns: Strategy for pricing, Factory for spot assignment, Singleton for the lot itself. (5) SOLID: each class has one job; pricing is open for extension via strategy.",
        tradeoff: "LLD interviews reward depth over breadth. Don't try to model everything — focus on the core abstractions and one or two extension points.",
        takeaway: "LLD = identify entities, define interactions, apply patterns where they fit. Don't force patterns where they don't belong."
      }
    ],
    interview_tips: [
      "Always clarify requirements before designing",
      "Talk through trade-offs continuously — don't just pick a solution silently",
      "Draw diagrams (whiteboard or shared doc) — visual structure helps both you and interviewer",
      "When stuck: explicitly state assumptions and move forward",
      "The interviewer steers — let them guide which areas to deep dive"
    ]
  }
];

const InterviewBadge = () => (
  <span style={{
    background: "linear-gradient(135deg, #FFD93D, #FF9F1C)",
    color: "#1a1a2e",
    fontSize: "0.6rem",
    fontWeight: "800",
    padding: "2px 8px",
    borderRadius: "20px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "'DM Mono', monospace"
  }}>Interview</span>
);

export default function SystemDesignGuide() {
  const [active, setActive] = useState(topics[0].id);
  const [expandedConcept, setExpandedConcept] = useState(null);
  const [expandedCase, setExpandedCase] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showSidebar, setShowSidebar] = useState(false);

  const filteredTopics = activeFilter === "ALL"
    ? topics
    : topics.filter(t => t.category === activeFilter);

  const topic = topics.find(t => t.id === active);

  const categoryMeta = {
    HLD: { label: "High Level Design", color: "#4CC9F0" },
    LLD: { label: "Low Level Design", color: "#F77F00" },
    FRAMEWORK: { label: "Framework", color: "#FFB703" }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      color: "#e8e8f0",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; overflow-x: hidden; }
        
        .topic-btn:hover { transform: translateX(4px); }
        .topic-btn { transition: all 0.2s ease; cursor: pointer; }
        
        .concept-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important; }
        .concept-card { transition: all 0.25s ease; cursor: pointer; }

        .case-tab:hover { background: rgba(255,255,255,0.03) !important; }
        .case-tab { transition: all 0.2s ease; cursor: pointer; }

        .filter-btn { transition: all 0.2s ease; cursor: pointer; }
        .filter-btn:hover { transform: translateY(-1px); }

        .tip-item { 
          border-left: 2px solid;
          padding-left: 12px;
          margin-bottom: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          line-height: 1.6;
          color: #b0b0c8;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a14; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 4px; }

        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }
          .mobile-menu-btn { display: block !important; }
          .sidebar-mobile { position: fixed !important; left: 0 !important; top: 60px !important; width: 100% !important; height: calc(100% - 60px) !important; z-index: 1000 !important; }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .sidebar-overlay { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid #1e1e30",
        background: "linear-gradient(180deg, #0d0d1f 0%, #0a0a14 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.2rem" }}>📐</span>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1rem, 4vw, 1.2rem)",
            fontWeight: 900,
            color: "#fff"
          }}>System Design</h1>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            background: "#4CC9F0",
            border: "none",
            color: "#0a0a14",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem"
          }}
        >
          {showSidebar ? "✕" : "☰ Topics"}
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div style={{ display: "flex", flex: 1, width: "100%" }}>

        {/* Sidebar */}
        <div className="sidebar-mobile" style={{
          width: showSidebar ? "100%" : 240,
          maxWidth: showSidebar ? "100%" : 240,
          paddingTop: showSidebar ? 12 : 32,
          paddingRight: showSidebar ? 12 : 24,
          paddingLeft: showSidebar ? 12 : 0,
          flexShrink: 0,
          position: showSidebar ? "fixed" : "sticky",
          top: showSidebar ? 0 : 0,
          left: showSidebar ? 0 : "auto",
          background: showSidebar ? "#0a0a14" : "transparent",
          zIndex: showSidebar ? 1000 : "auto",
          alignSelf: "flex-start",
          maxHeight: showSidebar ? "100vh" : "100vh",
          overflowY: "auto",
          transition: "all 0.3s ease",
          display: showSidebar ? "block" : "block"
        }}>
          {["HLD", "LLD", "FRAMEWORK"].map(category => {
            const catTopics = filteredTopics.filter(t => t.category === category);
            if (catTopics.length === 0) return null;
            return (
              <div key={category} style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  color: categoryMeta[category].color,
                  textTransform: "uppercase",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <div style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: categoryMeta[category].color
                  }} />
                  {categoryMeta[category].label}
                </div>
                {catTopics.map(t => (
                  <button
                    key={t.id}
                    className="topic-btn"
                    onClick={() => { setActive(t.id); setExpandedConcept(null); setExpandedCase(0); setShowSidebar(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      background: active === t.id
                        ? `linear-gradient(90deg, ${t.color}18, transparent)`
                        : "transparent",
                      border: "none",
                      borderLeft: active === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                      borderRadius: "0 8px 8px 0",
                      padding: "8px 12px",
                      color: active === t.id ? "#fff" : "#4a4a6a",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.82rem",
                      fontWeight: active === t.id ? 500 : 400,
                      textAlign: "left"
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{t.icon}</span>
                    {t.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, paddingTop: 32, paddingBottom: 60, minWidth: 0 }}>

          {/* Topic Header */}
          <div style={{
            borderBottom: `1px solid ${topic.color}30`,
            paddingBottom: 20,
            marginBottom: 28
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: "2rem",
                background: `${topic.color}15`,
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${topic.color}30`
              }}>{topic.icon}</span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.6rem",
                    color: categoryMeta[topic.category].color,
                    background: `${categoryMeta[topic.category].color}15`,
                    border: `1px solid ${categoryMeta[topic.category].color}40`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: "0.1em"
                  }}>{topic.category}</span>
                </div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "#fff"
                }}>{topic.title}</h2>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.72rem",
                  color: topic.color,
                  letterSpacing: "0.08em"
                }}>{topic.tagline}</div>
              </div>
            </div>

            {/* ELI5 Box */}
            <div style={{
              background: `linear-gradient(135deg, ${topic.color}0d, ${topic.color}05)`,
              border: `1px solid ${topic.color}25`,
              borderRadius: 12,
              padding: "16px 20px",
              marginTop: 16
            }}>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
                color: topic.color,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 8
              }}>Simple Explanation</div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.92rem",
                lineHeight: 1.7,
                color: "#c0c0d8"
              }}>{topic.simple}</p>
            </div>
          </div>

          {/* Concepts */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem",
              letterSpacing: "0.15em",
              color: "#3a3a5c",
              textTransform: "uppercase",
              marginBottom: 14
            }}>Key Concepts · Click to Expand</div>
            <div style={{ display: "grid", gap: 10 }}>
              {topic.concepts.map((c, i) => (
                <div
                  key={i}
                  className="concept-card"
                  onClick={() => setExpandedConcept(expandedConcept === i ? null : i)}
                  style={{
                    background: "#10101e",
                    border: `1px solid ${expandedConcept === i ? topic.color + "50" : "#1e1e30"}`,
                    borderRadius: 12,
                    padding: "14px 18px",
                    boxShadow: expandedConcept === i ? `0 0 20px ${topic.color}15` : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: expandedConcept === i ? topic.color : "#d0d0e8"
                    }}>{c.name}</div>
                    <span style={{ color: "#3a3a5c", fontSize: "0.8rem" }}>
                      {expandedConcept === i ? "▲" : "▼"}
                    </span>
                  </div>

                  {expandedConcept === i && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.86rem",
                        lineHeight: 1.7,
                        color: "#9090b0",
                        marginBottom: 14
                      }}>{c.desc}</p>

                      {/* Trade-offs */}
                      {c.tradeoffs && (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: c.tradeoffs.cons ? "1fr 1fr" : "1fr",
                          gap: 10,
                          marginBottom: 12
                        }}>
                          {c.tradeoffs.pros && (
                            <div style={{
                              background: "#06D6A008",
                              border: "1px solid #06D6A025",
                              borderRadius: 8,
                              padding: "10px 12px"
                            }}>
                              <div style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "0.58rem",
                                color: "#06D6A0",
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                marginBottom: 6,
                                fontWeight: 600
                              }}>✓ Pros</div>
                              <ul style={{
                                listStyle: "none",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "0.78rem",
                                lineHeight: 1.55,
                                color: "#80c8a0"
                              }}>
                                {c.tradeoffs.pros.map((p, idx) => (
                                  <li key={idx} style={{ marginBottom: 4, paddingLeft: 12, position: "relative" }}>
                                    <span style={{ position: "absolute", left: 0, color: "#06D6A0" }}>+</span>
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {c.tradeoffs.cons && (
                            <div style={{
                              background: "#FF6B6B08",
                              border: "1px solid #FF6B6B25",
                              borderRadius: 8,
                              padding: "10px 12px"
                            }}>
                              <div style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "0.58rem",
                                color: "#FF6B6B",
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                marginBottom: 6,
                                fontWeight: 600
                              }}>✗ Cons</div>
                              <ul style={{
                                listStyle: "none",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "0.78rem",
                                lineHeight: 1.55,
                                color: "#d09090"
                              }}>
                                {c.tradeoffs.cons.map((con, idx) => (
                                  <li key={idx} style={{ marginBottom: 4, paddingLeft: 12, position: "relative" }}>
                                    <span style={{ position: "absolute", left: 0, color: "#FF6B6B" }}>−</span>
                                    {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* When to use */}
                      {c.when && (
                        <div style={{
                          background: `${topic.color}0a`,
                          border: `1px solid ${topic.color}25`,
                          borderRadius: 8,
                          padding: "10px 14px",
                          marginBottom: 10
                        }}>
                          <div style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.58rem",
                            color: topic.color,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            marginBottom: 4,
                            fontWeight: 600
                          }}>◆ When to use</div>
                          <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.8rem",
                            lineHeight: 1.6,
                            color: "#a8a8c8"
                          }}>{c.when}</p>
                        </div>
                      )}

                      <div style={{
                        background: "#FFD93D0d",
                        border: "1px solid #FFD93D25",
                        borderRadius: 8,
                        padding: "10px 14px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <InterviewBadge />
                          <span style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.6rem",
                            color: "#FFD93D",
                            letterSpacing: "0.1em"
                          }}>What to say in an interview</span>
                        </div>
                        <p style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.82rem",
                          lineHeight: 1.65,
                          color: "#c0a060"
                        }}>{c.interview}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* REAL WORLD USE CASES */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: "0.9rem" }}>🌍</span>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                color: topic.color,
                textTransform: "uppercase"
              }}>Real-World Case Studies</div>
              <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${topic.color}40 0%, transparent 100%)` }} />
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex",
              gap: 4,
              marginBottom: 16,
              borderBottom: "1px solid #1e1e30",
              flexWrap: "wrap"
            }}>
              {topic.use_cases.map((uc, i) => (
                <button
                  key={i}
                  className="case-tab"
                  onClick={() => setExpandedCase(i)}
                  style={{
                    background: expandedCase === i ? `${topic.color}15` : "transparent",
                    border: "none",
                    borderBottom: expandedCase === i ? `2px solid ${topic.color}` : "2px solid transparent",
                    padding: "10px 16px",
                    color: expandedCase === i ? topic.color : "#6060a0",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: expandedCase === i ? 600 : 400,
                    cursor: "pointer",
                    marginBottom: -1
                  }}
                >
                  {uc.company}
                </button>
              ))}
            </div>

            {/* Active case */}
            {topic.use_cases[expandedCase] && (
              <div style={{
                background: "#0d0d1c",
                border: `1px solid ${topic.color}25`,
                borderRadius: 14,
                padding: "22px 26px",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  background: `radial-gradient(circle at top right, ${topic.color}20, transparent 70%)`,
                  pointerEvents: "none"
                }} />

                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: topic.color
                  }}>{topic.use_cases[expandedCase].company}</span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    color: "#3a3a5c",
                    letterSpacing: "0.1em"
                  }}>CASE STUDY · {expandedCase + 1} / {topic.use_cases.length}</span>
                </div>

                <h3 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 18
                }}>{topic.use_cases[expandedCase].title}</h3>

                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.6rem",
                    color: "#FF6B6B",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 6
                  }}>⚠ The Problem</div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    color: "#b8b8d0"
                  }}>{topic.use_cases[expandedCase].problem}</p>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.6rem",
                    color: "#06D6A0",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 6
                  }}>✓ The Solution</div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    color: "#c8c8e0"
                  }}>{topic.use_cases[expandedCase].solution}</p>
                </div>

                {topic.use_cases[expandedCase].tradeoff && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.6rem",
                      color: "#FFD93D",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 6
                    }}>⚖ The Trade-off</div>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.88rem",
                      lineHeight: 1.7,
                      color: "#c8c0a0"
                    }}>{topic.use_cases[expandedCase].tradeoff}</p>
                  </div>
                )}

                <div style={{
                  background: `linear-gradient(135deg, ${topic.color}10, transparent)`,
                  border: `1px solid ${topic.color}30`,
                  borderLeft: `3px solid ${topic.color}`,
                  borderRadius: 8,
                  padding: "12px 16px"
                }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.6rem",
                    color: topic.color,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 6
                  }}>★ Interview Takeaway</div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.86rem",
                    lineHeight: 1.65,
                    color: "#e0e0f0",
                    fontStyle: "italic"
                  }}>{topic.use_cases[expandedCase].takeaway}</p>
                </div>
              </div>
            )}
          </div>

          {/* Interview Tips */}
          <div style={{
            background: "linear-gradient(135deg, #FFD93D08, #FF9F1C05)",
            border: "1px solid #FFD93D20",
            borderRadius: 14,
            padding: "20px 24px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: "1.1rem" }}>💡</span>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "#FFD93D",
                textTransform: "uppercase"
              }}>Interview Cheat Sheet for {topic.title}</div>
            </div>
            {topic.interview_tips.map((tip, i) => (
              <div key={i} className="tip-item" style={{ borderColor: topic.color + "60" }}>
                {tip}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 36,
            gap: 12
          }}>
            {topics.findIndex(t => t.id === active) > 0 && (
              <button
                onClick={() => {
                  const idx = topics.findIndex(t => t.id === active);
                  setActive(topics[idx - 1].id);
                  setExpandedConcept(null);
                  setExpandedCase(0);
                }}
                style={{
                  background: "#10101e",
                  border: "1px solid #1e1e30",
                  borderRadius: 10,
                  padding: "10px 20px",
                  color: "#6060a0",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                ← {topics[topics.findIndex(t => t.id === active) - 1].title}
              </button>
            )}
            <div style={{ flex: 1 }} />
            {topics.findIndex(t => t.id === active) < topics.length - 1 && (
              <button
                onClick={() => {
                  const idx = topics.findIndex(t => t.id === active);
                  setActive(topics[idx + 1].id);
                  setExpandedConcept(null);
                  setExpandedCase(0);
                }}
                style={{
                  background: `linear-gradient(135deg, ${topic.color}20, ${topic.color}10)`,
                  border: `1px solid ${topic.color}40`,
                  borderRadius: 10,
                  padding: "10px 20px",
                  color: topic.color,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                {topics[topics.findIndex(t => t.id === active) + 1].title} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}