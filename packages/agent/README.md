# Auto-Healing Agent

An intelligent agent that monitors your Lovable Offline projects and automatically fixes compilation and runtime errors using AI.

## Features

- **Automatic Error Detection**: Monitors server logs for compilation errors, runtime errors, and Prisma issues
- **AI-Powered Fixes**: Uses Qwen (or any Ollama model) to suggest and apply fixes
- **Smart Retry Logic**: Avoids infinite loops by tracking error signatures and limiting retries
- **Non-Invasive**: Only acts when errors are detected; stops when the system is healthy

## Installation

```bash
cd packages/agent
npm install
npm run build
```

## Usage

### As a CLI Tool

Start the auto-healing agent for a specific project:

```bash
node packages/agent/dist/index.js <project-name>
```

Example:
```bash
node packages/agent/dist/index.js fintech-api
```

### Programmatic Usage

```typescript
import { AutoHealingAgent } from '@lovable/agent';

const agent = new AutoHealingAgent({
  model: 'qwen2.5-coder:7b',  // Optional: Ollama model to use
  maxRetries: 3,               // Optional: Max retries per error
  apiBaseUrl: 'http://localhost:3001'  // Optional: Webapp API URL
});

// Start healing loop
await agent.heal('my-project', {
  checkInterval: 5000,  // Check every 5 seconds
  verbose: true         // Enable logging
});
```

## How It Works

1. **Monitor**: Polls `/api/status` every 5 seconds to fetch server logs
2. **Detect**: Parses logs for error patterns (compilation errors, type errors, Prisma issues, etc.)
3. **Analyze**: Sends the error to Qwen AI to get a fix suggestion
4. **Apply**: Calls `/api/edit` with the suggested fix
5. **Verify**: Waits for recompilation and checks if the error is resolved
6. **Repeat**: Continues until no errors are found or max retries reached

## Error Types Detected

- **Compilation Errors**: TypeScript errors, syntax errors, missing imports
- **Runtime Errors**: TypeError, ReferenceError, etc.
- **Prisma Errors**: Schema validation, client initialization errors
- **Module Errors**: Missing dependencies, module not found

## Configuration

### Environment Variables

- `OLLAMA_HOST`: Ollama server URL (default: `http://127.0.0.1:11434`)

### Options

```typescript
{
  model: string;        // Ollama model name (default: 'qwen2.5-coder:7b')
  maxRetries: number;   // Max retry attempts per error (default: 3)
  apiBaseUrl: string;   // Webapp API base URL (default: 'http://localhost:3001')
}
```

## Example Workflow

1. Generate a new project with the planner
2. Start the dev server via `/api/run`
3. Start the auto-healing agent:
   ```bash
   node packages/agent/dist/index.js my-project
   ```
4. The agent will:
   - Detect any compilation errors
   - Ask Qwen for a fix
   - Apply the fix automatically
   - Verify the fix worked
   - Continue monitoring

## Stopping the Agent

The agent will automatically stop when:
- The dev server stops running
- A different project starts running
- Max retries are reached for a persistent error
- You manually terminate it (Ctrl+C)

## Limitations

- Requires Ollama to be running locally
- Works best with common, well-documented errors
- May not fix complex architectural issues
- Limited to 3 retry attempts per unique error

## Future Enhancements

- [ ] Support for multiple projects simultaneously
- [ ] Web UI for monitoring healing sessions
- [ ] Learning from past fixes to improve suggestions
- [ ] Integration with git for automatic commits of fixes
- [ ] Support for custom error patterns and fix strategies
