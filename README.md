# 💻 Code Hangman (Terminal & Web Editions)

A developer-centric syntax guessing game that tests your mastery of language idioms, keywords, memory qualifiers, and systems-level concepts across **Python**, **Java**, and **C/C++**.

Instead of guessing generic English words, players must deduce missing programming tokens inside realistic, syntax-highlighted code snippets.

---

## 🎮 Game Editions Available

This project provides **three complete implementations**:
1. **Interactive Web Application (`index.html`)**: A cyberpunk IDE-themed web app featuring dynamic SVG & retro ASCII gallows, synthesized Web Audio FX, code syntax highlighting, on-screen + physical keyboard input, custom snippet creator, and persistent streak tracker.
2. **Terminal Python Engine (`code_hangman.py`)**: A self-contained, object-oriented Python 3 script featuring ANSI color formatting, 6-stage ASCII gallows, hint system, whole-token guessing, and post-round architectural explanations.
3. **Android Kotlin App (`app/`)**: A native Android mobile app built using Kotlin, XML Views, ViewBinding, Material 3 Dark Theme, and interactive puzzle engine.

---

## 🚀 How to Run

### Option A: Launching as a Standalone App (Recommended)

#### Method 1: Instant 1-Click App Launcher (`launch_app.bat` or `npm start`)
Run the launcher script to automatically boot the server and open Code Hangman in an isolated, borderless app window:
```powershell
# Using the 1-click batch launcher (auto-detects Node.js, Python, or Chrome):
.\launch_app.bat

# Or using Node.js (Installed):
npm start
# or:
node server.js

# Or using Python (if Python is installed):
python launch_app.py
```

#### Method 2: Install as a Progressive Web App (PWA)
1. Start the local server:
```powershell
node server.js
```
2. Navigate to **`http://localhost:8080`** in Chrome, Edge, or Brave.
3. Click the glowing **`📲 Install App`** button in the top navigation bar (or the install icon in your address bar).
4. Code Hangman will be installed as a native desktop/mobile app with its own launch icon, offline caching, and standalone window!

#### Method 3: Direct File Launch
Double-click or open `index.html` directly in Chrome, Edge, Safari, or Firefox:
`file:///C:/Users/balam/.gemini/antigravity-ide/scratch/code-hangman/index.html`

---

### Option B: Running the Terminal Edition

Run the self-contained script using Python 3.8+:

```powershell
# Using the installed Python 3.11 interpreter:
python3.11 code_hangman.py

# Or if 'python' is configured on your PATH:
python code_hangman.py
```

*File location:* [`code_hangman.py`](code_hangman.py)

---

### Option C: Installing the Android Kotlin App (APK)

Install the compiled Android APK directly onto an Android device or emulator:

1. **Instant 1-Click APK Launcher**: Double-click [`install_and_run_apk.bat`](install_and_run_apk.bat) to automatically install and launch `code-hangman.apk` on your connected Android phone or emulator!
2. **Pre-built APK File**: [`code-hangman.apk`](code-hangman.apk) (5.7 MB) located in the project root directory.
3. **Build from source**:
```powershell
.\gradlew assembleDebug
```
*Compiled APK output:* `app/build/outputs/apk/debug/app-debug.apk`

---

## 🗄️ SQLite Database & User Authentication

Code Hangman includes an embedded **SQLite database (`code_hangman.db`)** with a REST API backend:

### 🔐 Authentication (Login & Sign Up)
- **Account Registration**: Click `👤 Sign In` ➔ `Create Account` to choose an avatar, register a unique username, email, and password.
- **Security**: Passwords are salted and hashed with SHA-256 (`hashlib.sha256` + `secrets.token_hex`). Session tokens are stored securely in SQLite (`sessions` table).
- **Profile Persistence**: Your streak, wins, accuracy, and custom settings are automatically synced to your SQL profile.
- **Offline / Standalone Fallback**: If running without the local server (via `file://` or offline PWA), authentication seamlessly falls back to local storage cache mode.

### ⚙️ App & Gameplay Settings Panel
Click the **`⚙️ Settings`** button in the top navigation bar to configure:
1. **User Profile**: View active account, email, and live SQLite database status indicator (`🟢 SQLite Connected`).
2. **Appearance & Graphics**: Switch themes (*Cyberpunk*, *Matrix*, *Monokai*), toggle CRT scanlines, perspective matrix grid, and choose default execution monitor (*SVG Vector* vs *ASCII Art*).
3. **Web Audio Synthesizer**: Toggle sound FX and adjust master gain volume with live test beep.
4. **Gameplay Preferences**: Set default language filter, starting difficulty, or activate **Hardcore Mode** (3 lives).
5. **Data Management**: Export account profile and puzzle statistics as JSON, or reset historical records.

## 🕹️ Controls & Core Mechanics

| Action | Terminal Command / Key | Web App Control |
| :--- | :--- | :--- |
| **Guess Letter** | Type any single letter `a`–`z` | Click virtual key or press `A`–`Z` on keyboard |
| **Solve Whole Token** | Type the full token (e.g. `synchronized`) | Click `⚡ Solve Token` (or press `Enter`) |
| **Contextual Hint** | Type `?` | Click `💡 Clue / Hint` (or press `?` / `/`) |
| **Forfeit / Surrender** | Type `!` | Click `🏳️ Surrender` |
| **New Puzzle** | Select from post-game prompt | Click `🔄 Next Puzzle` (or press `N`) |

- **Lives**: 6 lives visualized via animated Gallows (SVG / ASCII).
- **Penalties**: Each incorrect single letter or wrong whole-token guess deducts 1 life.
- **Victory**: Revealing all letters in the token completes the code.
- **Learning**: Win or lose, the full restored code is displayed alongside an in-depth architectural explanation of the idiom or keyword.

---

## 📚 Curated Snippet Database

The engine includes rich puzzles across 3 difficulty tiers:

### 🐍 Python
- **Beginner**: Iteration indexing (`enumerate`), deterministic context management (`with`).
- **Intermediate**: Anonymous inline functions (`lambda`), stream generator production (`yield`).
- **Advanced**: Metadata-preserving decorator wrappers (`wraps`), ABC enforcement (`abstractmethod`).

### ☕ Java
- **Beginner**: Interface contract adherence (`implements`), pattern matching type checks (`instanceof`).
- **Intermediate**: Stream API reduction (`collect`), mutual exclusion monitor locking (`synchronized`).
- **Advanced**: Cross-thread memory visibility (`volatile`), serialization exclusion (`transient`).

### ⚙️ C / C++
- **Beginner**: Compile-time type sizing (`sizeof`), type aliasing (`typedef`).
- **Intermediate**: Heap buffer resizing (`realloc`), bounds-limited string copies (`strncpy`).
- **Advanced**: MMIO hardware register qualifiers (`volatile`), SIMD loop pointer un-aliasing (`restrict`).

---

## 🛠️ Adding Custom Snippets & Languages

### 1. In the Web Application
1. Click the **`➕ Custom Snippet`** button in the top navigation bar.
2. Select target language and difficulty.
3. Type the **Target Token** and the **Code Template** containing the `{TARGET}` placeholder.
4. Provide a hint and architectural explanation.
5. Click **`⚡ Play Snippet Now`** to immediately play your puzzle, or **`📋 Copy Python Code`** to generate the exact Python code for the terminal version!

### 2. In the Python Terminal Engine (`code_hangman.py`)

Open [`code_hangman.py`](code_hangman.py) and append a new `Snippet` instance to `SnippetDatabase._populate_snippets()`:

```python
self._snippets.append(
    Snippet(
        id="py-custom-01",
        language=Language.PYTHON,
        difficulty=Difficulty.INTERMEDIATE,
        target_token="dataclass",
        code_template=(
            "from dataclasses import {TARGET}\n\n"
            "@{TARGET}(frozen=True)\n"
            "class ServerConfig:\n"
            "    host: str\n"
            "    port: int = 8080"
        ),
        hint="Decorator used to generate boilerplate special methods for classes.",
        explanation=(
            "`@dataclass` automatically generates methods like `__init__`, `__repr__`, "
            "and `__eq__` based on typed class variable annotations."
        )
    )
)
```

#### Adding a New Language (e.g. Rust or Go):
1. In `Language(str, Enum)`, add the new member:
   ```python
   class Language(str, Enum):
       PYTHON = "Python"
       JAVA = "Java"
       C = "C"
       RUST = "Rust"  # Add new language
   ```
2. Update `from_choice()` to map input choices (e.g. `"4"`, `"r"`, `"rust"`).
3. Add snippets with `language=Language.RUST`.

---

## 📐 Architecture & Design Principles

- **Object-Oriented Design**:
  - `Snippet`: Immutable puzzle representation with placeholder rendering (`get_rendered_code`).
  - `HangmanVisuals`: 7-stage ASCII visual progression with health-state coloring.
  - `SnippetDatabase`: Query engine with language and difficulty filtering and exhaustion protection.
  - `GameEngine`: Terminal state machine, HUD renderer, guess validator, and statistics recorder.
  - `SoundFX` (Web): Real-time audio synthesizer built on the standard Web Audio API (zero audio file dependencies).
  - `CodeHangmanGame` (Web): Event-driven client application managing SVG & ASCII gallows, syntax highlighter, and local storage.
