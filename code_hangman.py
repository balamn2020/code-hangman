#!/usr/bin/env python3
"""
Code Hangman - Terminal Edition
A developer-centric twist on classic Hangman where players guess missing
programming keywords, tokens, and core built-in constructs inside realistic code snippets.
"""

from __future__ import annotations

import os
import sys
import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional, Tuple, Set


# ============================================================================
# ANSI Terminal Styling & Helpers
# ============================================================================

class Style:
    """Terminal ANSI escape codes for styling with Windows virtual terminal support."""
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    ITALIC = "\033[3m"
    UNDERLINE = "\033[4m"

    # Foreground colors
    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"

    # Bright foreground colors
    BRIGHT_BLACK = "\033[90m"
    BRIGHT_RED = "\033[91m"
    BRIGHT_GREEN = "\033[92m"
    BRIGHT_YELLOW = "\033[93m"
    BRIGHT_BLUE = "\033[94m"
    BRIGHT_MAGENTA = "\033[95m"
    BRIGHT_CYAN = "\033[96m"
    BRIGHT_WHITE = "\033[97m"

    # Backgrounds
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_BLUE = "\033[44m"
    BG_CYAN = "\033[46m"


def enable_windows_ansi() -> None:
    """Enable ANSI virtual terminal processing on Windows if supported."""
    if os.name == "nt":
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            # STD_OUTPUT_HANDLE = -11
            handle = kernel32.GetStdHandle(-11)
            mode = ctypes.c_ulong()
            kernel32.GetConsoleMode(handle, ctypes.byref(mode))
            # ENABLE_VIRTUAL_TERMINAL_PROCESSING = 0x0004
            kernel32.SetConsoleMode(handle, mode.value | 0x0004)
        except Exception:
            pass


def clear_screen() -> None:
    """Clear terminal screen if running in an interactive terminal."""
    if sys.stdout.isatty():
        os.system("cls" if os.name == "nt" else "clear")
    else:
        print("\n" + "=" * 60 + "\n")



# ============================================================================
# Domain Models & Enums
# ============================================================================

class Language(str, Enum):
    PYTHON = "Python"
    JAVA = "Java"
    C = "C"

    @classmethod
    def from_choice(cls, choice: str) -> Optional[Language]:
        mapping = {
            "1": cls.PYTHON,
            "2": cls.JAVA,
            "3": cls.C,
            "p": cls.PYTHON,
            "python": cls.PYTHON,
            "j": cls.JAVA,
            "java": cls.JAVA,
            "c": cls.C,
        }
        return mapping.get(choice.strip().lower())


class Difficulty(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

    @classmethod
    def from_choice(cls, choice: str) -> Optional[Difficulty]:
        mapping = {
            "1": cls.BEGINNER,
            "2": cls.INTERMEDIATE,
            "3": cls.ADVANCED,
            "b": cls.BEGINNER,
            "beg": cls.BEGINNER,
            "i": cls.INTERMEDIATE,
            "int": cls.INTERMEDIATE,
            "a": cls.ADVANCED,
            "adv": cls.ADVANCED,
        }
        return mapping.get(choice.strip().lower())


@dataclass(frozen=True)
class Snippet:
    """Represents a code snippet puzzle."""
    id: str
    language: Language
    difficulty: Difficulty
    target_token: str
    code_template: str  # Code template containing {TARGET} placeholder
    hint: str
    explanation: str

    def get_rendered_code(self, revealed_target: str) -> str:
        """Returns the code snippet with the target token replaced."""
        return self.code_template.replace("{TARGET}", revealed_target)


# ============================================================================
# ASCII Gallows & Visuals
# ============================================================================

class HangmanVisuals:
    """ASCII hangman visual states (6 lives down to 0)."""

    STAGES: List[str] = [
        # Stage 6: 0 mistakes (Full lives)
        r"""
          ┌─────────────┐
          │             │
          │             
          │            
          │            
          │            
         ─┴────────────────────
        """,
        # Stage 5: 1 mistake (Head)
        r"""
          ┌─────────────┐
          │             │
          │           (o_o)
          │            
          │            
          │            
         ─┴────────────────────
        """,
        # Stage 4: 2 mistakes (Head + Body)
        r"""
          ┌─────────────┐
          │             │
          │           (o_o)
          │             │
          │             │
          │            
         ─┴────────────────────
        """,
        # Stage 3: 3 mistakes (Head + Body + Left Arm)
        r"""
          ┌─────────────┐
          │             │
          │           (o_o)
          │            /│
          │           / │
          │            
         ─┴────────────────────
        """,
        # Stage 2: 4 mistakes (Head + Body + Both Arms)
        r"""
          ┌─────────────┐
          │             │
          │           (o_o)
          │            /│\
          │           / │ \
          │            
         ─┴────────────────────
        """,
        # Stage 1: 5 mistakes (One leg remaining)
        r"""
          ┌─────────────┐
          │             │
          │           (x_x)
          │            /│\
          │           / │ \
          │            / 
         ─┴───────────/────────
        """,
        # Stage 0: 6 mistakes (Hanged - Game Over)
        r"""
          ┌─────────────┐
          │             │
          │           (x_X)  FATAL SEGFAULT!
          │            /│\
          │           / │ \
          │            / \
         ─┴───────────/───\────
        """
    ]

    @classmethod
    def get_ascii_art(cls, lives: int) -> str:
        """Lives range from 6 down to 0."""
        clamped = max(0, min(6, lives))
        stage_idx = 6 - clamped
        stage_art = cls.STAGES[stage_idx].strip("\n")

        # Colorize gallows depending on health
        if lives >= 5:
            color = Style.BRIGHT_GREEN
        elif lives >= 3:
            color = Style.BRIGHT_YELLOW
        elif lives >= 1:
            color = Style.BRIGHT_RED
        else:
            color = Style.RED + Style.BOLD

        colored_lines = [f"{color}{line}{Style.RESET}" for line in stage_art.splitlines()]
        return "\n".join(colored_lines)


# ============================================================================
# Snippet Database
# ============================================================================

class SnippetDatabase:
    """Curated snippet repository across Python, Java, and C."""

    def __init__(self) -> None:
        self._snippets: List[Snippet] = []
        self._populate_snippets()

    def _populate_snippets(self) -> None:
        # --------------------------------------------------------------------
        # PYTHON SNIPPETS
        # --------------------------------------------------------------------
        self._snippets.append(
            Snippet(
                id="py-01",
                language=Language.PYTHON,
                difficulty=Difficulty.BEGINNER,
                target_token="enumerate",
                code_template=(
                    "items = ['alpha', 'beta', 'gamma']\n"
                    "for index, value in {TARGET}(items):\n"
                    "    print(f\"{index}: {value}\")"
                ),
                hint="Built-in function that yields index-value pairs during iteration.",
                explanation=(
                    "`enumerate(iterable, start=0)` returns an enumerate object yielding tuples "
                    "containing a count (from start) and the values obtained from iterating over iterable."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="py-02",
                language=Language.PYTHON,
                difficulty=Difficulty.BEGINNER,
                target_token="with",
                code_template=(
                    "{TARGET} open('app.log', 'r', encoding='utf-8') as stream:\n"
                    "    logs = stream.readlines()\n"
                    "print(f\"Processed {len(logs)} log entries.\")"
                ),
                hint="Keyword used to wrap the execution of a block with methods defined by a context manager.",
                explanation=(
                    "The `with` statement encapsulates `__enter__` and `__exit__` execution contexts, "
                    "guaranteeing deterministic resource cleanup (like file descriptors and network sockets)."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="py-03",
                language=Language.PYTHON,
                difficulty=Difficulty.INTERMEDIATE,
                target_token="lambda",
                code_template=(
                    "points = [(4, 2), (1, 9), (5, 1)]\n"
                    "# Sort coordinate points by their Y-coordinate ascending\n"
                    "points.sort(key={TARGET} pt: pt[1])"
                ),
                hint="Anonymous inline function keyword in Python.",
                explanation=(
                    "The `lambda` keyword creates small anonymous functions syntactically restricted "
                    "to a single expression, commonly passed as sorting keys or callbacks."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="py-04",
                language=Language.PYTHON,
                difficulty=Difficulty.INTERMEDIATE,
                target_token="yield",
                code_template=(
                    "def fibonacci_stream():\n"
                    "    a, b = 0, 1\n"
                    "    while True:\n"
                    "        {TARGET} a\n"
                    "        a, b = b, a + b"
                ),
                hint="Pauses function execution and produces an item to the caller generator.",
                explanation=(
                    "The `yield` statement suspends a function’s execution and sends a value back "
                    "to the caller, retaining sufficient state to enable the function to resume where it left off."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="py-05",
                language=Language.PYTHON,
                difficulty=Difficulty.ADVANCED,
                target_token="wraps",
                code_template=(
                    "from functools import {TARGET}\n\n"
                    "def logged_action(fn):\n"
                    "    @{TARGET}(fn)\n"
                    "    def wrapper(*args, **kwargs):\n"
                    "        print(f\"Invoking {fn.__name__}\")\n"
                    "        return fn(*args, **kwargs)\n"
                    "    return wrapper"
                ),
                hint="Decorator factory from functools that preserves the decorated function's metadata.",
                explanation=(
                    "`functools.wraps` copies attributes such as `__name__`, `__doc__`, and `__module__` "
                    "from the wrapped function to the wrapper, preventing metadata loss."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="py-06",
                language=Language.PYTHON,
                difficulty=Difficulty.ADVANCED,
                target_token="abstractmethod",
                code_template=(
                    "from abc import ABC, {TARGET}\n\n"
                    "class BaseRepository(ABC):\n"
                    "    @{TARGET}\n"
                    "    def find_by_id(self, entity_id: str):\n"
                    "        pass"
                ),
                hint="ABC decorator requiring subclasses to implement this method.",
                explanation=(
                    "`@abstractmethod` from the `abc` module marks an abstract method on an abstract base class, "
                    "preventing instantiation of concrete derived classes that don't override it."
                )
            )
        )

        # --------------------------------------------------------------------
        # JAVA SNIPPETS
        # --------------------------------------------------------------------
        self._snippets.append(
            Snippet(
                id="jv-01",
                language=Language.JAVA,
                difficulty=Difficulty.BEGINNER,
                target_token="implements",
                code_template=(
                    "public class DatabaseAuditor {TARGET} Runnable, AutoCloseable {\n"
                    "    @Override\n"
                    "    public void run() {\n"
                    "        System.out.println(\"Auditing transactions...\");\n"
                    "    }\n"
                    "}"
                ),
                hint="Keyword used by a class to adhere to one or more interfaces.",
                explanation=(
                    "In Java, `implements` specifies contracts (interfaces) that the class fulfills. "
                    "Unlike inheritance with `extends`, a class can implement multiple interfaces."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="jv-02",
                language=Language.JAVA,
                difficulty=Difficulty.BEGINNER,
                target_token="instanceof",
                code_template=(
                    "public void processMessage(Object payload) {\n"
                    "    if (payload {TARGET} String text) {\n"
                    "        System.out.println(\"Received string: \" + text.toUpperCase());\n"
                    "    }\n"
                    "}"
                ),
                hint="Operator used for runtime type checks and pattern matching in modern Java.",
                explanation=(
                    "`instanceof` tests whether an object reference is an instance of a specified class, "
                    "subclass, or interface. Java 16+ supports pattern matching variable binding."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="jv-03",
                language=Language.JAVA,
                difficulty=Difficulty.INTERMEDIATE,
                target_token="collect",
                code_template=(
                    "List<String> names = employees.stream()\n"
                    "    .filter(emp -> emp.getSalary() > 100_000)\n"
                    "    .map(Employee::getName)\n"
                    "    .{TARGET}(Collectors.toList());"
                ),
                hint="Terminal stream operation that gathers pipeline elements into a container/collection.",
                explanation=(
                    "`.collect(Collector)` is a terminal reduction operation on Java Streams that accumulates "
                    "elements into a mutable result container such as a List, Set, or Map."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="jv-04",
                language=Language.JAVA,
                difficulty=Difficulty.INTERMEDIATE,
                target_token="synchronized",
                code_template=(
                    "public class Counter {\n"
                    "    private int total = 0;\n\n"
                    "    public {TARGET} void increment() {\n"
                    "        this.total++;\n"
                    "    }\n"
                    "}"
                ),
                hint="Keyword providing mutual exclusion lock across concurrent threads on monitor objects.",
                explanation=(
                    "`synchronized` acquires an intrinsic monitor lock on the object (or class object if static), "
                    "ensuring only one thread executes the critical section concurrently."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="jv-05",
                language=Language.JAVA,
                difficulty=Difficulty.ADVANCED,
                target_token="volatile",
                code_template=(
                    "public class WorkerThread implements Runnable {\n"
                    "    // Guarantees cross-thread memory visibility without caching in CPU registers\n"
                    "    private {TARGET} boolean active = true;\n\n"
                    "    public void terminate() {\n"
                    "        this.active = false;\n"
                    "    }\n"
                    "}"
                ),
                hint="Field modifier establishing a happens-before memory visibility guarantee.",
                explanation=(
                    "The `volatile` modifier ensures that reads and writes to that variable are immediately "
                    "visible to all threads by bypassing local CPU core caching and preventing instruction reordering."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="jv-06",
                language=Language.JAVA,
                difficulty=Difficulty.ADVANCED,
                target_token="transient",
                code_template=(
                    "public class UserSession implements java.io.Serializable {\n"
                    "    private String username;\n"
                    "    // Exclude plaintext secret credential from byte serialization\n"
                    "    private {TARGET} String decryptedAuthToken;\n"
                    "}"
                ),
                hint="Modifier marking a field that should NOT be serialized by standard Java ObjectOutputStream.",
                explanation=(
                    "`transient` tells the JVM serializer that the field should be skipped when "
                    "persisting the object graph to a byte stream, defaulting to null/0 on deserialization."
                )
            )
        )

        # --------------------------------------------------------------------
        # C / C++ SNIPPETS
        # --------------------------------------------------------------------
        self._snippets.append(
            Snippet(
                id="c-01",
                language=Language.C,
                difficulty=Difficulty.BEGINNER,
                target_token="sizeof",
                code_template=(
                    "size_t buffer_len = 64;\n"
                    "int *numbers = (int *)malloc(buffer_len * {TARGET}(int));\n"
                    "if (numbers == NULL) {\n"
                    "    perror(\"Memory allocation failed\");\n"
                    "}"
                ),
                hint="Compile-time operator returning size in bytes of an expression or type.",
                explanation=(
                    "`sizeof` yields the storage size in bytes of its operand (expression or parenthesized type name), "
                    "fundamental for portable dynamic memory allocation."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="c-02",
                language=Language.C,
                difficulty=Difficulty.BEGINNER,
                target_token="typedef",
                code_template=(
                    "struct Point2D {\n"
                    "    float x;\n"
                    "    float y;\n"
                    "};\n"
                    "{TARGET} struct Point2D Point;\n\n"
                    "Point origin = {0.0f, 0.0f};"
                ),
                hint="Storage class specifier defining an alias for an existing type.",
                explanation=(
                    "`typedef` allows developers to establish new identifiers as aliases for existing types, "
                    "improving readability and reducing boilerplate with C structs and function pointers."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="c-03",
                language=Language.C,
                difficulty=Difficulty.INTERMEDIATE,
                target_token="realloc",
                code_template=(
                    "size_t new_capacity = old_capacity * 2;\n"
                    "int *resized = (int *){TARGET}(buffer, new_capacity * sizeof(int));\n"
                    "if (resized != NULL) {\n"
                    "    buffer = resized;\n"
                    "}"
                ),
                hint="Standard library memory allocator that resizes previously allocated heap blocks.",
                explanation=(
                    "`realloc(ptr, new_size)` reallocates memory on the heap, copying old data if a new block "
                    "must be allocated elsewhere, or returns NULL on failure without freeing the original buffer."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="c-04",
                language=Language.C,
                difficulty=Difficulty.INTERMEDIATE,
                target_token="strncpy",
                code_template=(
                    "char dest[32];\n"
                    "const char *source = \"Antigravity Secure Daemon\";\n"
                    "// Bounds-checked copy up to buffer capacity\n"
                    "{TARGET}(dest, source, sizeof(dest) - 1);\n"
                    "dest[sizeof(dest) - 1] = '\\0';"
                ),
                hint="Bounds-limited string copy function from <string.h>.",
                explanation=(
                    "`strncpy(dest, src, n)` copies at most n characters from src to dest. "
                    "If src is shorter than n, null bytes are appended; if longer, null termination is not guaranteed."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="c-05",
                language=Language.C,
                difficulty=Difficulty.ADVANCED,
                target_token="volatile",
                code_template=(
                    "// Memory-mapped hardware status register: prevent compiler from optimizing reads away\n"
                    "{TARGET} uint32_t *const UART_STATUS_REG = (uint32_t *)0x4000C000;\n\n"
                    "while ((*UART_STATUS_REG & 0x01) == 0) {\n"
                    "    /* Wait for transmission ready */\n"
                    "}"
                ),
                hint="Type qualifier warning optimizer that hardware or interrupt handlers may alter the value.",
                explanation=(
                    "In C/C++, `volatile` informs the compiler that a value may change asynchronously "
                    "(e.g., hardware MMIO register or signal handler), disabling optimization caching into registers."
                )
            )
        )
        self._snippets.append(
            Snippet(
                id="c-06",
                language=Language.C,
                difficulty=Difficulty.ADVANCED,
                target_token="restrict",
                code_template=(
                    "void vector_add(size_t n, float *{TARGET} a, float *{TARGET} b, float *{TARGET} out) {\n"
                    "    // Guarantees pointers do not alias, enabling SIMD vectorization\n"
                    "    for (size_t i = 0; i < n; ++i) {\n"
                    "        out[i] = a[i] + b[i];\n"
                    "    }\n"
                    "}"
                ),
                hint="C99 pointer qualifier promising that no other pointer will access the referenced object in that scope.",
                explanation=(
                    "`restrict` (introduced in C99) asserts pointer un-aliasing, assuring the compiler "
                    "that memory modifications through this pointer won't alter data read through others, allowing aggressive SIMD loop optimization."
                )
            )
        )

    def filter(
        self,
        language: Optional[Language] = None,
        difficulty: Optional[Difficulty] = None
    ) -> List[Snippet]:
        """Filter snippets by language and difficulty."""
        results = self._snippets
        if language is not None:
            results = [s for s in results if s.language == language]
        if difficulty is not None:
            results = [s for s in results if s.difficulty == difficulty]
        return results

    def get_random_snippet(
        self,
        language: Optional[Language] = None,
        difficulty: Optional[Difficulty] = None,
        exclude_ids: Optional[Set[str]] = None
    ) -> Optional[Snippet]:
        """Select a random snippet avoiding recent repeats."""
        pool = self.filter(language, difficulty)
        if exclude_ids:
            unseen = [s for s in pool if s.id not in exclude_ids]
            if unseen:
                return random.choice(unseen)
        return random.choice(pool) if pool else None


# ============================================================================
# Game State & Engine
# ============================================================================

@dataclass
class GameStats:
    """Tracks overall session metrics."""
    games_played: int = 0
    games_won: int = 0
    current_streak: int = 0
    best_streak: int = 0
    total_guesses: int = 0

    def record_win(self, guesses: int) -> None:
        self.games_played += 1
        self.games_won += 1
        self.current_streak += 1
        self.total_guesses += guesses
        if self.current_streak > self.best_streak:
            self.best_streak = self.current_streak

    def record_loss(self, guesses: int) -> None:
        self.games_played += 1
        self.current_streak = 0
        self.total_guesses += guesses

    @property
    def win_rate(self) -> float:
        return (self.games_won / self.games_played * 100) if self.games_played > 0 else 0.0


class GameEngine:
    """Manages round lifecycle, guess evaluation, and terminal interactions."""

    INITIAL_LIVES: int = 6

    def __init__(self, database: SnippetDatabase) -> None:
        self.database = database
        self.stats = GameStats()
        self.played_snippet_ids: Set[str] = set()

    def run(self) -> None:
        """Main game entry loop."""
        enable_windows_ansi()
        self._print_splash()

        while True:
            choice = self._main_menu()
            if choice == "1":
                self._play_flow()
            elif choice == "2":
                self._display_stats_screen()
            elif choice == "3":
                self._display_how_to_play()
            elif choice == "4" or choice == "q":
                self._print_goodbye()
                sys.exit(0)

    # ------------------------------------------------------------------------
    # Menu & Screens
    # ------------------------------------------------------------------------

    def _print_splash(self) -> None:
        clear_screen()
        banner = f"""
{Style.BRIGHT_CYAN}  ██████╗ ██████╗ ██████╗ ███████╗   ██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███╗   ███╗ █████╗ ███╗   ██╗
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝   ██║  ██║██╔══██╗████╗  ██║██╔════╝ ████╗ ████║██╔══██╗████╗  ██║
 ██║     ██║   ██║██║  ██║█████╗     ███████║███████║██╔██╗ ██║██║  ███╗██╔████╔██║███████║██╔██╗ ██║
 ██║     ██║   ██║██║  ██║██╔══╝     ██╔══██║██╔══██║██║╚██╗██║██║   ██║██║╚██╔╝██║██╔══██║██║╚██╗██║
 ╚██████╗╚██████╔╝██████╔╝███████╗   ██║  ██║██║  ██║██║ ╚████║╚██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║
  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝{Style.RESET}
        {Style.BOLD}{Style.BRIGHT_WHITE}Guess the Missing Keywords, Types, and Tokens inside Realistic Code{Style.RESET}
        """
        print(banner)
        time.sleep(1.0)

    def _main_menu(self) -> str:
        clear_screen()
        print(f"{Style.BOLD}{Style.BRIGHT_BLUE}======================================================================{Style.RESET}")
        print(f"                       {Style.BOLD}{Style.BRIGHT_CYAN}CODE HANGMAN - MAIN MENU{Style.RESET}")
        print(f"{Style.BOLD}{Style.BRIGHT_BLUE}======================================================================{Style.RESET}\n")
        print(f"  {Style.BRIGHT_GREEN}[1]{Style.RESET} Start New Game")
        print(f"  {Style.BRIGHT_GREEN}[2]{Style.RESET} View Player Statistics")
        print(f"  {Style.BRIGHT_GREEN}[3]{Style.RESET} How to Play & Rules")
        print(f"  {Style.BRIGHT_RED}[4]{Style.RESET} Exit Game\n")
        return input(f"{Style.BOLD}Select an option (1-4): {Style.RESET}").strip().lower()

    def _display_stats_screen(self) -> None:
        clear_screen()
        print(f"{Style.BOLD}{Style.BRIGHT_MAGENTA}======================================================================{Style.RESET}")
        print(f"                    {Style.BOLD}{Style.BRIGHT_WHITE}DEVELOPER SCORECARD & STATS{Style.RESET}")
        print(f"{Style.BOLD}{Style.BRIGHT_MAGENTA}======================================================================{Style.RESET}\n")
        print(f"  Games Completed:  {Style.BOLD}{self.stats.games_played}{Style.RESET}")
        print(f"  Games Won:        {Style.BRIGHT_GREEN}{self.stats.games_won}{Style.RESET}")
        print(f"  Win Rate:         {Style.BRIGHT_CYAN}{self.stats.win_rate:.1f}%{Style.RESET}")
        print(f"  Current Streak:   {Style.BRIGHT_YELLOW}{self.stats.current_streak}{Style.RESET}")
        print(f"  Best Streak:      {Style.BRIGHT_GREEN}{self.stats.best_streak}{Style.RESET}")
        print(f"  Total Guesses:    {Style.WHITE}{self.stats.total_guesses}{Style.RESET}\n")
        input(f"{Style.DIM}Press Enter to return to main menu...{Style.RESET}")

    def _display_how_to_play(self) -> None:
        clear_screen()
        print(f"{Style.BOLD}{Style.BRIGHT_CYAN}======================================================================{Style.RESET}")
        print(f"                        {Style.BOLD}HOW TO PLAY CODE HANGMAN{Style.RESET}")
        print(f"{Style.BOLD}{Style.BRIGHT_CYAN}======================================================================{Style.RESET}\n")
        print("  1. Choose your language (Python, Java, C) or test your versatility in Mixed mode.")
        print("  2. Select your preferred difficulty level (Beginner, Intermediate, Advanced).")
        print("  3. A genuine code snippet will appear with a key token hidden:")
        print(f"     Example: {Style.BRIGHT_YELLOW}[x for x in data if ______]{Style.RESET}")
        print("  4. Guess letter-by-letter or solve the entire keyword in one stroke.")
        print("  5. You start with 6 lives. Each incorrect guess builds the gallows!")
        print("  6. If you run out of lives, the full snippet and an architectural explanation")
        print("     will be presented for learning.\n")
        input(f"{Style.DIM}Press Enter to return to main menu...{Style.RESET}")

    def _print_goodbye(self) -> None:
        print(f"\n{Style.BRIGHT_GREEN}Thanks for hacking with Code Hangman! Happy coding! 🚀{Style.RESET}\n")

    # ------------------------------------------------------------------------
    # Selection Flow
    # ------------------------------------------------------------------------

    def _select_language(self) -> Optional[Language]:
        clear_screen()
        print(f"{Style.BOLD}{Style.BRIGHT_CYAN}--- SELECT TARGET LANGUAGE ---{Style.RESET}\n")
        print("  [1] Python")
        print("  [2] Java")
        print("  [3] C")
        print("  [4] Mixed / Random Languages\n")
        choice = input(f"{Style.BOLD}Choose language (1-4, Default=4): {Style.RESET}").strip()
        if choice in ("1", "p", "python"):
            return Language.PYTHON
        elif choice in ("2", "j", "java"):
            return Language.JAVA
        elif choice in ("3", "c"):
            return Language.C
        return None  # None indicates Random / All

    def _select_difficulty(self) -> Optional[Difficulty]:
        clear_screen()
        print(f"{Style.BOLD}{Style.BRIGHT_YELLOW}--- SELECT DIFFICULTY LEVEL ---{Style.RESET}\n")
        print("  [1] Beginner     (Common keywords, built-ins)")
        print("  [2] Intermediate (Standard idioms, streams, pointers)")
        print("  [3] Advanced     (Low-level memory, descriptors, memory visibility)")
        print("  [4] Any / Random\n")
        choice = input(f"{Style.BOLD}Choose difficulty (1-4, Default=4): {Style.RESET}").strip()
        if choice in ("1", "b", "beg"):
            return Difficulty.BEGINNER
        elif choice in ("2", "i", "int"):
            return Difficulty.INTERMEDIATE
        elif choice in ("3", "a", "adv"):
            return Difficulty.ADVANCED
        return None

    # ------------------------------------------------------------------------
    # Gameplay Loop
    # ------------------------------------------------------------------------

    def _play_flow(self) -> None:
        lang = self._select_language()
        diff = self._select_difficulty()

        snippet = self.database.get_random_snippet(lang, diff, exclude_ids=self.played_snippet_ids)
        if not snippet:
            # Clear historical cache if exhausted
            self.played_snippet_ids.clear()
            snippet = self.database.get_random_snippet(lang, diff)

        if not snippet:
            print(f"\n{Style.RED}No snippet found matching criteria!{Style.RESET}")
            time.sleep(1.5)
            return

        self.played_snippet_ids.add(snippet.id)
        self._play_round(snippet)

    def _play_round(self, snippet: Snippet) -> None:
        """Executes a single interactive game round."""
        target = snippet.target_token
        target_lower = target.lower()

        lives = self.INITIAL_LIVES
        guessed_letters: Set[str] = set()
        user_message = ""
        user_message_color = Style.BRIGHT_WHITE
        round_guesses = 0
        hint_revealed = False

        while True:
            # Check victory: all letters in target have been guessed
            is_won = all(ch.lower() in guessed_letters or not ch.isalpha() for ch in target)
            is_lost = (lives <= 0)

            clear_screen()
            self._render_hud(
                snippet=snippet,
                lives=lives,
                guessed_letters=guessed_letters,
                hint_revealed=hint_revealed,
                user_message=user_message,
                user_message_color=user_message_color,
                is_game_over=(is_won or is_lost)
            )

            if is_won:
                self.stats.record_win(round_guesses)
                self._render_victory(snippet)
                break

            if is_lost:
                self.stats.record_loss(round_guesses)
                self._render_defeat(snippet)
                break

            # Prompt user input
            raw_input = input(f"\n{Style.BOLD}{Style.BRIGHT_CYAN}Guess letter or full token (? for hint, ! to forfeit): {Style.RESET}").strip()
            round_guesses += 1

            if not raw_input:
                user_message = "Please enter a letter or solve attempt."
                user_message_color = Style.YELLOW
                continue

            # Command: Hint
            if raw_input == "?":
                hint_revealed = True
                user_message = f"HINT: {snippet.hint}"
                user_message_color = Style.BRIGHT_YELLOW
                continue

            # Command: Forfeit
            if raw_input == "!":
                lives = 0
                user_message = "Round forfeited."
                user_message_color = Style.RED
                continue

            # Full token solve attempt
            if len(raw_input) > 1:
                attempt = raw_input.strip()
                if attempt.lower() == target_lower:
                    # Reveal all letters
                    for ch in target:
                        guessed_letters.add(ch.lower())
                    user_message = f"Outstanding! Solved token '{target}' directly!"
                    user_message_color = Style.BRIGHT_GREEN
                else:
                    lives -= 1
                    user_message = f"Incorrect full-token solve: '{attempt}' (-1 life)"
                    user_message_color = Style.BRIGHT_RED
                continue

            # Single letter guess
            letter = raw_input.lower()
            if not letter.isalpha():
                user_message = f"Invalid character '{letter}'. Please guess alphabetical letters."
                user_message_color = Style.YELLOW
                continue

            if letter in guessed_letters:
                user_message = f"Letter '{letter.upper()}' has already been guessed."
                user_message_color = Style.BRIGHT_YELLOW
                continue

            guessed_letters.add(letter)
            if letter in target_lower:
                user_message = f"Nice! Letter '{letter.upper()}' is in the token."
                user_message_color = Style.BRIGHT_GREEN
            else:
                lives -= 1
                user_message = f"Miss! Letter '{letter.upper()}' is not in the token. (-1 life)"
                user_message_color = Style.BRIGHT_RED

        self._post_round_prompt()

    # ------------------------------------------------------------------------
    # HUD Rendering
    # ------------------------------------------------------------------------

    def _render_hud(
        self,
        snippet: Snippet,
        lives: int,
        guessed_letters: Set[str],
        hint_revealed: bool,
        user_message: str,
        user_message_color: str,
        is_game_over: bool = False
    ) -> None:
        target = snippet.target_token

        # Construct masked token string
        masked_chars = []
        for ch in target:
            if not ch.isalpha() or ch.lower() in guessed_letters or is_game_over:
                masked_chars.append(f"{Style.BOLD}{Style.BRIGHT_WHITE}{ch}{Style.RESET}")
            else:
                masked_chars.append(f"{Style.BOLD}{Style.BRIGHT_CYAN}_{Style.RESET}")
        masked_token_str = " ".join(masked_chars)

        # Header bar
        lang_color = {
            Language.PYTHON: Style.BRIGHT_BLUE,
            Language.JAVA: Style.BRIGHT_RED,
            Language.C: Style.BRIGHT_MAGENTA,
        }.get(snippet.language, Style.BRIGHT_WHITE)

        print(f"{Style.BOLD}================================================================================")
        print(f" Language: {lang_color}{snippet.language.value.upper()}{Style.RESET} | "
              f"Difficulty: {Style.BRIGHT_YELLOW}{snippet.difficulty.value}{Style.RESET} | "
              f"Token Length: {Style.BOLD}{len(target)}{Style.RESET} chars | "
              f"Streak: {Style.BRIGHT_GREEN}{self.stats.current_streak}{Style.RESET}")
        print(f"================================================================================{Style.RESET}")

        # Top area: Gallows and Keyboard bank side-by-side
        gallows_lines = HangmanVisuals.get_ascii_art(lives).splitlines()

        # Keyboard letter status
        alphabet = "abcdefghijklmnopqrstuvwxyz"
        kb_chunks = [alphabet[0:9], alphabet[9:18], alphabet[18:26]]
        kb_rendered_lines = []
        for chunk in kb_chunks:
            chunk_line = []
            for letter in chunk:
                if letter in guessed_letters:
                    if letter in snippet.target_token.lower():
                        chunk_line.append(f"{Style.BRIGHT_GREEN}{letter.upper()}{Style.RESET}")
                    else:
                        chunk_line.append(f"{Style.BRIGHT_BLACK}{Style.DIM}·{Style.RESET}")
                else:
                    chunk_line.append(f"{Style.WHITE}{letter.upper()}{Style.RESET}")
            kb_rendered_lines.append(" ".join(chunk_line))

        # Hearts/Life bar
        hearts = f"{Style.BRIGHT_RED}{'♥ ' * lives}{Style.RESET}{Style.DIM}{'♡ ' * (self.INITIAL_LIVES - lives)}{Style.RESET}"

        print(f" {gallows_lines[0]}")
        print(f" {gallows_lines[1]}     {Style.BOLD}STATUS & GUESSES:{Style.RESET}")
        print(f" {gallows_lines[2]}     Lives: {hearts} ({lives}/{self.INITIAL_LIVES})")
        print(f" {gallows_lines[3]}     Keyboard Bank:")
        print(f" {gallows_lines[4]}       {kb_rendered_lines[0]}")
        print(f" {gallows_lines[5]}       {kb_rendered_lines[1]}")
        print(f" {gallows_lines[6]}       {kb_rendered_lines[2]}")

        # Code block header
        print(f"\n{Style.BOLD}{Style.BRIGHT_WHITE}--- TARGET CODE SNIPPET --------------------------------------------------------{Style.RESET}")

        # Render snippet with masked token
        placeholder_token = f"[{masked_token_str}]"
        rendered_code = snippet.get_rendered_code(placeholder_token)

        for line_no, line in enumerate(rendered_code.splitlines(), start=1):
            prefix = f"{Style.DIM}{line_no:2d} │ {Style.RESET}"
            print(f"  {prefix}{line}")

        print(f"{Style.BOLD}{Style.BRIGHT_WHITE}--------------------------------------------------------------------------------{Style.RESET}")

        if hint_revealed:
            print(f"{Style.BRIGHT_YELLOW}💡 Hint: {snippet.hint}{Style.RESET}")

        if user_message:
            print(f"\n{user_message_color}➜ {user_message}{Style.RESET}")

    # ------------------------------------------------------------------------
    # Round Outcome
    # ------------------------------------------------------------------------

    def _render_victory(self, snippet: Snippet) -> None:
        print(f"\n{Style.BG_GREEN}{Style.BOLD}{Style.BLACK} ✔ CODE COMPILED SUCCESSFULLY! TOKEN IDENTIFIED: {snippet.target_token.upper()} {Style.RESET}")
        print(f"\n{Style.BOLD}{Style.BRIGHT_CYAN}Architectural Explanation:{Style.RESET}")
        print(f"  {snippet.explanation}\n")

    def _render_defeat(self, snippet: Snippet) -> None:
        print(f"\n{Style.BG_RED}{Style.BOLD}{Style.WHITE} ✖ COMPILATION ERROR! RUNTIME PANIC! {Style.RESET}")
        print(f"  Missing Token: {Style.BOLD}{Style.BRIGHT_YELLOW}{snippet.target_token}{Style.RESET}\n")

        # Show full completed code
        completed_code = snippet.get_rendered_code(
            f"{Style.BOLD}{Style.BRIGHT_GREEN}{snippet.target_token}{Style.RESET}"
        )
        print(f"{Style.BOLD}Expected Code Solution:{Style.RESET}")
        for line_no, line in enumerate(completed_code.splitlines(), start=1):
            print(f"  {Style.DIM}{line_no:2d} │ {Style.RESET}{line}")

        print(f"\n{Style.BOLD}{Style.BRIGHT_CYAN}Token Documentation:{Style.RESET}")
        print(f"  {snippet.explanation}\n")

    def _post_round_prompt(self) -> None:
        choice = input(f"{Style.BOLD}Play another round? ([Y]es / [N]o to return to menu): {Style.RESET}").strip().lower()
        if choice in ("y", "yes", ""):
            self._play_flow()


# ============================================================================
# Main Entry Point
# ============================================================================

def main() -> None:
    try:
        db = SnippetDatabase()
        engine = GameEngine(database=db)
        engine.run()
    except KeyboardInterrupt:
        print(f"\n\n{Style.BRIGHT_YELLOW}Session interrupted. Goodbye!{Style.RESET}\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
