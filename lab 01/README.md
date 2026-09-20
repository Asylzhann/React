# Task Runner — JavaScript Runtime and Async

A small project practising closures, the call stack, promises, async/await,
the event loop, tasks and microtasks. Built with HTML, CSS and vanilla
JavaScript only — no frameworks, no build step.

## How to run

Open `index.html` in a browser. That's it.

Open the browser console (F12) to see the same messages that appear in the
log box on the page.

## Files

- `index.html` — the page structure
- `style.css` — plain styling
- `app.js` — all the JavaScript, split into numbered parts with comments
- `README.md` — this file

---

## 1. How the closure keeps the task counter private

Inside `createTask(name)` there is a variable:

```js
let count = 0;
```

`count` is a local variable. Normally a local variable disappears when the
function finishes. But `createTask` returns three functions — `run`,
`getCount` and `reset` — that were **created inside** `createTask`. Those
functions keep a live reference to `count`, so it stays alive after
`createTask` returns. That is the closure.

The returned object contains only the functions, never `count` itself:

```js
return { name, run, getCount, reset };
```

So from outside:

```js
taskUsers.count        // undefined — cannot read it
taskUsers.count = 99   // just adds an unrelated property, real counter unchanged
taskUsers.getCount()   // 0 — the only legitimate way in
```

Each call to `createTask()` creates a **new** `count`. `taskUsers`,
`taskPosts` and `taskComments` were made by three separate calls, so they
have three separate counters and never interfere with each other.

---

## 2. How the call stack works — one example from this app

When you click "Run" on the Load Users card:

```
1. click handler is pushed onto the stack
2. it calls runTask(task)          -> runTask pushed on top
3. runTask calls setStatus(...)    -> setStatus pushed on top
4. setStatus finishes              -> popped off
5. runTask calls task.run()        -> run pushed on top
6. run creates a Promise and calls setTimeout
   - setTimeout hands the timer to the browser and returns immediately
7. run returns the Promise         -> popped off
8. runTask hits `await`, so it pauses and returns control
9. the click handler finishes      -> popped off
   THE STACK IS NOW EMPTY
```

The stack is last-in-first-out: whatever was pushed most recently finishes
first. Nothing else can run while a function is on the stack — JavaScript
has only one stack (it is single-threaded).

Later, when the timer fires, the callback inside `setTimeout` is pushed onto
the now-empty stack, calls `resolve(...)`, and the paused `runTask` is
resumed as a microtask.

---

## 3. How JavaScript can continue while setTimeout is waiting

`setTimeout` does not block. It does three things and returns instantly:

1. hands the callback and the delay to the **browser** (not the JS engine),
2. the browser's timer runs outside the JavaScript thread,
3. `setTimeout` returns, and the call stack continues with the next line.

When the timer expires, the browser puts the callback into the **task
queue**. The event loop moves it onto the call stack only when the stack is
empty.

This is why clicking "Run All Tasks" starts three 500–2000 ms timers at once
and the page stays responsive the whole time: the waiting happens in the
browser, not in JavaScript.

---

## 4. Event loop demo — predicted vs actual output

The demo is in `eventLoopDemo()` in `app.js`. It contains two timers, two
promise callbacks, and one async function.

### My prediction (written before running)

```
1. script start
2. async function start
3. script end
4. promise then A
5. after await
6. promise then B
7. timeout 0ms
8. timeout 100ms
```

### Actual output

Identical to the prediction.

### Why, step by step

**Phase 1 — synchronous code on the call stack**

| Line | What happens |
|---|---|
| `log("1. script start")` | runs immediately → **1** |
| `setTimeout(..., 0)` | handed to the browser, callback will go to the task queue |
| `Promise.resolve().then(A)` | already resolved, so callback A goes straight to the **microtask queue** |
| `myAsyncFunction()` | called normally, so `log("2. ...")` runs immediately → **2** |
| `await null` | pauses the function; the rest of it becomes a **microtask** |
| `setTimeout(..., 100)` | handed to the browser |
| `Promise.resolve().then(B)` | callback B goes to the **microtask queue** |
| `log("3. script end")` | runs immediately → **3** |

The call stack is now empty.

**Phase 2 — the event loop drains the microtask queue**

The microtask queue is emptied **completely** before any task runs, in
FIFO order:

```
A ("promise then A")  -> 4
rest of myAsyncFunction ("after await") -> 5
B ("promise then B")  -> 6
```

**Phase 3 — one task from the task queue**

```
timeout 0ms   -> 7
```

After each task the event loop checks the microtask queue again (it is empty
here), then takes the next task:

```
timeout 100ms -> 8
```

The whole cycle is:

```
Call Stack  →  (empty?)  →  drain ALL Microtasks  →  run ONE Task  →  repeat
```

---

## 5. The difference between tasks and microtasks

| | Microtasks | Tasks (macrotasks) |
|---|---|---|
| Created by | `Promise.then/catch/finally`, `await`, `queueMicrotask` | `setTimeout`, `setInterval`, DOM events, network callbacks |
| Queue | microtask queue | task queue |
| Priority | higher | lower |
| How many run per cycle | **all of them**, including new ones added while draining | **one**, then microtasks are checked again |

The practical rule: **a promise callback always runs before a
`setTimeout(..., 0)` callback**, even if the `setTimeout` was written first
in the code. That is exactly what lines 4–7 of the demo show.

A warning that follows from this: if a microtask keeps adding new
microtasks, the queue never empties and timers and rendering are starved.

---

## 6. How I handle multiple promises and errors

**Errors on a single task** — `task.run()` returns a promise that may
reject. Inside the async function `runTask`, a rejected promise throws, so
an ordinary `try / catch` handles it:

```js
try {
  const result = await task.run();
  // success path
} catch (error) {
  // failure path — UI shows "failed"
}
```

**Multiple promises** — "Run All Tasks" uses `Promise.allSettled`:

```js
const results = await Promise.allSettled(promises);
```

I chose `allSettled` over `all` deliberately:

- `Promise.all` rejects as soon as **one** promise rejects, and the results
  of the others are lost. Since my tasks fail randomly ~30% of the time,
  `all` would usually throw away good results.
- `Promise.allSettled` waits for **every** promise to settle and returns an
  array of `{ status: "fulfilled", value }` or `{ status: "rejected",
  reason }`. This lets me show "All tasks finished" only when all three are
  genuinely done, and count successes and failures separately.

In the sequential version I wrap each `await` in its own `try/catch` so one
failure does not stop the remaining tasks.

---

## 7. Sequential vs concurrent execution

Click **Compare Sequential vs Concurrent** to see real numbers.

### Sequential

```js
await task1.run();
await task2.run();
await task3.run();
```

Each `await` pauses until that task finishes, so task 2's timer does not
even *start* until task 1 is done.

**Total time = t1 + t2 + t3** — roughly 1500–6000 ms with 500–2000 ms tasks.

### Concurrent

```js
const promises = allTasks.map(task => runTask(task));  // all three START here
await Promise.allSettled(promises);
```

Calling `.run()` starts the timer immediately. Mapping over the array starts
all three timers within the same millisecond, so they overlap. Then we wait
once for all of them.

**Total time ≈ max(t1, t2, t3)** — roughly 500–2000 ms.

### Example measurement from one run

```
Load Users    — Completed in 1723 ms
Load Posts    — Failed after 892 ms
Load Comments — Completed in 1104 ms

Sequential: 3719 ms   (1723 + 892 + 1104)
Concurrent: 1726 ms   (about the slowest single task)
```

### Why the difference exists

JavaScript is single-threaded, but **waiting is not done by JavaScript**.
The timers run in the browser. During sequential execution only one timer is
ever running; the other two haven't been created yet. During concurrent
execution all three timers run at the same time in the browser, so the
waiting overlaps and the total is only as long as the slowest one.

Concurrency here does not mean parallel *computation* — it means overlapping
*waiting*. This is the same reason you fetch several APIs concurrently
instead of one at a time.

### When to use which

- **Concurrent** — the tasks are independent (three separate API endpoints).
- **Sequential** — a later task needs the result of an earlier one, or you
  must avoid hammering a server with simultaneous requests.
