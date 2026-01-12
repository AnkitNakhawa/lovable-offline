# Offline Lovable Compiler

**Build web apps from natural language, fully offline, using Small Language Models (SLMs).**

This project is an open-source initiative to build a tool similar to [Lovable.dev](https://lovable.dev) or [v0.dev](https://v0.dev), but designed to run locally on your machine without relying on cloud APIs.

> ⚠️ **Status: Phase 1 (Deterministic Compiler)**
> Currently, the "AI" part is not yet integrated. We are building the **compiler core** first. This tool currently takes a structured JSON spec and generates a working Next.js application.

## 🚀 Vision via Phases

*   **Phase 1: Deterministic Compiler (Current)**
    *   Input: structured `AppSpec` JSON.
    *   Output: Full Next.js + Prisma + Tailwind app.
    *   Goal: Pure, reliable code generation without hallucinations.
*   **Phase 2: The Planner (SLM)**
    *   Input: "Build me a Todo app"
    *   Output: `AppSpec` JSON (via local models like Qwen2.5-Coder or DeepSeek-Coder).
*   **Phase 3: Iterative Development**
    *   Support for "Make the buttons blue" type edits.

## 🛠️ How it Works

The system follows a strict **Compiler-First** architecture:
1.  **Planner** (Future): Translates user prompts into a rigid `AppSpec` JSON.
2.  **Compiler** (Functional): deterministically converts `AppSpec` into files.
    *   Scaffolds Next.js project.
    *   Generates Prisma schema.
    *   Generates UI components (e.g., Tables, Forms) from templates.
    *   Writes Server Actions for data access.

## 📦 Getting Started

### Prerequisites
*   Node.js 18+
*   npm

### Installation

Clone the repo and build the packages:

```bash
git clone https://github.com/AnkitNakhawa/lovable-offline.git
cd lovable-offline
npm install
npm run build
```

### Usage (Phase 1)
Since there is no AI planner yet, you must provide the JSON spec manually.

1.  **Create a Spec File** (`spec.json`):
    ```json
    {
      "name": "my-todo-app",
      "stack": "nextjs",
      "models": [
        {
          "name": "Todo",
          "fields": [
            { "name": "title", "type": "string" },
            { "name": "completed", "type": "boolean" }
          ]
        }
      ],
      "pages": [
        {
          "route": "/",
          "title": "My Todos",
          "blocks": [
            { "type": "TableCRUD", "model": "Todo" }
          ]
        }
      ]
    }
    ```

2.  **Run the Compiler**:
    ```bash
    node packages/cli/dist/index.js create spec.json ./my-todo-app
    ```

3.  **Run the Generated App**:
    ```bash
    cd my-todo-app
    npm install
    npx prisma db push
    npm run dev
    ```

    Open http://localhost:3000 to see your fully functional CRUD app with SQLite database!

## 🧩 Project Structure

*   `packages/engine`: The core compiler logic (Generators, Renderers).
*   `packages/cli`: The command-line interface.
*   `packages/templates`: Handlebars templates for code generation.

## 📄 License
MIT
