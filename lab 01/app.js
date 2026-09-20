/* ==========================================================================
   Task Runner — closures, promises, async/await, and the event loop
   ========================================================================== */


/* --------------------------------------------------------------------------
   PART 0 — a tiny helper to write messages into the page AND the console
   -------------------------------------------------------------------------- */

const logBox = document.getElementById("log");

function log(message) {
  console.log(message);                    // real console
  logBox.textContent += message + "\n";    // and the box on the page
  logBox.scrollTop = logBox.scrollHeight;  // keep scrolled to the bottom
}


/* --------------------------------------------------------------------------
   PART 1 — createTask: a CLOSURE with a PRIVATE counter

   `count` is declared inside createTask. Nothing outside can touch it.
   The three functions we return (run, getCount, reset) were created inside
   createTask, so they remember that `count` variable. That memory is the
   closure.

   Because we call createTask() three separate times, each task gets its own
   separate `count` variable. They do not share.
   -------------------------------------------------------------------------- */

function createTask(name) {
  let count = 0;   // <-- PRIVATE. Only the functions below can see it.

  function run() {
    count = count + 1;   // the closure lets us change the private variable

    // Return a Promise so the caller can use .then() or await.
    return new Promise(function (resolve, reject) {

      // Random loading time between 500 and 2000 ms
      const delay = Math.floor(Math.random() * 1500) + 500;

      // 30% chance of failing
      const willFail = Math.random() < 0.3;

      setTimeout(function () {
        if (willFail) {
          reject(new Error(name + " failed"));
        } else {
          resolve({ name: name, delay: delay });
        }
      }, delay);
    });
  }

  function getCount() {
    return count;   // read-only access to the private variable
  }

  function reset() {
    count = 0;
  }

  // We return an object with the three functions. `count` itself is NOT
  // in this object, so `task.count` is undefined from the outside.
  return {
    name: name,
    run: run,
    getCount: getCount,
    reset: reset
  };
}


/* --------------------------------------------------------------------------
   PART 2 — create our three tasks
   -------------------------------------------------------------------------- */

const taskUsers    = createTask("Load Users");
const taskPosts    = createTask("Load Posts");
const taskComments = createTask("Load Comments");

const allTasks = [taskUsers, taskPosts, taskComments];

// Connect each task object to its card in the HTML.
const cards = {
  "Load Users":    document.getElementById("task-users"),
  "Load Posts":    document.getElementById("task-posts"),
  "Load Comments": document.getElementById("task-comments")
};


/* --------------------------------------------------------------------------
   PART 3 — updating the UI
   -------------------------------------------------------------------------- */

function setStatus(task, statusText, timeText) {
  const card = cards[task.name];

  const statusEl = card.querySelector(".status");
  statusEl.textContent = statusText;
  statusEl.className = "status " + statusText.toLowerCase();

  card.querySelector(".count").textContent = task.getCount();

  if (timeText !== undefined) {
    card.querySelector(".time").textContent = timeText;
  }
}


/* --------------------------------------------------------------------------
   PART 4 — running one task and showing the result

   This is an async function. `await` pauses INSIDE this function only.
   The rest of the page keeps working while we wait.
   -------------------------------------------------------------------------- */

async function runTask(task) {
  setStatus(task, "running");
  const start = Date.now();

  try {
    const result = await task.run();          // wait for the promise
    const elapsed = Date.now() - start;
    setStatus(task, "done", elapsed + " ms");
    log(task.name + " — Completed in " + elapsed + " ms");
    return result;

  } catch (error) {
    // A rejected promise throws here, so try/catch handles it.
    const elapsed = Date.now() - start;
    setStatus(task, "failed", elapsed + " ms");
    log(task.name + " — Failed after " + elapsed + " ms");
    throw error;   // re-throw so callers can see the failure too
  }
}


/* --------------------------------------------------------------------------
   PART 5 — the Run / Reset buttons on each card
   -------------------------------------------------------------------------- */

allTasks.forEach(function (task) {
  const card = cards[task.name];

  card.querySelector(".run-btn").addEventListener("click", function () {
    // .catch does nothing here except stop an "unhandled rejection" warning.
    runTask(task).catch(function () {});
  });

  card.querySelector(".reset-btn").addEventListener("click", function () {
    task.reset();
    setStatus(task, "idle", "—");
    log(task.name + " — counter reset to 0");
  });
});


/* --------------------------------------------------------------------------
   PART 6 — Run All Tasks (CONCURRENT)

   Promise.allSettled starts every task at the same time and waits for all of
   them to settle (finish OR fail). Unlike Promise.all, it does not stop early
   when one task fails — which is exactly what we want here.
   -------------------------------------------------------------------------- */

const doneMessage = document.getElementById("all-done-message");

async function runAllConcurrent() {
  doneMessage.textContent = "";
  log("--- Running all tasks CONCURRENTLY ---");

  const start = Date.now();

  // Build an array of promises. Calling runTask() STARTS the task right away.
  const promises = allTasks.map(function (task) {
    return runTask(task);
  });

  const results = await Promise.allSettled(promises);

  const elapsed = Date.now() - start;

  const succeeded = results.filter(r => r.status === "fulfilled").length;
  const failed    = results.filter(r => r.status === "rejected").length;

  doneMessage.textContent = "All tasks finished";
  log("All tasks finished in " + elapsed + " ms "
      + "(" + succeeded + " completed, " + failed + " failed)");

  return elapsed;
}


/* --------------------------------------------------------------------------
   PART 7 — Run Sequential

   Here we await each task one after another. Task 2 does not even start
   until task 1 is finished. Total time = sum of all the times.
   -------------------------------------------------------------------------- */

async function runAllSequential() {
  doneMessage.textContent = "";
  log("--- Running all tasks SEQUENTIALLY ---");

  const start = Date.now();

  for (const task of allTasks) {
    try {
      await runTask(task);     // <-- waits here before moving on
    } catch (error) {
      // keep going even if one fails
    }
  }

  const elapsed = Date.now() - start;
  doneMessage.textContent = "All tasks finished";
  log("All tasks finished in " + elapsed + " ms");

  return elapsed;
}


/* --------------------------------------------------------------------------
   PART 8 — Compare the two
   -------------------------------------------------------------------------- */

async function compare() {
  log("=== COMPARISON ===");

  const sequentialTime = await runAllSequential();
  const concurrentTime = await runAllConcurrent();

  log("");
  log("Sequential: " + sequentialTime + " ms  (times added together)");
  log("Concurrent: " + concurrentTime + " ms  (about the slowest single task)");
  log("Concurrent was " + (sequentialTime - concurrentTime) + " ms faster.");
  log("Why: sequential waits for each task before starting the next one.");
  log("Concurrent starts all three timers at once, so they overlap.");
  log("=== END COMPARISON ===");
}


/* --------------------------------------------------------------------------
   PART 9 — EVENT LOOP DEMO

   PREDICTED OUTPUT (written before running — see README):

     1. script start
     2. async function start
     3. script end
     4. promise then A         <- microtask
     5. after await            <- microtask
     6. promise then B         <- microtask
     7. timeout 0ms            <- task
     8. timeout 100ms          <- task

   Rule: all synchronous code runs first, then ALL microtasks
   (promises / await), then tasks (setTimeout), one at a time.
   -------------------------------------------------------------------------- */

async function myAsyncFunction() {
  log("2. async function start");   // this part is SYNCHRONOUS

  await null;                       // everything after await becomes a microtask

  log("5. after await");
}

function eventLoopDemo() {
  log("=== EVENT LOOP DEMO ===");

  log("1. script start");                                  // sync

  setTimeout(function () {                                 // TASK queue
    log("7. timeout 0ms");
  }, 0);

  Promise.resolve().then(function () {                     // MICROTASK queue
    log("4. promise then A");
  });

  myAsyncFunction();                                       // sync + microtask

  setTimeout(function () {                                 // TASK queue
    log("8. timeout 100ms");
    log("=== END EVENT LOOP DEMO ===");
  }, 100);

  Promise.resolve().then(function () {                     // MICROTASK queue
    log("6. promise then B");
  });

  log("3. script end");                                    // sync
}


/* --------------------------------------------------------------------------
   PART 10 — connect the experiment buttons
   -------------------------------------------------------------------------- */

document.getElementById("run-all-btn")
  .addEventListener("click", runAllConcurrent);

document.getElementById("run-sequential-btn")
  .addEventListener("click", runAllSequential);

document.getElementById("compare-btn")
  .addEventListener("click", compare);

document.getElementById("event-loop-btn")
  .addEventListener("click", eventLoopDemo);

document.getElementById("clear-log-btn")
  .addEventListener("click", function () {
    logBox.textContent = "";
    doneMessage.textContent = "";
  });


/* --------------------------------------------------------------------------
   Proof that the counter really is private:
   -------------------------------------------------------------------------- */

log("Ready. Try the buttons above.");
log("taskUsers.count from outside is: " + taskUsers.count);  // undefined
log("taskUsers.getCount() is: " + taskUsers.getCount());     // 0
log("");
