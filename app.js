/**
 * CODE HANGMAN - Client Web Application Engine
 * High-performance vanilla JavaScript implementation with Web Audio synthesizer,
 * interactive code syntax rendering, dynamic SVG/ASCII gallows, and full game state.
 */

// ============================================================================
// 1. SNIPPET DATABASE (Python, Java, C/C++)
// ============================================================================

const SNIPPET_DATABASE = [
  // --- PYTHON SNIPPETS ---
  {
    id: "py-01",
    language: "Python",
    difficulty: "Beginner",
    targetToken: "enumerate",
    fileTab: "iter_pipeline.py",
    codeTemplate: 
`items = ['alpha', 'beta', 'gamma']
for index, value in {TARGET}(items):
    print(f"{index}: {value}")`,
    hint: "Built-in function yielding index-value pairs during iteration.",
    explanation: "`enumerate(iterable, start=0)` returns an enumerate object yielding tuples containing a count (from start) and the values obtained from iterating over the iterable."
  },
  {
    id: "py-02",
    language: "Python",
    difficulty: "Beginner",
    targetToken: "with",
    fileTab: "file_io.py",
    codeTemplate:
`{TARGET} open('app.log', 'r', encoding='utf-8') as stream:
    logs = stream.readlines()
print(f"Processed {len(logs)} log entries.")`,
    hint: "Keyword used to wrap the execution of a block with a context manager.",
    explanation: "The `with` statement encapsulates `__enter__` and `__exit__` execution contexts, guaranteeing deterministic resource cleanup (like file descriptors and network sockets)."
  },
  {
    id: "py-03",
    language: "Python",
    difficulty: "Intermediate",
    targetToken: "lambda",
    fileTab: "sorting.py",
    codeTemplate:
`points = [(4, 2), (1, 9), (5, 1)]
# Sort coordinate points by their Y-coordinate ascending
points.sort(key={TARGET} pt: pt[1])`,
    hint: "Anonymous inline function keyword in Python.",
    explanation: "The `lambda` keyword creates small anonymous functions syntactically restricted to a single expression, commonly passed as sorting keys or callbacks."
  },
  {
    id: "py-04",
    language: "Python",
    difficulty: "Intermediate",
    targetToken: "yield",
    fileTab: "generators.py",
    codeTemplate:
`def fibonacci_stream():
    a, b = 0, 1
    while True:
        {TARGET} a
        a, b = b, a + b`,
    hint: "Pauses function execution and produces an item to the caller generator.",
    explanation: "The `yield` statement suspends a function’s execution and sends a value back to the caller, retaining sufficient state to resume where it left off."
  },
  {
    id: "py-05",
    language: "Python",
    difficulty: "Advanced",
    targetToken: "wraps",
    fileTab: "decorators.py",
    codeTemplate:
`from functools import {TARGET}

def logged_action(fn):
    @{TARGET}(fn)
    def wrapper(*args, **kwargs):
        print(f"Invoking {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper`,
    hint: "Decorator factory from functools that preserves the decorated function's metadata.",
    explanation: "`functools.wraps` copies attributes such as `__name__`, `__doc__`, and `__module__` from the wrapped function to the wrapper, preventing metadata loss."
  },
  {
    id: "py-06",
    language: "Python",
    difficulty: "Advanced",
    targetToken: "abstractmethod",
    fileTab: "interfaces.py",
    codeTemplate:
`from abc import ABC, {TARGET}

class BaseRepository(ABC):
    @{TARGET}
    def find_by_id(self, entity_id: str):
        pass`,
    hint: "ABC decorator requiring subclasses to implement this method.",
    explanation: "`@abstractmethod` from the `abc` module marks an abstract method on an abstract base class, preventing instantiation of concrete derived classes that don't override it."
  },

  // --- JAVA SNIPPETS ---
  {
    id: "jv-01",
    language: "Java",
    difficulty: "Beginner",
    targetToken: "implements",
    fileTab: "DatabaseAuditor.java",
    codeTemplate:
`public class DatabaseAuditor {TARGET} Runnable, AutoCloseable {
    @Override
    public void run() {
        System.out.println("Auditing transactions...");
    }
}`,
    hint: "Keyword used by a class to adhere to one or more interfaces.",
    explanation: "In Java, `implements` specifies contracts (interfaces) that the class fulfills. Unlike single inheritance with `extends`, a class can implement multiple interfaces."
  },
  {
    id: "jv-02",
    language: "Java",
    difficulty: "Beginner",
    targetToken: "instanceof",
    fileTab: "TypeMatcher.java",
    codeTemplate:
`public void processMessage(Object payload) {
    if (payload {TARGET} String text) {
        System.out.println("Received string: " + text.toUpperCase());
    }
}`,
    hint: "Operator used for runtime type checks and pattern matching in modern Java.",
    explanation: "`instanceof` tests whether an object reference is an instance of a specified class or interface. Java 16+ supports pattern matching variable binding."
  },
  {
    id: "jv-03",
    language: "Java",
    difficulty: "Intermediate",
    targetToken: "collect",
    fileTab: "StreamPipeline.java",
    codeTemplate:
`List<String> names = employees.stream()
    .filter(emp -> emp.getSalary() > 100_000)
    .map(Employee::getName)
    .{TARGET}(Collectors.toList());`,
    hint: "Terminal stream operation that gathers pipeline elements into a collection.",
    explanation: "`.collect(Collector)` is a terminal reduction operation on Java Streams that accumulates elements into a mutable result container such as a List, Set, or Map."
  },
  {
    id: "jv-04",
    language: "Java",
    difficulty: "Intermediate",
    targetToken: "synchronized",
    fileTab: "ThreadCounter.java",
    codeTemplate:
`public class Counter {
    private int total = 0;

    public {TARGET} void increment() {
        this.total++;
    }
}`,
    hint: "Keyword providing mutual exclusion lock across concurrent threads on monitor objects.",
    explanation: "`synchronized` acquires an intrinsic monitor lock on the object, ensuring only one thread executes the critical section concurrently."
  },
  {
    id: "jv-05",
    language: "Java",
    difficulty: "Advanced",
    targetToken: "volatile",
    fileTab: "WorkerThread.java",
    codeTemplate:
`public class WorkerThread implements Runnable {
    // Guarantees cross-thread memory visibility without caching in CPU registers
    private {TARGET} boolean active = true;

    public void terminate() {
        this.active = false;
    }
}`,
    hint: "Field modifier establishing a happens-before memory visibility guarantee.",
    explanation: "The `volatile` modifier ensures that reads and writes to that variable are immediately visible to all threads by bypassing local CPU core caching."
  },
  {
    id: "jv-06",
    language: "Java",
    difficulty: "Advanced",
    targetToken: "transient",
    fileTab: "UserSession.java",
    codeTemplate:
`public class UserSession implements java.io.Serializable {
    private String username;
    // Exclude plaintext secret credential from byte serialization
    private {TARGET} String decryptedAuthToken;
}`,
    hint: "Modifier marking a field that should NOT be serialized by standard Java ObjectOutputStream.",
    explanation: "`transient` tells the JVM serializer that the field should be skipped when persisting the object graph to a byte stream, defaulting to null/0 on deserialization."
  },

  // --- C / C++ SNIPPETS ---
  {
    id: "c-01",
    language: "C",
    difficulty: "Beginner",
    targetToken: "sizeof",
    fileTab: "alloc.c",
    codeTemplate:
`size_t buffer_len = 64;
int *numbers = (int *)malloc(buffer_len * {TARGET}(int));
if (numbers == NULL) {
    perror("Memory allocation failed");
}`,
    hint: "Compile-time operator returning size in bytes of an expression or type.",
    explanation: "`sizeof` yields the storage size in bytes of its operand, fundamental for portable dynamic memory allocation."
  },
  {
    id: "c-02",
    language: "C",
    difficulty: "Beginner",
    targetToken: "typedef",
    fileTab: "geometry.c",
    codeTemplate:
`struct Point2D {
    float x;
    float y;
};
{TARGET} struct Point2D Point;

Point origin = {0.0f, 0.0f};`,
    hint: "Storage class specifier defining an alias for an existing type.",
    explanation: "`typedef` allows developers to establish new identifiers as aliases for existing types, improving readability and reducing boilerplate."
  },
  {
    id: "c-03",
    language: "C",
    difficulty: "Intermediate",
    targetToken: "realloc",
    fileTab: "vector.c",
    codeTemplate:
`size_t new_capacity = old_capacity * 2;
int *resized = (int *){TARGET}(buffer, new_capacity * sizeof(int));
if (resized != NULL) {
    buffer = resized;
}`,
    hint: "Standard library memory allocator that resizes previously allocated heap blocks.",
    explanation: "`realloc(ptr, new_size)` reallocates memory on the heap, copying old data if a new block must be allocated elsewhere, or returns NULL on failure."
  },
  {
    id: "c-04",
    language: "C",
    difficulty: "Intermediate",
    targetToken: "strncpy",
    fileTab: "safe_string.c",
    codeTemplate:
`char dest[32];
const char *source = "Antigravity Secure Daemon";
// Bounds-checked copy up to buffer capacity
{TARGET}(dest, source, sizeof(dest) - 1);
dest[sizeof(dest) - 1] = '\\0';`,
    hint: "Bounds-limited string copy function from <string.h>.",
    explanation: "`strncpy(dest, src, n)` copies at most n characters from src to dest, mitigating buffer overflow risks when paired with explicit null-termination."
  },
  {
    id: "c-05",
    language: "C",
    difficulty: "Advanced",
    targetToken: "volatile",
    fileTab: "mmio_driver.c",
    codeTemplate:
`// Memory-mapped hardware status register: prevent compiler from optimizing reads away
{TARGET} uint32_t *const UART_STATUS_REG = (uint32_t *)0x4000C000;

while ((*UART_STATUS_REG & 0x01) == 0) {
    /* Wait for transmission ready */
}`,
    hint: "Type qualifier warning optimizer that hardware or interrupt handlers may alter the value.",
    explanation: "In C/C++, `volatile` informs the compiler that a value may change asynchronously, disabling optimization caching into registers."
  },
  {
    id: "c-06",
    language: "C",
    difficulty: "Advanced",
    targetToken: "restrict",
    fileTab: "simd_vector.c",
    codeTemplate:
`void vector_add(size_t n, float *{TARGET} a, float *{TARGET} b, float *{TARGET} out) {
    // Guarantees pointers do not alias, enabling SIMD vectorization
    for (size_t i = 0; i < n; ++i) {
        out[i] = a[i] + b[i];
    }
}`,
    hint: "C99 pointer qualifier promising that no other pointer will access the referenced object in that scope.",
    explanation: "`restrict` asserts pointer un-aliasing, assuring the compiler that memory modifications through this pointer won't alter data read through others, allowing aggressive SIMD loop optimization."
  }
];

// ============================================================================
// 2. SYNTHESIZED WEB AUDIO API SOUND ENGINE
// ============================================================================

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7; // 0.0 to 1.0
    this._loadSettings();
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _loadSettings() {
    const saved = localStorage.getItem('code_hangman_audio');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('code_hangman_audio', this.enabled.toString());
    return this.enabled;
  }

  // Mechanical Keystroke Click
  playKeyClick() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.08 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Positive Hit Chime
  playCorrect() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.08); // A5

    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Negative Miss Buzz
  playIncorrect() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Victory Fanfare
  playVictory() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteStart = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.12 * this.volume, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.35);
    });
  }

  // Defeat Glitch Sound
  playDefeat() {
    if (!this.enabled) return;
    this._initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Test Beep for Volume Adjustment
  playTestBeep() {
    this._initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}

// ============================================================================
// 2B. AUTHENTICATION & SQL DATABASE MANAGER
// ============================================================================

class AuthManager {
  constructor(app) {
    this.app = app;
    this.apiBase = window.location.origin.startsWith('http') ? '' : 'http://localhost:8080';
    this.token = localStorage.getItem('code_hangman_session_token') || null;
    this.currentUser = null;
    this.settings = {
      theme: 'theme-cyberpunk',
      sound_enabled: true,
      sound_volume: 0.7,
      crt_effect: true,
      grid_bg: true,
      gallows_view: 'vector',
      default_lang: 'all',
      default_diff: 'all',
      hardcore_mode: false
    };
    this.isBackendConnected = false;
  }

  async init() {
    await this.checkBackendStatus();
    if (this.token) {
      await this.checkSession();
    } else {
      this.loadLocalSettings();
    }
  }

  async checkBackendStatus() {
    try {
      const res = await fetch(`${this.apiBase}/api/db/status`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isBackendConnected = (data.status === 'connected');
        return true;
      }
    } catch (e) {
      this.isBackendConnected = false;
    }
    return false;
  }

  async checkSession() {
    if (!this.token) return false;
    try {
      const res = await fetch(`${this.apiBase}/api/auth/session`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          this.currentUser = data.user;
          if (data.settings) {
            this.settings = Object.assign(this.settings, data.settings);
          }
          if (data.stats && this.app.stats) {
            this.app.stats.data = data.stats;
            this.app.updateStatsHUD();
          }
          this.applySettings();
          return true;
        }
      }
    } catch (e) {}
    this.loadLocalSettings();
    return false;
  }

  async login(identifier, password) {
    await this.checkBackendStatus();
    if (this.isBackendConnected) {
      try {
        const res = await fetch(`${this.apiBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password })
        });
        const data = await res.json();
        if (data.success) {
          this.token = data.token;
          localStorage.setItem('code_hangman_session_token', this.token);
          this.currentUser = data.user;
          if (data.settings) this.settings = Object.assign(this.settings, data.settings);
          if (data.stats && this.app.stats) {
            this.app.stats.data = data.stats;
            this.app.updateStatsHUD();
          }
          this.applySettings();
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Authentication rejected.' };
        }
      } catch (e) {
        return { success: false, error: 'Network error connecting to SQL database server.' };
      }
    } else {
      // Local fallback mode
      const rawAccounts = localStorage.getItem('code_hangman_local_accounts');
      const accounts = rawAccounts ? JSON.parse(rawAccounts) : [];
      const user = accounts.find(a => (a.username.toLowerCase() === identifier.toLowerCase() || a.email.toLowerCase() === identifier.toLowerCase()) && a.password === password);
      if (user) {
        this.currentUser = { id: user.id, username: user.username, email: user.email, avatar: user.avatar, created_at: user.created_at };
        this.token = 'local_' + user.id;
        localStorage.setItem('code_hangman_session_token', this.token);
        this.loadLocalSettings();
        return { success: true };
      }
      return { success: false, error: 'Invalid username/email or password.' };
    }
  }

  async signup(username, email, password, avatar) {
    await this.checkBackendStatus();
    if (this.isBackendConnected) {
      try {
        const res = await fetch(`${this.apiBase}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, avatar })
        });
        const data = await res.json();
        if (data.success) {
          this.token = data.token;
          localStorage.setItem('code_hangman_session_token', this.token);
          this.currentUser = data.user;
          if (data.settings) this.settings = Object.assign(this.settings, data.settings);
          this.applySettings();
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Registration failed.' };
        }
      } catch (e) {
        return { success: false, error: 'Network error connecting to SQL database server.' };
      }
    } else {
      // Local storage fallback
      const rawAccounts = localStorage.getItem('code_hangman_local_accounts');
      const accounts = rawAccounts ? JSON.parse(rawAccounts) : [];
      if (accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, error: 'Username is already taken.' };
      }
      if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'Email is already registered.' };
      }
      const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        avatar,
        created_at: new Date().toISOString()
      };
      accounts.push(newUser);
      localStorage.setItem('code_hangman_local_accounts', JSON.stringify(accounts));
      this.currentUser = { id: newUser.id, username: newUser.username, email: newUser.email, avatar: newUser.avatar, created_at: newUser.created_at };
      this.token = 'local_' + newUser.id;
      localStorage.setItem('code_hangman_session_token', this.token);
      this.loadLocalSettings();
      return { success: true };
    }
  }

  async logout() {
    if (this.token && this.isBackendConnected) {
      try {
        await fetch(`${this.apiBase}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ token: this.token })
        });
      } catch (e) {}
    }
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('code_hangman_session_token');
    this.loadLocalSettings();
    this.applySettings();
  }

  loadLocalSettings() {
    const raw = localStorage.getItem('code_hangman_user_settings');
    if (raw) {
      try {
        this.settings = Object.assign(this.settings, JSON.parse(raw));
      } catch (e) {}
    }
    this.applySettings();
  }

  async saveSettings(newSettings) {
    this.settings = Object.assign(this.settings, newSettings);
    localStorage.setItem('code_hangman_user_settings', JSON.stringify(this.settings));
    this.applySettings();

    if (this.token && this.currentUser && this.isBackendConnected) {
      try {
        await fetch(`${this.apiBase}/api/user/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ settings: this.settings })
        });
      } catch (e) {}
    }
  }

  async syncStats(stats) {
    if (this.token && this.currentUser && this.isBackendConnected) {
      try {
        await fetch(`${this.apiBase}/api/user/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ stats })
        });
      } catch (e) {}
    }
  }

  async resetStats() {
    if (this.token && this.currentUser && this.isBackendConnected) {
      try {
        await fetch(`${this.apiBase}/api/user/stats/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` }
        });
      } catch (e) {}
    }
  }

  applySettings() {
    const s = this.settings;
    // 1. Theme
    if (s.theme) {
      document.body.classList.remove('theme-cyberpunk', 'theme-matrix', 'theme-monokai');
      document.body.classList.add(s.theme);
      const themeBtnName = document.getElementById('theme-name');
      if (themeBtnName) {
        const map = { 'theme-cyberpunk': 'Cyberpunk', 'theme-matrix': 'Matrix', 'theme-monokai': 'Monokai' };
        themeBtnName.textContent = map[s.theme] || 'Cyberpunk';
      }
    }

    // 2. CRT Scanlines
    const crt = document.querySelector('.crt-overlay');
    if (crt) {
      crt.style.display = s.crt_effect ? 'block' : 'none';
    }

    // 3. Grid Background
    const grid = document.querySelector('.grid-background');
    if (grid) {
      grid.style.display = s.grid_bg ? 'block' : 'none';
    }

    // 4. Gallows Mode (SVG vs ASCII)
    const toggleSvgBtn = document.getElementById('toggle-svg-view');
    const toggleAsciiBtn = document.getElementById('toggle-ascii-view');
    const svgContainer = document.getElementById('gallows-svg-container');
    const asciiContainer = document.getElementById('gallows-ascii-container');

    if (s.gallows_view === 'ascii') {
      if (toggleAsciiBtn) toggleAsciiBtn.classList.add('active');
      if (toggleSvgBtn) toggleSvgBtn.classList.remove('active');
      if (svgContainer) svgContainer.classList.add('hidden');
      if (asciiContainer) asciiContainer.classList.remove('hidden');
    } else {
      if (toggleSvgBtn) toggleSvgBtn.classList.add('active');
      if (toggleAsciiBtn) toggleAsciiBtn.classList.remove('active');
      if (svgContainer) svgContainer.classList.remove('hidden');
      if (asciiContainer) asciiContainer.classList.add('hidden');
    }

    // 5. Audio volume and sound state
    if (this.app && this.app.sound) {
      this.app.sound.enabled = !!s.sound_enabled;
      this.app.sound.setVolume(s.sound_volume !== undefined ? s.sound_volume : 0.7);
      const soundIcon = document.getElementById('sound-icon');
      if (soundIcon) {
        soundIcon.textContent = this.app.sound.enabled ? '🔊' : '🔇';
      }
    }

    // 6. Hardcore Mode
    if (this.app) {
      this.app.maxLives = s.hardcore_mode ? 3 : 6;
      if (this.app.lives > this.app.maxLives) {
        this.app.lives = this.app.maxLives;
      }
      this.app.updateHUD();
    }
  }
}

// ============================================================================
// 3. STATS & STORAGE MANAGER
// ============================================================================

class StatsManager {
  constructor() {
    this.storageKey = 'code_hangman_stats';
    this.data = this.load();
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallback */ }
    }
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalGuesses: 0,
      correctGuesses: 0
    };
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  recordWin() {
    this.data.gamesPlayed++;
    this.data.gamesWon++;
    this.data.currentStreak++;
    if (this.data.currentStreak > this.data.bestStreak) {
      this.data.bestStreak = this.data.currentStreak;
    }
    this.save();
  }

  recordLoss() {
    this.data.gamesPlayed++;
    this.data.currentStreak = 0;
    this.save();
  }

  recordGuess(isCorrect) {
    this.data.totalGuesses = (this.data.totalGuesses || 0) + 1;
    if (isCorrect) {
      this.data.correctGuesses = (this.data.correctGuesses || 0) + 1;
    }
    this.save();
  }

  reset() {
    this.data = {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalGuesses: 0,
      correctGuesses: 0
    };
    this.save();
  }

  getWinRate() {
    if (this.data.gamesPlayed === 0) return 0;
    return Math.round((this.data.gamesWon / this.data.gamesPlayed) * 100);
  }

  getAccuracy() {
    if (!this.data.totalGuesses || this.data.totalGuesses === 0) return 100;
    const correct = this.data.correctGuesses || 0;
    const acc = Math.round((correct / this.data.totalGuesses) * 100);
    return Math.min(100, Math.max(0, acc));
  }
}

// ============================================================================
// 4. ASCII GALLOWS TABLE (Matches Terminal Edition)
// ============================================================================

const ASCII_STAGES = [
  // 6 lives remaining (Clean Scaffold)
`  ┌─────────────┐
  │             │
  │             
  │            
  │            
  │            
 ─┴────────────────────`,
  // 5 lives (Head)
`  ┌─────────────┐
  │             │
  │           (o_o)
  │            
  │            
  │            
 ─┴────────────────────`,
  // 4 lives (Torso)
`  ┌─────────────┐
  │             │
  │           (o_o)
  │             │
  │             │
  │            
 ─┴────────────────────`,
  // 3 lives (Left Arm)
`  ┌─────────────┐
  │             │
  │           (o_o)
  │            /│
  │           / │
  │            
 ─┴────────────────────`,
  // 2 lives (Both Arms)
`  ┌─────────────┐
  │             │
  │           (o_o)
  │            /│\\
  │           / │ \\
  │            
 ─┴────────────────────`,
  // 1 life (Left Leg)
`  ┌─────────────┐
  │             │
  │           (x_x)
  │            /│\\
  │           / │ \\
  │            / 
 ─┴───────────/────────`,
  // 0 lives (Hanged)
`  ┌─────────────┐
  │             │
  │           (x_X)  FATAL SEGFAULT!
  │            /│\\
  │           / │ \\
  │            / \\
 ─┴───────────/───\\────`
];

// ============================================================================
// 5. CORE GAME CONTROLLER
// ============================================================================

class CodeHangmanGame {
  constructor() {
    this.sound = new SoundFX();
    this.auth = new AuthManager(this);
    this.stats = new StatsManager();
    this.snippets = [...SNIPPET_DATABASE];
    this.loadCustomSnippets();

    this.selectedLanguage = "all";
    this.selectedDifficulty = "all";

    this.currentSnippet = null;
    this.lives = 6;
    this.maxLives = 6;
    this.guessedLetters = new Set();
    this.roundGuesses = 0;
    this.isGameOver = false;

    this.themes = ['theme-cyberpunk', 'theme-matrix', 'theme-monokai'];
    this.currentThemeIndex = 0;

    this.deferredPrompt = null;
    this._cacheDOMElements();
    this._bindEvents();
    this.initPWA();
    this.auth.init().then(() => {
      this.updateAuthUI();
    });
    this.renderKeyboard();
    this.updateStatsHUD();
    this.startNewGame();
  }

  loadCustomSnippets() {
    const raw = localStorage.getItem('code_hangman_custom_snippets');
    if (raw) {
      try {
        const custom = JSON.parse(raw);
        if (Array.isArray(custom)) {
          this.snippets.push(...custom);
        }
      } catch (e) { /* ignore */ }
    }
  }

  _cacheDOMElements() {
    this.dom = {
      // PWA & App Mode
      btnInstallApp: document.getElementById('btn-install-app'),
      installIcon: document.getElementById('install-icon'),
      installText: document.getElementById('install-text'),
      modalInstall: document.getElementById('modal-install'),
      btnCloseInstallModal: document.getElementById('btn-close-install-modal'),
      btnTriggerInstallPrompt: document.getElementById('btn-trigger-install-prompt'),

      // Header stats
      streakVal: document.getElementById('stat-streak-val'),
      winsVal: document.getElementById('stat-wins-val'),
      accVal: document.getElementById('stat-acc-val'),
      soundBtn: document.getElementById('btn-sound'),
      soundIcon: document.getElementById('sound-icon'),
      themeBtn: document.getElementById('btn-theme'),
      themeName: document.getElementById('theme-name'),
      customBtn: document.getElementById('btn-custom-snippet'),
      statsBtn: document.getElementById('btn-stats'),

      // Auth Header & Modal Elements
      btnAuth: document.getElementById('btn-auth'),
      authNavIcon: document.getElementById('auth-nav-icon'),
      authNavText: document.getElementById('auth-nav-text'),
      modalAuth: document.getElementById('modal-auth'),
      authModalTitle: document.getElementById('auth-modal-title'),
      btnCloseAuthModal: document.getElementById('btn-close-auth-modal'),
      tabBtnLogin: document.getElementById('tab-btn-login'),
      tabBtnSignup: document.getElementById('tab-btn-signup'),
      authAlert: document.getElementById('auth-alert'),
      formLogin: document.getElementById('form-login'),
      loginIdent: document.getElementById('login-ident'),
      loginPassword: document.getElementById('login-password'),
      btnSubmitLogin: document.getElementById('btn-submit-login'),
      linkSwitchToSignup: document.getElementById('link-switch-to-signup'),
      formSignup: document.getElementById('form-signup'),
      avatarPicker: document.getElementById('avatar-picker'),
      signupAvatar: document.getElementById('signup-avatar'),
      signupUsername: document.getElementById('signup-username'),
      signupEmail: document.getElementById('signup-email'),
      signupPassword: document.getElementById('signup-password'),
      signupConfirm: document.getElementById('signup-confirm'),
      btnSubmitSignup: document.getElementById('btn-submit-signup'),
      linkSwitchToLogin: document.getElementById('link-switch-to-login'),

      // Settings Header & Modal Elements
      btnSettings: document.getElementById('btn-settings'),
      modalSettings: document.getElementById('modal-settings'),
      btnCloseSettingsModal: document.getElementById('btn-close-settings-modal'),
      settingsAccountAvatar: document.getElementById('settings-account-avatar'),
      settingsAccountName: document.getElementById('settings-account-name'),
      settingsAccountEmail: document.getElementById('settings-account-email'),
      settingsDbBadge: document.getElementById('settings-db-badge'),
      settingsDbStatusText: document.getElementById('settings-db-status-text'),
      btnSettingsAuthAction: document.getElementById('btn-settings-auth-action'),
      settingThemeSelect: document.getElementById('setting-theme-select'),
      settingCrtToggle: document.getElementById('setting-crt-toggle'),
      settingGridToggle: document.getElementById('setting-grid-toggle'),
      settingGallowsSelect: document.getElementById('setting-gallows-select'),
      settingSoundToggle: document.getElementById('setting-sound-toggle'),
      settingVolumeSlider: document.getElementById('setting-volume-slider'),
      settingVolumeText: document.getElementById('setting-volume-text'),
      btnTestSound: document.getElementById('btn-test-sound'),
      settingDefaultLang: document.getElementById('setting-default-lang'),
      settingDefaultDiff: document.getElementById('setting-default-diff'),
      settingHardcoreToggle: document.getElementById('setting-hardcore-toggle'),
      btnExportAccountData: document.getElementById('btn-export-account-data'),
      btnSettingsResetStats: document.getElementById('btn-settings-reset-stats'),
      btnCloseSettingsFooter: document.getElementById('btn-close-settings-footer'),
      btnSaveSettingsFooter: document.getElementById('btn-save-settings-footer'),

      // Filters & Action
      langSelector: document.getElementById('lang-selector'),
      diffSelector: document.getElementById('diff-selector'),
      newPuzzleBtn: document.getElementById('btn-new-puzzle'),

      // Gallows & Vitals
      toggleSvgView: document.getElementById('toggle-svg-view'),
      toggleAsciiView: document.getElementById('toggle-ascii-view'),
      svgContainer: document.getElementById('gallows-svg-container'),
      asciiContainer: document.getElementById('gallows-ascii-container'),
      asciiArtPre: document.getElementById('gallows-ascii-art'),
      healthBarFill: document.getElementById('health-bar-fill'),
      livesCounterText: document.getElementById('lives-counter-text'),
      heartIcons: document.querySelectorAll('.heart-icons .heart'),
      consoleLog: document.getElementById('console-log'),

      // IDE editor
      fileTabIcon: document.getElementById('file-tab-icon'),
      fileTabName: document.getElementById('file-tab-name'),
      badgeLang: document.getElementById('badge-snippet-lang'),
      badgeDiff: document.getElementById('badge-snippet-diff'),
      badgeLen: document.getElementById('badge-snippet-len'),
      codeLineNumbers: document.getElementById('code-line-numbers'),
      codeDisplay: document.getElementById('code-display'),

      // Token Cells & Actions
      tokenStatusHint: document.getElementById('token-status-hint'),
      tokenLetterCells: document.getElementById('token-letter-cells'),
      btnShowHint: document.getElementById('btn-show-hint'),
      btnSolveToken: document.getElementById('btn-solve-token'),
      btnForfeit: document.getElementById('btn-forfeit'),
      hintDrawer: document.getElementById('hint-drawer'),
      hintText: document.getElementById('hint-text'),
      btnCloseHint: document.getElementById('btn-close-hint'),

      // Keyboard
      kbRow1: document.getElementById('kb-row-1'),
      kbRow2: document.getElementById('kb-row-2'),
      kbRow3: document.getElementById('kb-row-3'),

      // Modals
      modalSolveToken: document.getElementById('modal-solve-token'),
      inputSolveToken: document.getElementById('input-solve-token'),
      btnSubmitSolve: document.getElementById('btn-submit-solve'),
      btnCloseSolveModal: document.getElementById('btn-close-solve-modal'),

      modalResult: document.getElementById('modal-result'),
      modalResultCard: document.getElementById('modal-result-card'),
      resultBanner: document.getElementById('result-banner'),
      resultIcon: document.getElementById('result-icon'),
      resultTitle: document.getElementById('result-title'),
      resultCodeTag: document.getElementById('result-code-tag'),
      resultTokenValue: document.getElementById('result-token-value'),
      resultExplanationText: document.getElementById('result-explanation-text'),
      resultRestoredCode: document.getElementById('result-restored-code'),
      btnResultClose: document.getElementById('btn-result-close'),
      btnResultNext: document.getElementById('btn-result-next'),

      modalCustom: document.getElementById('modal-custom-snippet'),
      btnCloseCustomModal: document.getElementById('btn-close-custom-modal'),
      formCustomSnippet: document.getElementById('form-custom-snippet'),
      btnExportPython: document.getElementById('btn-export-python'),

      modalStats: document.getElementById('modal-stats'),
      btnCloseStatsModal: document.getElementById('btn-close-stats-modal'),
      btnResetStats: document.getElementById('btn-reset-stats'),
      statsTotalPlayed: document.getElementById('stats-total-played'),
      statsTotalWon: document.getElementById('stats-total-won'),
      statsWinRate: document.getElementById('stats-win-rate'),
      statsCurrentStreak: document.getElementById('stats-current-streak'),
      statsBestStreak: document.getElementById('stats-best-streak'),
      statsTotalGuesses: document.getElementById('stats-total-guesses'),

      confettiCanvas: document.getElementById('confetti-canvas')
    };
  }

  _bindEvents() {
    // Sound FX button
    this.dom.soundBtn.addEventListener('click', () => {
      const active = this.sound.toggle();
      this.dom.soundIcon.textContent = active ? '🔊' : '🔇';
      this.logTerminal(active ? 'Audio synthesizer enabled.' : 'Audio synthesizer muted.', 'info');
    });

    // Theme toggle
    this.dom.themeBtn.addEventListener('click', () => {
      document.body.classList.remove(this.themes[this.currentThemeIndex]);
      this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
      document.body.classList.add(this.themes[this.currentThemeIndex]);
      const names = ['Cyberpunk', 'Matrix', 'Monokai'];
      this.dom.themeName.textContent = names[this.currentThemeIndex];
      this.sound.playKeyClick();
    });

    // Language pills
    this.dom.langSelector.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.langSelector.querySelectorAll('.pill-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        this.selectedLanguage = btn.dataset.lang;
        this.sound.playKeyClick();
        this.startNewGame();
      });
    });

    // Difficulty pills
    this.dom.diffSelector.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.diffSelector.querySelectorAll('.pill-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        this.selectedDifficulty = btn.dataset.diff;
        this.sound.playKeyClick();
        this.startNewGame();
      });
    });

    // Next puzzle button
    this.dom.newPuzzleBtn.addEventListener('click', () => {
      this.sound.playKeyClick();
      this.startNewGame();
    });

    // Gallows View Switcher
    this.dom.toggleSvgView.addEventListener('click', () => {
      this.dom.toggleSvgView.classList.add('active');
      this.dom.toggleAsciiView.classList.remove('active');
      this.dom.svgContainer.classList.remove('hidden');
      this.dom.asciiContainer.classList.add('hidden');
    });

    this.dom.toggleAsciiView.addEventListener('click', () => {
      this.dom.toggleAsciiView.classList.add('active');
      this.dom.toggleSvgView.classList.remove('active');
      this.dom.svgContainer.classList.add('hidden');
      this.dom.asciiContainer.classList.remove('hidden');
    });

    // Hint Controls
    this.dom.btnShowHint.addEventListener('click', () => this.toggleHint(true));
    this.dom.btnCloseHint.addEventListener('click', () => this.toggleHint(false));

    // Solve Whole Token Button
    this.dom.btnSolveToken.addEventListener('click', () => {
      if (this.isGameOver) return;
      this.dom.modalSolveToken.showModal();
      this.dom.inputSolveToken.value = "";
      this.dom.inputSolveToken.focus();
    });

    this.dom.btnCloseSolveModal.addEventListener('click', () => {
      this.dom.modalSolveToken.close();
    });

    this.dom.btnSubmitSolve.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSolveWholeTokenSubmit();
    });

    this.dom.inputSolveToken.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSolveWholeTokenSubmit();
      }
    });

    // Forfeit / Give Up
    this.dom.btnForfeit.addEventListener('click', () => {
      if (this.isGameOver) return;
      this.lives = 0;
      this.logTerminal("Session aborted: User forfeited current challenge.", "error");
      this.endGame(false);
    });

    // Result Modal buttons
    this.dom.btnResultClose.addEventListener('click', () => {
      this.dom.modalResult.close();
    });

    this.dom.btnResultNext.addEventListener('click', () => {
      this.dom.modalResult.close();
      this.startNewGame();
    });

    // Custom Snippet Modal
    this.dom.customBtn.addEventListener('click', () => {
      this.dom.modalCustom.showModal();
    });

    this.dom.btnCloseCustomModal.addEventListener('click', () => {
      this.dom.modalCustom.close();
    });

    this.dom.formCustomSnippet.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCustomSnippet();
    });

    this.dom.btnExportPython.addEventListener('click', () => {
      this.copyCustomSnippetAsPython();
    });

    // Statistics Modal
    this.dom.statsBtn.addEventListener('click', () => {
      this.renderStatsModal();
      this.dom.modalStats.showModal();
    });

    this.dom.btnCloseStatsModal.addEventListener('click', () => {
      this.dom.modalStats.close();
    });

    this.dom.btnResetStats.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all game statistics?')) {
        this.stats.reset();
        this.updateStatsHUD();
        this.renderStatsModal();
        this.logTerminal('Historical stats reset by user.', 'warning');
      }
    });

    // PWA Install Modal Events
    if (this.dom.btnInstallApp) {
      this.dom.btnInstallApp.addEventListener('click', () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              this.logTerminal('[PWA] Installation prompt accepted by user.', 'success');
            } else {
              this.logTerminal('[PWA] Installation prompt dismissed by user.', 'warning');
            }
            this.deferredPrompt = null;
          });
        } else {
          this.dom.modalInstall.showModal();
        }
      });
    }

    if (this.dom.btnCloseInstallModal) {
      this.dom.btnCloseInstallModal.addEventListener('click', () => {
        this.dom.modalInstall.close();
      });
    }

    if (this.dom.btnTriggerInstallPrompt) {
      this.dom.btnTriggerInstallPrompt.addEventListener('click', () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then(() => {
            this.deferredPrompt = null;
            this.dom.modalInstall.close();
          });
        } else {
          this.logTerminal('[PWA] Browser install dialog triggered via guide.', 'info');
          alert("To install Code Hangman:\n• In Chrome/Edge: Click the install icon in the address bar (top right)\n• On iPhone: Tap Share ➔ Add to Home Screen\n• On Android: Tap ⋮ ➔ Install App");
        }
      });
    }

    // Auth Modal Triggers & Events
    if (this.dom.btnAuth) {
      this.dom.btnAuth.addEventListener('click', () => {
        if (this.auth.currentUser) {
          this.openSettingsModal();
        } else {
          this.openAuthModal('login');
        }
      });
    }

    if (this.dom.btnCloseAuthModal) {
      this.dom.btnCloseAuthModal.addEventListener('click', () => {
        this.dom.modalAuth.close();
      });
    }

    if (this.dom.tabBtnLogin) {
      this.dom.tabBtnLogin.addEventListener('click', () => this.switchAuthTab('login'));
    }

    if (this.dom.tabBtnSignup) {
      this.dom.tabBtnSignup.addEventListener('click', () => this.switchAuthTab('signup'));
    }

    if (this.dom.linkSwitchToSignup) {
      this.dom.linkSwitchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchAuthTab('signup');
      });
    }

    if (this.dom.linkSwitchToLogin) {
      this.dom.linkSwitchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchAuthTab('login');
      });
    }

    // Avatar Picker Options
    if (this.dom.avatarPicker) {
      this.dom.avatarPicker.querySelectorAll('.avatar-option').forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.avatarPicker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.dom.signupAvatar.value = btn.dataset.avatar;
          this.sound.playKeyClick();
        });
      });
    }

    // Submit Forms
    if (this.dom.formLogin) {
      this.dom.formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLoginSubmit();
      });
    }

    if (this.dom.formSignup) {
      this.dom.formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignupSubmit();
      });
    }

    // Settings Modal Triggers & Events
    if (this.dom.btnSettings) {
      this.dom.btnSettings.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    if (this.dom.btnCloseSettingsModal) {
      this.dom.btnCloseSettingsModal.addEventListener('click', () => {
        this.dom.modalSettings.close();
      });
    }

    if (this.dom.btnCloseSettingsFooter) {
      this.dom.btnCloseSettingsFooter.addEventListener('click', () => {
        this.dom.modalSettings.close();
      });
    }

    if (this.dom.btnSaveSettingsFooter) {
      this.dom.btnSaveSettingsFooter.addEventListener('click', () => {
        this.saveSettingsFromModal();
        this.dom.modalSettings.close();
      });
    }

    if (this.dom.btnSettingsAuthAction) {
      this.dom.btnSettingsAuthAction.addEventListener('click', () => {
        if (this.auth.currentUser) {
          this.auth.logout();
          this.updateAuthUI();
          this.populateSettingsForm();
          this.logTerminal("User logged out of SQL database session.", "info");
        } else {
          this.dom.modalSettings.close();
          this.openAuthModal('login');
        }
      });
    }

    if (this.dom.settingVolumeSlider) {
      this.dom.settingVolumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.dom.settingVolumeText.textContent = `${val}%`;
        this.sound.setVolume(val / 100);
      });
    }

    if (this.dom.btnTestSound) {
      this.dom.btnTestSound.addEventListener('click', () => {
        this.sound.playTestBeep();
      });
    }

    if (this.dom.btnExportAccountData) {
      this.dom.btnExportAccountData.addEventListener('click', () => {
        this.exportAccountData();
      });
    }

    if (this.dom.btnSettingsResetStats) {
      this.dom.btnSettingsResetStats.addEventListener('click', () => {
        if (confirm('Reset your total game statistics?')) {
          this.stats.reset();
          this.auth.resetStats();
          this.updateStatsHUD();
          this.populateSettingsForm();
          this.logTerminal('Historical player statistics reset by user.', 'warning');
        }
      });
    }

    // Physical Keyboard Listener
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Ignore modifiers
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toLowerCase();

      // If Result Modal is open, Enter, Space, or N advances immediately to next challenge
      if (this.dom.modalResult && this.dom.modalResult.open) {
        if (e.key === 'Enter' || e.key === ' ' || key === 'n') {
          e.preventDefault();
          this.dom.btnResultNext.click();
          return;
        }
      }

      // Check letter A-Z
      if (/^[a-z]$/.test(key)) {
        this.handleGuessLetter(key);
      } else if (e.key === 'Enter') {
        this.dom.btnSolveToken.click();
      } else if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        this.toggleHint();
      } else if (e.key === 'n' || e.key === 'N') {
        this.startNewGame();
      } else if (e.key === 'Escape') {
        if (this.dom.modalSolveToken && this.dom.modalSolveToken.open) this.dom.modalSolveToken.close();
        if (this.dom.modalResult && this.dom.modalResult.open) this.dom.modalResult.close();
        if (this.dom.modalCustom && this.dom.modalCustom.open) this.dom.modalCustom.close();
        if (this.dom.modalStats && this.dom.modalStats.open) this.dom.modalStats.close();
        if (this.dom.modalInstall && this.dom.modalInstall.open) this.dom.modalInstall.close();
        if (this.dom.modalAuth && this.dom.modalAuth.open) this.dom.modalAuth.close();
        if (this.dom.modalSettings && this.dom.modalSettings.open) this.dom.modalSettings.close();
      }
    });
  }

  // ==========================================================================
  // AUTH & SETTINGS CONTROLLERS
  // ==========================================================================

  updateAuthUI() {
    const user = this.auth.currentUser;
    if (user) {
      if (this.dom.btnAuth) {
        this.dom.btnAuth.classList.add('logged-in');
        this.dom.authNavIcon.textContent = user.avatar || '👨‍💻';
        this.dom.authNavText.textContent = user.username;
      }
      this.logTerminal(`Authenticated session active: [${user.username}] via SQLite.`, 'success');
    } else {
      if (this.dom.btnAuth) {
        this.dom.btnAuth.classList.remove('logged-in');
        this.dom.authNavIcon.textContent = '👤';
        this.dom.authNavText.textContent = 'Sign In';
      }
    }
  }

  openAuthModal(tab = 'login') {
    this.switchAuthTab(tab);
    this.hideAuthAlert();
    this.dom.modalAuth.showModal();
    if (tab === 'login') {
      setTimeout(() => this.dom.loginIdent.focus(), 80);
    } else {
      setTimeout(() => this.dom.signupUsername.focus(), 80);
    }
  }

  switchAuthTab(tab) {
    this.hideAuthAlert();
    if (tab === 'login') {
      this.dom.tabBtnLogin.classList.add('active');
      this.dom.tabBtnLogin.setAttribute('aria-selected', 'true');
      this.dom.tabBtnSignup.classList.remove('active');
      this.dom.tabBtnSignup.setAttribute('aria-selected', 'false');
      this.dom.formLogin.classList.add('active');
      this.dom.formSignup.classList.remove('active');
      this.dom.authModalTitle.textContent = "Developer Authentication";
    } else {
      this.dom.tabBtnSignup.classList.add('active');
      this.dom.tabBtnSignup.setAttribute('aria-selected', 'true');
      this.dom.tabBtnLogin.classList.remove('active');
      this.dom.tabBtnLogin.setAttribute('aria-selected', 'false');
      this.dom.formSignup.classList.add('active');
      this.dom.formLogin.classList.remove('active');
      this.dom.authModalTitle.textContent = "Create Developer Profile";
    }
  }

  showAuthAlert(message, isError = true) {
    this.dom.authAlert.className = `auth-alert ${isError ? 'error' : 'success'}`;
    this.dom.authAlert.textContent = (isError ? '⚠️ ' : '✅ ') + message;
    this.dom.authAlert.classList.remove('hidden');
  }

  hideAuthAlert() {
    this.dom.authAlert.classList.add('hidden');
  }

  async handleLoginSubmit() {
    const ident = this.dom.loginIdent.value.trim();
    const pass = this.dom.loginPassword.value;

    if (!ident || !pass) {
      this.showAuthAlert("Please enter your username and password.");
      return;
    }

    this.dom.btnSubmitLogin.disabled = true;
    this.dom.btnSubmitLogin.textContent = "Authenticating...";

    const res = await this.auth.login(ident, pass);
    this.dom.btnSubmitLogin.disabled = false;
    this.dom.btnSubmitLogin.textContent = "⚡ Sign In to Account";

    if (res.success) {
      this.showAuthAlert("Signed in successfully!", false);
      this.updateAuthUI();
      this.sound.playVictory();
      setTimeout(() => {
        this.dom.modalAuth.close();
        this.dom.loginPassword.value = "";
      }, 700);
    } else {
      this.showAuthAlert(res.error || "Authentication failed.");
      this.sound.playIncorrect();
    }
  }

  async handleSignupSubmit() {
    const avatar = this.dom.signupAvatar.value;
    const username = this.dom.signupUsername.value.trim();
    const email = this.dom.signupEmail.value.trim();
    const pass = this.dom.signupPassword.value;
    const confirm = this.dom.signupConfirm.value;

    if (pass !== confirm) {
      this.showAuthAlert("Passwords do not match.");
      return;
    }

    this.dom.btnSubmitSignup.disabled = true;
    this.dom.btnSubmitSignup.textContent = "Registering with SQLite...";

    const res = await this.auth.signup(username, email, pass, avatar);
    this.dom.btnSubmitSignup.disabled = false;
    this.dom.btnSubmitSignup.textContent = "✨ Register & Save to SQL";

    if (res.success) {
      this.showAuthAlert("Account created & saved to database!", false);
      this.updateAuthUI();
      this.sound.playVictory();
      setTimeout(() => {
        this.dom.modalAuth.close();
        this.dom.signupPassword.value = "";
        this.dom.signupConfirm.value = "";
      }, 800);
    } else {
      this.showAuthAlert(res.error || "Registration failed.");
      this.sound.playIncorrect();
    }
  }

  openSettingsModal() {
    this.populateSettingsForm();
    this.dom.modalSettings.showModal();
  }

  populateSettingsForm() {
    const s = this.auth.settings;
    const u = this.auth.currentUser;

    if (u) {
      this.dom.settingsAccountAvatar.textContent = u.avatar || '👨‍💻';
      this.dom.settingsAccountName.textContent = u.username;
      this.dom.settingsAccountEmail.textContent = `${u.email} • Registered Engineer`;
      this.dom.btnSettingsAuthAction.textContent = "Sign Out";
      this.dom.btnSettingsAuthAction.className = "action-btn danger small";
    } else {
      this.dom.settingsAccountAvatar.textContent = '👨‍💻';
      this.dom.settingsAccountName.textContent = "Guest Engineer";
      this.dom.settingsAccountEmail.textContent = "Not authenticated • Playing in offline guest mode";
      this.dom.btnSettingsAuthAction.textContent = "Sign In";
      this.dom.btnSettingsAuthAction.className = "action-btn secondary small";
    }

    if (this.auth.isBackendConnected) {
      this.dom.settingsDbBadge.className = "sql-status-badge connected";
      this.dom.settingsDbStatusText.textContent = "SQLite Database: Connected (code_hangman.db)";
    } else {
      this.dom.settingsDbBadge.className = "sql-status-badge local";
      this.dom.settingsDbStatusText.textContent = "Local Storage (Offline Cache Mode)";
    }

    // Form inputs
    this.dom.settingThemeSelect.value = s.theme || 'theme-cyberpunk';
    this.dom.settingCrtToggle.checked = !!s.crt_effect;
    this.dom.settingGridToggle.checked = !!s.grid_bg;
    this.dom.settingGallowsSelect.value = s.gallows_view || 'vector';
    this.dom.settingSoundToggle.checked = !!s.sound_enabled;

    const volPct = Math.round((s.sound_volume !== undefined ? s.sound_volume : 0.7) * 100);
    this.dom.settingVolumeSlider.value = volPct;
    this.dom.settingVolumeText.textContent = `${volPct}%`;

    this.dom.settingDefaultLang.value = s.default_lang || 'all';
    this.dom.settingDefaultDiff.value = s.default_diff || 'all';
    this.dom.settingHardcoreToggle.checked = !!s.hardcore_mode;
  }

  saveSettingsFromModal() {
    const newSettings = {
      theme: this.dom.settingThemeSelect.value,
      crt_effect: this.dom.settingCrtToggle.checked,
      grid_bg: this.dom.settingGridToggle.checked,
      gallows_view: this.dom.settingGallowsSelect.value,
      sound_enabled: this.dom.settingSoundToggle.checked,
      sound_volume: parseInt(this.dom.settingVolumeSlider.value, 10) / 100,
      default_lang: this.dom.settingDefaultLang.value,
      default_diff: this.dom.settingDefaultDiff.value,
      hardcore_mode: this.dom.settingHardcoreToggle.checked
    };

    this.auth.saveSettings(newSettings);
    this.logTerminal("Preferences saved and synchronized.", "success");
  }

  exportAccountData() {
    const exportPayload = {
      app: "Code Hangman",
      version: "2.5",
      exportedAt: new Date().toISOString(),
      user: this.auth.currentUser || { role: "guest" },
      settings: this.auth.settings,
      stats: this.stats.data,
      customSnippets: JSON.parse(localStorage.getItem('code_hangman_custom_snippets') || '[]')
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code_hangman_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.logTerminal("Account profile and puzzle data exported to JSON.", "info");
  }

  // ==========================================================================
  // PROGRESSIVE WEB APP (PWA) CAPABILITIES
  // ==========================================================================

  initPWA() {
    // 1. Register Service Worker for offline execution
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            this.logTerminal(`[PWA] Service Worker registered. Offline sandbox active.`, 'info');
          })
          .catch((err) => {
            console.warn('[PWA] ServiceWorker registration notice:', err);
          });
      });
    }

    // 2. Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (this.dom.btnInstallApp) {
        this.dom.btnInstallApp.classList.remove('installed');
        this.dom.installText.textContent = "Install App";
      }
      this.logTerminal('[PWA] App install capability detected. Ready for standalone installation.', 'info');
    });

    // 3. Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      if (this.dom.btnInstallApp) {
        this.dom.btnInstallApp.classList.add('installed');
        this.dom.installIcon.textContent = "📱";
        this.dom.installText.textContent = "App Active";
      }
      this.sound.playVictory();
      this.logTerminal('[PWA] Successfully installed Code Hangman as a standalone app!', 'success');
    });

    // 4. Standalone window detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      if (this.dom.btnInstallApp) {
        this.dom.btnInstallApp.classList.add('installed');
        this.dom.installIcon.textContent = "📱";
        this.dom.installText.textContent = "App Active";
      }
      this.logTerminal('[PWA] Executing inside native standalone window environment.', 'success');
    }

    // 5. Network status monitoring
    window.addEventListener('online', () => {
      this.logTerminal('[Network] Online link restored.', 'success');
    });

    window.addEventListener('offline', () => {
      this.logTerminal('[Network] Offline mode active. Playing from local cache.', 'warning');
    });
  }

  // ==========================================================================
  // GAME CYCLE & LOGIC
  // ==========================================================================

  startNewGame() {
    // Select snippet based on language and difficulty filters
    let pool = this.snippets;
    if (this.selectedLanguage !== "all") {
      pool = pool.filter(s => s.language.toLowerCase() === this.selectedLanguage.toLowerCase());
    }
    if (this.selectedDifficulty !== "all") {
      pool = pool.filter(s => s.difficulty.toLowerCase() === this.selectedDifficulty.toLowerCase());
    }

    if (pool.length === 0) {
      this.logTerminal(`No snippets available for [${this.selectedLanguage}/${this.selectedDifficulty}]. Reverting to all.`, 'warning');
      pool = this.snippets;
    }

    // Pick random snippet
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.currentSnippet = chosen;
    this.lives = this.maxLives;
    this.guessedLetters.clear();
    this.roundGuesses = 0;
    this.isGameOver = false;

    // Reset hint drawer
    this.toggleHint(false);
    this.dom.hintText.textContent = chosen.hint;

    // Reset Visuals
    this.updateHUD();
    this.renderSnippetCode();
    this.renderTokenSlots();
    this.resetKeyboardKeys();

    this.logTerminal(`New target loaded: [${chosen.language}] ${chosen.difficulty} (${chosen.targetToken.length} chars).`, 'info');
  }

  handleGuessLetter(letter) {
    if (this.isGameOver) return;
    if (this.guessedLetters.has(letter)) {
      this.sound.playKeyClick();
      this.logTerminal(`Letter '${letter.toUpperCase()}' was already evaluated.`, 'warning');
      return;
    }

    this.guessedLetters.add(letter);
    this.roundGuesses++;

    const targetLower = this.currentSnippet.targetToken.toLowerCase();
    const isHit = targetLower.includes(letter);
    this.stats.recordGuess(isHit);
    this.updateStatsHUD();

    // Update virtual key button
    const keyBtn = document.querySelector(`.key-btn[data-key="${letter}"]`);
    if (keyBtn) {
      keyBtn.classList.remove('neutral');
      keyBtn.classList.add(isHit ? 'hit' : 'miss');
      keyBtn.disabled = true;
    }

    if (isHit) {
      this.sound.playCorrect();
      this.logTerminal(`Match! Token contains symbol '${letter.toUpperCase()}'.`, 'success');
      this.renderSnippetCode();
      this.renderTokenSlots();
      this.checkWinCondition();
    } else {
      this.sound.playIncorrect();
      this.lives = Math.max(0, this.lives - 1);
      this.logTerminal(`Miss! Symbol '${letter.toUpperCase()}' not in token. (-1 life)`, 'error');
      this.updateHUD();
      if (this.lives <= 0) {
        this.endGame(false);
      }
    }
  }

  handleSolveWholeTokenSubmit() {
    if (this.isGameOver) return;
    const guess = this.dom.inputSolveToken.value.trim().toLowerCase();
    this.dom.modalSolveToken.close();

    if (!guess) return;

    this.roundGuesses++;
    const targetLower = this.currentSnippet.targetToken.toLowerCase();
    const isHit = (guess === targetLower);
    this.stats.recordGuess(isHit);
    this.updateStatsHUD();

    if (isHit) {
      // Mark all letters as guessed
      for (const ch of targetLower) {
        this.guessedLetters.add(ch);
      }
      this.renderSnippetCode();
      this.renderTokenSlots();
      this.logTerminal(`CRITICAL SOLVE: Target token '${this.currentSnippet.targetToken}' resolved immediately!`, 'success');
      this.endGame(true);
    } else {
      this.sound.playIncorrect();
      this.lives = Math.max(0, this.lives - 1);
      this.logTerminal(`Incorrect whole-token attempt: '${guess}'. (-1 life)`, 'error');
      this.updateHUD();
      if (this.lives <= 0) {
        this.endGame(false);
      }
    }
  }

  checkWinCondition() {
    const target = this.currentSnippet.targetToken;
    const isWon = target.split('').every(ch => {
      return !/[a-zA-Z]/.test(ch) || this.guessedLetters.has(ch.toLowerCase());
    });

    if (isWon) {
      this.endGame(true);
    }
  }

  endGame(isWon) {
    this.isGameOver = true;
    this.updateHUD();

    if (isWon) {
      this.sound.playVictory();
      this.stats.recordWin();
      this.launchConfetti();
      this.showResultModal(true);
    } else {
      this.sound.playDefeat();
      this.stats.recordLoss();
      this.showResultModal(false);
    }

    this.updateStatsHUD();
    this.auth.syncStats(this.stats.data);
  }

  toggleHint(forceState) {
    if (typeof forceState === 'boolean') {
      if (forceState) {
        this.dom.hintDrawer.classList.remove('hidden');
        this.logTerminal(`Clue requested: "${this.currentSnippet.hint}"`, 'info');
      } else {
        this.dom.hintDrawer.classList.add('hidden');
      }
    } else {
      this.dom.hintDrawer.classList.toggle('hidden');
      if (!this.dom.hintDrawer.classList.contains('hidden')) {
        this.logTerminal(`Clue requested: "${this.currentSnippet.hint}"`, 'info');
      }
    }
  }

  // ==========================================================================
  // RENDERING & UI UPDATES
  // ==========================================================================

  updateHUD() {
    // 1. Lives Counter text
    this.dom.livesCounterText.textContent = `${this.lives} / ${this.maxLives} LIVES`;

    // 2. Health Bar
    const pct = Math.round((this.lives / this.maxLives) * 100);
    this.dom.healthBarFill.style.width = `${pct}%`;
    if (this.lives <= 2) {
      this.dom.healthBarFill.style.background = 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)';
    } else if (this.lives <= 4) {
      this.dom.healthBarFill.style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    } else {
      this.dom.healthBarFill.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    }

    // 3. Heart Icons
    this.dom.heartIcons.forEach((heart, idx) => {
      if (idx < this.lives) {
        heart.classList.add('active');
      } else {
        heart.classList.remove('active');
      }
    });

    // 4. Vector SVG Gallows Elements
    const mistakes = this.maxLives - this.lives;
    const partIds = ['part-head', 'part-torso', 'part-arm-left', 'part-arm-right', 'part-leg-left', 'part-leg-right'];
    partIds.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) {
        if (idx < mistakes) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // 5. ASCII Gallows Art
    const asciiClamped = Math.max(0, Math.min(6, this.lives));
    const asciiIdx = 6 - asciiClamped;
    this.dom.asciiArtPre.textContent = ASCII_STAGES[asciiIdx];

    // 6. Header Badges & File Tab
    const snip = this.currentSnippet;
    if (snip) {
      this.dom.badgeLang.textContent = snip.language.toUpperCase();
      this.dom.badgeDiff.textContent = snip.difficulty.toUpperCase();
      this.dom.badgeLen.textContent = `${snip.targetToken.length} CHARS`;

      const langIcons = { Python: '🐍', Java: '☕', C: '⚙️' };
      this.dom.fileTabIcon.textContent = langIcons[snip.language] || '📄';
      this.dom.fileTabName.textContent = snip.fileTab || 'solution.code';
    }
  }

  updateStatsHUD() {
    this.dom.streakVal.textContent = this.stats.data.currentStreak;
    this.dom.winsVal.textContent = this.stats.data.gamesWon;
    this.dom.accVal.textContent = `${this.stats.getAccuracy()}%`;
  }

  renderSnippetCode() {
    if (!this.currentSnippet) return;

    const target = this.currentSnippet.targetToken;
    let revealedTokenStr = "";

    // Build the rendered token representation
    for (const ch of target) {
      if (!/[a-zA-Z]/.test(ch) || this.guessedLetters.has(ch.toLowerCase()) || this.isGameOver) {
        revealedTokenStr += ch;
      } else {
        revealedTokenStr += "_ ";
      }
    }
    revealedTokenStr = revealedTokenStr.trim();

    const placeholderHTML = `<span class="syn-target-token">${revealedTokenStr}</span>`;

    // Apply syntax highlighting
    const template = this.currentSnippet.codeTemplate;
    const highlightedCode = this.highlightSyntax(template, this.currentSnippet.language, placeholderHTML);

    this.dom.codeDisplay.innerHTML = highlightedCode;

    // Line numbers
    const lineCount = template.split('\n').length;
    let numbersHTML = "";
    for (let i = 1; i <= lineCount; i++) {
      numbersHTML += `<span>${i.toString().padStart(2, '0')}</span>`;
    }
    this.dom.codeLineNumbers.innerHTML = numbersHTML;
  }

  highlightSyntax(code, lang, tokenPlaceholder) {
    // Escape HTML first
    let safe = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Keywords based on language
    const keywords = [
      'def', 'class', 'import', 'from', 'return', 'as', 'for', 'in', 'if', 'else', 'elif',
      'public', 'private', 'protected', 'void', 'static', 'new', 'final', 'package',
      'struct', 'size_t', 'int', 'float', 'char', 'const', 'while', 'sizeof'
    ];

    // Temporary replace {TARGET} with a marker
    safe = safe.replace(/\{TARGET\}/g, "___TARGET_TOKEN_PLACEHOLDER___");

    // Strings
    safe = safe.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, '<span class="syn-str">$&</span>');

    // Comments
    safe = safe.replace(/(\/\/.*$|#.*$)/gm, '<span class="syn-comment">$&</span>');

    // Keywords (word boundary)
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    safe = safe.replace(kwRegex, '<span class="syn-kw">$1</span>');

    // Numbers
    safe = safe.replace(/\b(\d+(_\d+)*(\.\d+)?f?)\b/g, '<span class="syn-num">$1</span>');

    // Restore target token placeholder
    safe = safe.replace(/___TARGET_TOKEN_PLACEHOLDER___/g, tokenPlaceholder);

    return safe;
  }

  renderTokenSlots() {
    if (!this.currentSnippet) return;
    const target = this.currentSnippet.targetToken;
    let slotsHTML = "";
    let unrevealedCount = 0;

    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      const isRevealed = !/[a-zA-Z]/.test(ch) || this.guessedLetters.has(ch.toLowerCase()) || this.isGameOver;

      if (isRevealed) {
        slotsHTML += `<div class="letter-cell revealed">${ch}</div>`;
      } else {
        slotsHTML += `<div class="letter-cell blank">_</div>`;
        unrevealedCount++;
      }
    }

    this.dom.tokenLetterCells.innerHTML = slotsHTML;
    this.dom.tokenStatusHint.textContent = unrevealedCount === 0 
      ? "Token Completed!" 
      : `${unrevealedCount} ${unrevealedCount === 1 ? 'letter' : 'letters'} remaining`;
  }

  renderKeyboard() {
    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    const rowContainers = [this.dom.kbRow1, this.dom.kbRow2, this.dom.kbRow3];

    rows.forEach((rowKeys, idx) => {
      const container = rowContainers[idx];
      container.innerHTML = "";
      rowKeys.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'key-btn neutral';
        btn.dataset.key = letter;
        btn.textContent = letter.toUpperCase();
        btn.setAttribute('aria-label', `Guess letter ${letter.toUpperCase()}`);
        btn.addEventListener('click', () => this.handleGuessLetter(letter));
        container.appendChild(btn);
      });
    });
  }

  resetKeyboardKeys() {
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.className = 'key-btn neutral';
      btn.disabled = false;
    });
  }

  logTerminal(message, type = 'info') {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.textContent = `[${timeStr}] ${message}`;

    this.dom.consoleLog.appendChild(line);
    this.dom.consoleLog.scrollTop = this.dom.consoleLog.scrollHeight;
  }

  // ==========================================================================
  // MODALS & DIALOGS
  // ==========================================================================

  showResultModal(isWon) {
    const snip = this.currentSnippet;
    if (isWon) {
      this.dom.resultBanner.className = 'result-banner win';
      this.dom.resultIcon.textContent = '🎉';
      this.dom.resultTitle.textContent = 'COMPILATION SUCCEEDED';
      this.dom.resultCodeTag.textContent = 'EXIT_CODE 0 [OK]';
      this.dom.modalResultCard.style.borderColor = 'var(--accent-green)';
    } else {
      this.dom.resultBanner.className = 'result-banner lose';
      this.dom.resultIcon.textContent = '💥';
      this.dom.resultTitle.textContent = 'RUNTIME PANIC / SEGFAULT';
      this.dom.resultCodeTag.textContent = 'SIGSEGV 139';
      this.dom.modalResultCard.style.borderColor = 'var(--accent-red)';
    }

    this.dom.resultTokenValue.textContent = snip.targetToken;
    this.dom.resultExplanationText.textContent = snip.explanation;

    // Show restored code
    const restored = snip.codeTemplate.replace(/\{TARGET\}/g, snip.targetToken);
    this.dom.resultRestoredCode.textContent = restored;

    this.dom.modalResult.showModal();
  }

  renderStatsModal() {
    const d = this.stats.data;
    this.dom.statsTotalPlayed.textContent = d.gamesPlayed;
    this.dom.statsTotalWon.textContent = d.gamesWon;
    this.dom.statsWinRate.textContent = `${this.stats.getWinRate()}%`;
    this.dom.statsCurrentStreak.textContent = d.currentStreak;
    this.dom.statsBestStreak.textContent = d.bestStreak;
    this.dom.statsTotalGuesses.textContent = d.totalGuesses;
  }

  saveCustomSnippet() {
    const lang = document.getElementById('custom-lang').value;
    const diff = document.getElementById('custom-diff').value;
    const token = document.getElementById('custom-token').value.trim();
    const template = document.getElementById('custom-template').value.trim();
    const hint = document.getElementById('custom-hint').value.trim();
    const explanation = document.getElementById('custom-explanation').value.trim();

    if (!template.includes('{TARGET}')) {
      alert("Error: Your code template must contain the placeholder '{TARGET}' where the missing token belongs!");
      return;
    }

    const newSnippet = {
      id: `custom-${Date.now()}`,
      language: lang,
      difficulty: diff,
      targetToken: token,
      fileTab: `custom_${lang.toLowerCase()}.${lang === 'Python' ? 'py' : lang === 'Java' ? 'java' : 'c'}`,
      codeTemplate: template,
      hint: hint,
      explanation: explanation
    };

    // Save locally
    const raw = localStorage.getItem('code_hangman_custom_snippets');
    let customList = [];
    if (raw) {
      try { customList = JSON.parse(raw); } catch (e) {}
    }
    customList.push(newSnippet);
    localStorage.setItem('code_hangman_custom_snippets', JSON.stringify(customList));

    this.snippets.push(newSnippet);
    this.dom.modalCustom.close();

    // Immediately load and play the snippet!
    this.currentSnippet = newSnippet;
    this.lives = this.maxLives;
    this.guessedLetters.clear();
    this.roundGuesses = 0;
    this.isGameOver = false;

    this.toggleHint(false);
    this.dom.hintText.textContent = newSnippet.hint;
    this.updateHUD();
    this.renderSnippetCode();
    this.renderTokenSlots();
    this.resetKeyboardKeys();

    this.logTerminal(`Loaded newly crafted custom puzzle: [${newSnippet.language}]`, 'success');
  }

  copyCustomSnippetAsPython() {
    const lang = document.getElementById('custom-lang').value;
    const diff = document.getElementById('custom-diff').value;
    const token = document.getElementById('custom-token').value.trim();
    const template = document.getElementById('custom-template').value.trim();
    const hint = document.getElementById('custom-hint').value.trim();
    const explanation = document.getElementById('custom-explanation').value.trim();

    const pyCode = 
`self._snippets.append(
    Snippet(
        id="custom-${Date.now().toString().slice(-4)}",
        language=Language.${lang === 'C' ? 'C' : lang.toUpperCase()},
        difficulty=Difficulty.${diff.toUpperCase()},
        target_token="${token || 'example'}",
        code_template=(
${template.split('\n').map(l => `            "${l.replace(/"/g, '\\"')}\\n"`).join('\n')}
        ),
        hint="${hint.replace(/"/g, '\\"')}",
        explanation="${explanation.replace(/"/g, '\\"')}"
    )
)`;

    navigator.clipboard.writeText(pyCode).then(() => {
      alert("Snippet Python code copied to clipboard! Paste it inside code_hangman.py -> SnippetDatabase._populate_snippets().");
    }).catch(() => {
      prompt("Copy Python snippet code:", pyCode);
    });
  }

  // ==========================================================================
  // CONFETTI CELEBRATION (Pure Canvas, No external dependencies)
  // ==========================================================================

  launchConfetti() {
    const canvas = this.dom.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00f2fe', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.spin;
        p.life -= p.decay;

        if (p.life > 0) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  }
}

// Instantiate game on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.codeHangmanApp = new CodeHangmanGame();
});
