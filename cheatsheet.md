# Senior SWE Interview Cheat-Sheet

> A scannable reference for technical interviews — data structures, algorithmic patterns, recognition cues, and senior-level pairings. Designed for daily review.

**How to use this:**
- **Daily scan (5 min):** read Sections 3 and 4 — the recognition cues and pairings. These build pattern-recognition speed.
- **Weekly deep dive:** Sections 1 and 2 — refresh complexities and gotchas.
- **Pre-interview:** Section 5 — senior-only topics likely to differentiate you.

**Color tier convention** (used in the HTML version):
- 🟢 Green — `O(1)`, `O(log n)`, `O(α(n))`
- 🟡 Yellow — `O(n)`, `O(n log n)`, `O(L)`, `O(V+E)`
- 🟠 Orange — `O(n²)`, `O(V²)`
- 🔴 Red — `O(2ⁿ)`, `O(n!)`, `O(n·W)`

---

## 1. Data Structures

### Linear

| Structure | Java | Access | Insert | Delete | Worst | Senior insight |
|---|---|---|---|---|---|---|
| Array (static) | `int[]` | 🟢 O(1) | 🟡 O(n) | 🟡 O(n) | — | Best cache locality. Fixed size. |
| Dynamic Array | `ArrayList<>` | 🟢 O(1) | 🟢 O(1)* end / 🟡 O(n) mid | 🟡 O(n) | — | *Amortized. Pre-size to avoid copies. |
| Linked List | `LinkedList<>` | 🟡 O(n) | 🟢 O(1) at node | 🟢 O(1) at node | — | Bad cache locality. Rarely best. |
| Doubly Linked List | custom Node | 🟡 O(n) | 🟢 O(1) | 🟢 O(1) | — | Used inside LRU cache. |
| Stack | `ArrayDeque` | — | 🟢 O(1) push | 🟢 O(1) pop | — | Never use `java.util.Stack`. |
| Queue | `ArrayDeque` | — | 🟢 O(1) offer | 🟢 O(1) poll | — | Use bounded for concurrency. |
| Deque | `ArrayDeque` | — | 🟢 O(1) both ends | 🟢 O(1) both ends | — | Swiss army knife. |

### Hash-Based

| Structure | Java | Get | Put | Remove | Worst | Senior insight |
|---|---|---|---|---|---|---|
| HashMap | `HashMap<>` | 🟢 O(1) avg | 🟢 O(1) avg | 🟢 O(1) avg | 🟡 O(n) | Buckets become trees at 8+ collisions (Java 8+). |
| HashSet | `HashSet<>` | 🟢 O(1) avg | 🟢 O(1) avg | 🟢 O(1) avg | 🟡 O(n) | Backed by HashMap internally. |
| LinkedHashMap | `LinkedHashMap<>` | 🟢 O(1) avg | 🟢 O(1) avg | 🟢 O(1) avg | 🟡 O(n) | LRU shortcut: `accessOrder=true`. |

### Trees & Heaps

| Structure | Java | Search | Insert | Delete | Senior insight |
|---|---|---|---|---|---|
| TreeMap (sorted) | `TreeMap<>` | 🟢 O(log n) | 🟢 O(log n) | 🟢 O(log n) | Red-Black. Floor/ceiling in O(log n). |
| TreeSet (sorted) | `TreeSet<>` | 🟢 O(log n) | 🟢 O(log n) | 🟢 O(log n) | Backed by TreeMap. |
| BST (plain) | custom | 🟢 O(log n) avg | 🟢 O(log n) avg | 🟢 O(log n) avg | 🟠 O(n) worst — clarify "balanced?" |
| Heap / PQ | `PriorityQueue<>` | 🟡 O(n) contains | 🟢 O(log n) offer | 🟢 O(log n) poll | Peek O(1). Top-K classic. |
| Trie | custom node | 🟡 O(L) | 🟡 O(L) | 🟡 O(L) | Memory-heavy. Array[26] for ASCII. |

### Graphs

| Structure | Edge check | Iterate neighbors | Space | When |
|---|---|---|---|---|
| Adjacency List | 🟡 O(deg) | 🟡 O(deg) | 🟡 O(V+E) | Sparse graphs (default). |
| Adjacency Matrix | 🟢 O(1) | 🟡 O(V) | 🟠 O(V²) | Dense graphs only. |

### Advanced / Range Queries

| Structure | Query | Update | Space | When |
|---|---|---|---|---|
| Union-Find | 🟢 O(α(n)) | 🟢 O(α(n)) | 🟡 O(n) | Dynamic connectivity. |
| Segment Tree | 🟢 O(log n) | 🟢 O(log n) | 🟡 O(n) | Range query + update. |
| Fenwick Tree (BIT) | 🟢 O(log n) | 🟢 O(log n) | 🟡 O(n) | Prefix sum + point update. |
| B-Tree / B+ Tree | 🟢 O(log n) | 🟢 O(log n) | 🟡 O(n) | Disk-based (DBs, FS). System design. |

### Concurrency cheat-sheet (senior differentiator)

| Need | Use | Don't use |
|---|---|---|
| Thread-safe map | `ConcurrentHashMap` | `Hashtable` (legacy) |
| Thread-safe queue | `ArrayBlockingQueue` (bounded) | unbounded blocking queue (OOM risk) |
| Thread-safe sorted map | `ConcurrentSkipListMap` | `Collections.synchronizedMap(TreeMap)` |
| Thread-safe set | `ConcurrentHashMap.newKeySet()` | `Collections.synchronizedSet` |
| Read-heavy list | `CopyOnWriteArrayList` | `Vector` |

---

## 2. Algorithmic Patterns

### Array & String

| Pattern | Mental cue | Time | Space | Pairs with | Classic problems |
|---|---|---|---|---|---|
| **Two Pointers** | "Move L/R based on condition?" | 🟡 O(n) | 🟢 O(1) | array | 3Sum, Container With Most Water |
| **Sliding Window (fixed)** | "Window of size K" | 🟡 O(n) | 🟢 O(1) | array | Max Sum Subarray of K |
| **Sliding Window (dynamic)** | "Running range that grows/shrinks" | 🟡 O(n) | 🟢 O(k) | HashMap, HashSet | Longest Substring No Repeat, Min Window |
| **Fast & Slow Pointers** | "Tortoise and hare" | 🟡 O(n) | 🟢 O(1) | LinkedList | Cycle, Find Duplicate |

### Searching

| Pattern | Mental cue | Time | Pairs with | Classic |
|---|---|---|---|---|
| **Binary Search** | "Eliminate half each step" | 🟢 O(log n) | array | Search Rotated, First/Last Position |
| **Binary Search on Answer** | "Is X feasible? + monotonic" | 🟡 O(n log range) | array | Koko Bananas, Capacity to Ship |

### Sum & Prefix

| Pattern | Mental cue | Time | Pairs with | Classic |
|---|---|---|---|---|
| **Prefix Sum** | "Precompute cumulative info" | 🟡 O(n) prep / 🟢 O(1) query | HashMap | Subarray Sum = K |
| **Difference Array** | "Many adds, one read" | 🟢 O(1) per update | array | Range Addition |
| **Hashing / Frequency** | "Fast lookup while scanning" | 🟡 O(n) | HashMap, HashSet | Two Sum, Group Anagrams |
| **Kadane's** | "Best subarray ending here" | 🟡 O(n) | array | Maximum Subarray |

### Stack & Queue

| Pattern | Mental cue | Time | Pairs with | Classic |
|---|---|---|---|---|
| **Monotonic Stack** | "Nearest larger/smaller" | 🟡 O(n) | Stack | Daily Temperatures, Largest Rectangle |
| **Monotonic Deque** | "Window extreme in O(n)" | 🟡 O(n) | Deque | Sliding Window Maximum |

### Graph & Tree

| Pattern | Mental cue | Time | Pairs with | Classic |
|---|---|---|---|---|
| **DFS** | "Explore one branch fully" | 🟡 O(V+E) | Stack, HashSet | Number of Islands, Path Sum |
| **BFS** | "Layer by layer" | 🟡 O(V+E) | Queue, HashSet | Word Ladder, Rotting Oranges |
| **Topological Sort** | "Prereqs before dependents" | 🟡 O(V+E) | Adj List, Queue | Course Schedule, Alien Dictionary |
| **Union-Find** | "Are X and Y in the same group?" | 🟢 O(α(n)) | DSU array | Number of Provinces, Accounts Merge |
| **Matrix Traversal** | "4-dir or 8-dir neighbors" | 🟡 O(m·n) | Queue | Flood Fill, Spiral Matrix |

### Greedy & Intervals

| Pattern | Mental cue | Time | Pairs with | Classic |
|---|---|---|---|---|
| **Greedy** | "Locally best → globally optimal" | 🟡 O(n log n) | sort, Heap | Jump Game, Gas Station |
| **Interval Processing** | "Sort and sweep" | 🟡 O(n log n) | array, sort | Merge Intervals, Insert Interval |
| **Sweep Line** | "Turn intervals into +1/-1 events" | 🟡 O(n log n) | Heap, TreeMap | Meeting Rooms II, Skyline |
| **Heap / Top-K** | "Next best item repeatedly" | 🟡 O(n log k) | PriorityQueue | Kth Largest, Top K Frequent, Median Stream |

### Dynamic Programming

| Pattern | Mental cue | Time | Pairs with | Classic |
|---|---|---|---|---|
| **DP 1D** | "Depends on a few earlier answers" | 🟡 O(n) – 🟠 O(n²) | array | House Robber, Coin Change |
| **DP 2D** | "State on (i, j)" | 🟠 O(m·n) | matrix | Edit Distance, LCS, Unique Paths |
| **DP Knapsack** | "Take it or leave it, with capacity" | 🔴 O(n·W) | array | Partition Equal Subset, Coin Change II |
| **Memoized DFS** | "Recursion recomputes same thing" | depends | HashMap | Word Break, Decode Ways |

### Misc

| Pattern | Mental cue | Time | Classic |
|---|---|---|---|
| **Backtracking** | "Try, recurse, undo" | 🔴 O(2ⁿ) / O(n!) | Subsets, Permutations, N-Queens |
| **Bit Manipulation** | "Encode state in bits" | 🟢 O(1) per op | Single Number, Subsets via bitmask |

---

## 3. Recognition Cues — Problem signal → Pattern

> Use during the first 30 seconds of any problem. *Most problems have ONE primary pattern. Hard problems combine 2–3.*

### Array & String

| If you see... | Reach for |
|---|---|
| Sorted array + pair/triplet sum | Two Pointers |
| Pair with target sum (unsorted) | Hashing |
| "Longest/shortest substring with X" | Sliding Window (dynamic) |
| Window of fixed size K | Sliding Window (fixed) |
| Subarray sum equals K | Prefix Sum + HashMap |
| Range sum queries (immutable) | Prefix Sum |
| Many range updates, one read | Difference Array |
| Maximum contiguous subarray | Kadane's |

### Search

| If you see... | Reach for |
|---|---|
| Find in sorted / O(log n) | Binary Search |
| "Minimize the max" / "Maximize the min" | Binary Search on Answer |
| K-th smallest | Heap or Binary Search on Answer |

### Linked List

| If you see... | Reach for |
|---|---|
| Cycle detection / find duplicate O(1) space | Fast & Slow Pointers |
| Middle of linked list | Fast & Slow Pointers |
| LRU cache | HashMap + Doubly Linked List |

### Stack / Queue

| If you see... | Reach for |
|---|---|
| Next greater / smaller | Monotonic Stack |
| Histogram / largest rectangle | Monotonic Stack |
| Sliding window max/min | Monotonic Deque |
| Parentheses / parsing | Stack |

### Graph

| If you see... | Reach for |
|---|---|
| Shortest path, unweighted | BFS |
| Shortest path, positive weights | Dijkstra (Heap + Adj List) |
| All paths / configurations | Backtracking / DFS |
| Connected components | Union-Find or DFS/BFS |
| Course schedule / dependencies | Topological Sort |
| Cycle in directed graph | Topo Sort or DFS |
| Cycle in undirected graph | Union-Find or DFS |

### Tree / Grid

| If you see... | Reach for |
|---|---|
| Level-order traversal | BFS |
| Tree depth / path-sum | DFS |
| Grid neighbors / flood fill | DFS or BFS |

### Intervals & Greedy

| If you see... | Reach for |
|---|---|
| Merge / overlap intervals | Interval (sort + sweep) |
| Meeting rooms (count of rooms) | Sweep Line or Heap |
| Skyline / events on timeline | Sweep Line |
| Top K / K closest | Heap |
| Streaming median | Two Heaps |

### DP

| If you see... | Reach for |
|---|---|
| "Number of ways" / count configs | DP (1D / 2D) |
| Min cost / max value with overlapping choices | DP |
| Pick or skip items + capacity | Knapsack DP |
| Two strings — edit / compare | DP 2D |
| Recursion repeats subproblems | Memoized DFS |

### Strings & Bits

| If you see... | Reach for |
|---|---|
| Prefix matching / autocomplete | Trie |
| Anagrams / group by signature | Hashing |
| Palindrome | Two Pointers or DP 2D |
| Single element among pairs | XOR (Bit Manipulation) |
| All subsets of small set (≤20) | Bitmask |

---

## 4. Pattern + Data Structure Pairings

> The senior-level layer. Knowing *which DS* to reach for inside a pattern is what separates mid from senior.

| Pattern | Pairs with | Why |
|---|---|---|
| Sliding Window (dynamic) | HashMap, HashSet | Track frequency in window |
| BFS | Queue + HashSet | Frontier + visited |
| DFS | Stack + HashSet | Iterative or recursion |
| Topological Sort | Adj List + Queue + HashMap | Indegree map + frontier |
| Greedy | Sort + Heap | Either pre-sort or extract-best |
| Interval | Sort + Heap | Sort by start, heap of end times |
| Sweep Line | Heap or TreeMap | Active set at each event |
| DP | Array or HashMap memo | dp[] array or recursion+memo |
| Backtracking | ArrayList + HashSet | Mutable path + visited |
| Monotonic Stack | ArrayDeque | Push indices, not values |
| Prefix Sum | Array + HashMap | Cumulative + complement lookup |
| Union-Find | Parent[] + Rank[] | Path compression + union by rank |
| Top-K | PriorityQueue | Min-heap of size K |

### Composite designs (Hard problems = pattern + multi-DS)

| Design | Structures | Pattern | Notes |
|---|---|---|---|
| **LRU Cache** | HashMap + DoublyLinkedList | — | Or `LinkedHashMap(accessOrder=true)` |
| **Word Search II** | Trie + grid | Backtracking + DFS | Trie enables prefix pruning |
| **Streaming Median** | Two Heaps | Heap pattern | Max-heap (lower) + min-heap (upper) |
| **Dijkstra** | PriorityQueue + HashMap + Adj List | BFS variant | Skip if popped distance > known |
| **Insert/Delete/GetRandom O(1)** | HashMap + ArrayList | — | Swap-with-last on delete |
| **Rate Limiter** | Queue + HashMap (Concurrent) | — | Sliding window log per user |
| **Autocomplete System** | Trie | DFS | Aggregate counts per prefix node |

---

## 5. Senior-Only Topics

Things that come up at senior+ levels but rarely at mid-level.

### Concurrency primitives (drill these for senior+)

- `ConcurrentHashMap` lock striping vs `Hashtable` global lock
- `volatile` vs `synchronized` vs `AtomicReference`
- Producer-consumer with `BlockingQueue`
- `ReentrantReadWriteLock` for read-heavy data
- Dead-lock prevention: lock ordering, `tryLock` with timeout

### Range query structures

- **Segment Tree** — range query + range update (lazy propagation)
- **Fenwick Tree (BIT)** — prefix sum + point update, simpler than Segment Tree
- **Sparse Table** — immutable range min/max in O(1) query, O(n log n) preprocess

### Graph algorithms beyond DFS/BFS

- **Dijkstra** — non-negative weights, heap-based, O((V+E) log V)
- **Bellman-Ford** — handles negative weights, detects negative cycles, O(VE)
- **Floyd-Warshall** — all-pairs shortest path, O(V³), with adjacency matrix
- **Kruskal's MST** — sort edges + Union-Find
- **Prim's MST** — heap-based, similar to Dijkstra

### System-design-adjacent

- **B+ Trees** — why databases use them (high fan-out, leaf-linked, range-scan friendly)
- **LSM Trees** — write-optimized; Cassandra, RocksDB, LevelDB
- **Skip Lists** — probabilistic balanced; Redis sorted sets, ConcurrentSkipListMap
- **Bloom Filters** — probabilistic membership; saves disk lookups
- **Consistent Hashing** — distributed cache placement (Memcached, Cassandra)

### Common gotchas under pressure

- HashMap iteration order is **not** insertion order — use LinkedHashMap.
- `PriorityQueue.contains` is **O(n)** — never use in hot loops.
- `java.util.Stack` extends Vector and is synchronized — use ArrayDeque.
- `Integer` autoboxing trap: `ArrayList<Integer>.remove(int)` removes by index, not value.
- For BFS, mark visited when **enqueueing**, not dequeuing.
- For top-K, use min-heap of size K — not max-heap of size N.
- Java recursion depth limit ≈ 5000-8000 — convert deep DFS to iterative.

---

*Built from a synthesis of multiple senior-engineer cheat-sheets. Update freely — this lives in YAML, this Markdown is generated.*
