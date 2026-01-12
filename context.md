# context.md

## Offline Lovable-like App Compiler (Open Source)

This document is the **single source of truth** for the project.\
Anyone joining the repo should read this before touching code.

------------------------------------------------------------------------

## 1. Project Goal

Build an **offline, open-source Lovable-like system** that: - Converts
natural language → structured app intent - Compiles intent → a runnable
web app - Supports safe iterative changes - Runs fully offline using
**small local language models (SLMs)**

**Core philosophy:**\
\> This is a **compiler**, not an agent.

The system owns correctness. Models only propose structure.

------------------------------------------------------------------------

## 2. Non-Goals (Very Important)

This project intentionally does **NOT** aim to: - Be a drag-and-drop
website builder - Support arbitrary existing repos - Let LLMs write
files directly - Compete with Lovable feature-for-feature - Provide
one-click cloud deployment (v1)

Keeping scope tight is required for correctness and OSS maintainability.

------------------------------------------------------------------------

## 3. Architectural Overview

High-level loop:

    User Prompt
       ↓
    Planner (SLM)
       ↓
    Structured Intent (AppSpec / ChangePlan)
       ↓
    Validator
       ↓
    Compiler (Deterministic)
       ↓
    File System
       ↓
    Verifier (build / typecheck)
       ↓
    Feedback

**Critical invariant:**\
The model **never** touches the filesystem.

------------------------------------------------------------------------

## 4. Phased Development Plan

### Phase 1 --- Deterministic Compiler (NO AI)

-   AppSpec → Next.js app
-   Templates + programmatic generators
-   One block type (TableCRUD)
-   Full regeneration, no diffs

### Phase 2 --- Planner (SLM)

-   Prompt → AppSpec
-   Strict JSON schema
-   No edits yet

### Phase 3 --- Iterative Edits

-   Prompt → ChangePlan
-   Spec-level diffs
-   Incremental regeneration
-   Ownership map enforcement

### Phase 4 --- Repair Loop

-   Build errors → structured feedback
-   Bounded auto-repair via ChangePlan

------------------------------------------------------------------------

## 5. Core Design Principles

### 5.1 Compiler-First

The system must still work if all AI code is deleted.

### 5.2 Spec-First

`AppSpec` is the **single source of truth**. Files are derived
artifacts.

### 5.3 Deterministic Codegen

Same input spec → same output files.

### 5.4 Templates vs Generators

-   Templates = syntax
-   Generators = logic
-   Never mix responsibilities

------------------------------------------------------------------------

## 6. Base Tech Stack (Locked)

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   Prisma + SQLite
-   pnpm
-   Node 18+

No framework flexibility in v0.

------------------------------------------------------------------------

## 7. Repository Structure

    lovable-offline/
      packages/
        engine/
          src/
            spec/
            compiler/
            generators/
            blocks/
            verify/
        cli/
      templates/
        base/
        blocks/
      examples/
      docs/

------------------------------------------------------------------------

## 8. AppSpec (v0)

AppSpec is an **intermediate representation** for apps.

Minimal example:

``` json
{
  "name": "todo-app",
  "stack": "nextjs",
  "models": [
    {
      "name": "Todo",
      "fields": [
        { "name": "title", "type": "string" },
        { "name": "done", "type": "boolean" }
      ]
    }
  ],
  "pages": [
    {
      "route": "/",
      "title": "Todos",
      "blocks": [
        { "type": "TableCRUD", "model": "Todo" }
      ]
    }
  ]
}
```

------------------------------------------------------------------------

## 9. Compiler Responsibilities (Phase 1)

The compiler must: 1. Validate AppSpec 2. Generate base project 3.
Generate Prisma schema 4. Generate pages 5. Generate block components 6.
Write files with ownership headers

It must **not**: - Use AI - Perform edits - Make architectural decisions

------------------------------------------------------------------------

## 10. Templates vs Generators

### Templates

-   Handlebars (.hbs)
-   JSX / TS syntax only
-   Simple loops and conditionals
-   No business logic

### Generators

-   TypeScript
-   Decide which files to generate
-   Compute IR
-   Enforce invariants
-   Call templates

Rule: \> If you have to think, it goes in the generator.

------------------------------------------------------------------------

## 11. Block System

Blocks are composable primitives.

v0 supports: - TableCRUD

Future blocks: - Form - DetailView - DashboardCards - AuthGate

------------------------------------------------------------------------

## 12. Ownership System

Every generated file starts with:

``` ts
// GENERATED FILE - DO NOT EDIT
```

Files are categorized as: - Generated - User-owned - Mixed (AST-managed)

------------------------------------------------------------------------

## 13. Verification

Compiler output must pass: - `pnpm install` - `pnpm dev` - `pnpm build`

------------------------------------------------------------------------

## 14. Offline Model Strategy (Future Phases)

Recommended defaults: - Qwen2.5-Coder 7B - DeepSeek-Coder 6.7B

Models generate **structure**, not code.

------------------------------------------------------------------------

## 15. Development Rules

-   No AI in Phase 1
-   One block at a time
-   Determinism \> cleverness
-   Prefer boring code

------------------------------------------------------------------------

## 16. Mental Model

> This project is a **compiler for apps**,\
> not a chatbot that writes code.

------------------------------------------------------------------------

## 17. Current Status

Phase: **Phase 1 --- Compiler without AI**

Next milestones: 1. Finish TableCRUD block 2. Incremental regeneration
3. Ownership map 4. Planner integration

------------------------------------------------------------------------

End of context.
