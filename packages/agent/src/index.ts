import { Ollama } from 'ollama';

export interface ErrorLog {
    timestamp: number;
    message: string;
    type: 'compilation' | 'runtime' | 'prisma' | 'unknown';
}

export interface FixAttempt {
    error: string;
    suggestedFix: string;
    timestamp: number;
}

export class AutoHealingAgent {
    private ollama: Ollama;
    private model: string;
    private maxRetries: number;
    private apiBaseUrl: string;

    constructor(options: {
        model?: string;
        maxRetries?: number;
        apiBaseUrl?: string;
    } = {}) {
        this.ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
        this.model = options.model || 'qwen2.5-coder:7b';
        this.maxRetries = options.maxRetries || 3;
        this.apiBaseUrl = options.apiBaseUrl || 'http://localhost:3001';
    }

    /**
     * Update healing status on the server
     */
    private async updateStatus(status: 'idle' | 'detecting' | 'analyzing' | 'fixing' | 'verifying', error?: string, fix?: string): Promise<void> {
        try {
            await fetch(`${this.apiBaseUrl}/api/healing-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    active: status !== 'idle',
                    status,
                    error: error || null,
                    fix: fix || null
                })
            });
        } catch (e) {
            // Silently fail - status updates are not critical
        }
    }

    /**
     * Fetch current server logs from the webapp API
     */
    async fetchLogs(): Promise<{ logs: string[]; running: boolean; project: string }> {
        const response = await fetch(`${this.apiBaseUrl}/api/status`);
        if (!response.ok) {
            throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }
        return response.json() as Promise<{ logs: string[]; running: boolean; project: string }>;
    }

    /**
     * Parse logs to extract errors
     */
    parseErrors(logs: string[]): ErrorLog[] {
        const errors: ErrorLog[] = [];
        const errorPatterns = [
            { regex: /Error:/i, type: 'compilation' as const },
            { regex: /Failed to compile/i, type: 'compilation' as const },
            { regex: /PrismaClient/i, type: 'prisma' as const },
            { regex: /TypeError:/i, type: 'runtime' as const },
            { regex: /SyntaxError:/i, type: 'compilation' as const },
            { regex: /Module not found/i, type: 'compilation' as const },
        ];

        logs.forEach((log, index) => {
            for (const pattern of errorPatterns) {
                if (pattern.regex.test(log)) {
                    errors.push({
                        timestamp: Date.now(),
                        message: log,
                        type: pattern.type,
                    });
                    break;
                }
            }
        });

        return errors;
    }

    /**
     * Ask Qwen to suggest a fix for the error
     */
    async suggestFix(error: ErrorLog, projectContext?: string): Promise<string> {
        const prompt = `You are a code debugging expert. A Next.js project has the following error:

ERROR TYPE: ${error.type}
ERROR MESSAGE:
${error.message}

${projectContext ? `PROJECT CONTEXT:\n${projectContext}\n` : ''}

Please provide a specific fix or change request that can be sent to the code generation API.
Your response should be a clear, actionable instruction like:
- "Fix the missing import for X in file Y"
- "Update the Prisma schema to remove duplicate id field"
- "Add missing dependency X to package.json"

Keep it concise and specific. Do NOT include code, just the instruction.`;

        const response = await this.ollama.chat({
            model: this.model,
            messages: [
                { role: 'user', content: prompt }
            ],
            stream: false
        });

        return response.message.content.trim();
    }

    /**
     * Apply the fix by calling the edit API
     */
    async applyFix(projectName: string, fixInstruction: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName,
                    prompt: fixInstruction
                })
            });

            const result = await response.json() as { success?: boolean };
            return result.success === true;
        } catch (error) {
            console.error('Failed to apply fix:', error);
            return false;
        }
    }

    /**
     * Main healing loop
     */
    async heal(projectName: string, options: {
        checkInterval?: number;
        verbose?: boolean;
    } = {}): Promise<void> {
        const checkInterval = options.checkInterval || 5000; // 5 seconds
        const verbose = options.verbose ?? true;

        let retryCount = 0;
        let lastErrorSignature = '';

        const log = (message: string) => {
            if (verbose) console.log(`[AutoHealer] ${message}`);
        };

        log(`Starting auto-healing for project: ${projectName}`);

        while (retryCount < this.maxRetries) {
            try {
                // Wait before checking
                await new Promise(resolve => setTimeout(resolve, checkInterval));

                // Fetch logs
                const status = await this.fetchLogs();

                if (!status.running) {
                    log('Server not running. Stopping heal loop.');
                    break;
                }

                if (status.project !== projectName) {
                    log(`Different project running (${status.project}). Stopping heal loop.`);
                    break;
                }

                // Parse errors
                await this.updateStatus('detecting');
                const errors = this.parseErrors(status.logs);

                if (errors.length === 0) {
                    log('No errors detected. System healthy!');
                    await this.updateStatus('idle');
                    retryCount = 0; // Reset retry count on success
                    lastErrorSignature = '';
                    continue;
                }

                // Take the most recent error
                const latestError = errors[errors.length - 1];
                const errorSignature = `${latestError.type}:${latestError.message.substring(0, 100)}`;

                // Check if it's the same error we just tried to fix
                if (errorSignature === lastErrorSignature) {
                    retryCount++;
                    log(`Same error detected (retry ${retryCount}/${this.maxRetries})`);

                    if (retryCount >= this.maxRetries) {
                        log('Max retries reached. Stopping heal loop.');
                        break;
                    }
                } else {
                    retryCount = 0;
                    lastErrorSignature = errorSignature;
                }

                log(`Error detected: ${latestError.type} - ${latestError.message.substring(0, 100)}...`);

                // Suggest fix
                log('Asking AI for fix suggestion...');
                await this.updateStatus('analyzing', latestError.message.substring(0, 200));
                const fixInstruction = await this.suggestFix(latestError);
                log(`AI suggests: ${fixInstruction}`);

                // Apply fix
                log('Applying fix...');
                await this.updateStatus('fixing', latestError.message.substring(0, 200), fixInstruction);
                const success = await this.applyFix(projectName, fixInstruction);

                if (success) {
                    log('Fix applied successfully. Waiting for recompilation...');
                    await this.updateStatus('verifying', latestError.message.substring(0, 200), fixInstruction);
                } else {
                    log('Failed to apply fix.');
                    await this.updateStatus('idle');
                    retryCount++;
                }

            } catch (error) {
                log(`Error in heal loop: ${error}`);
                retryCount++;
            }
        }

        log('Auto-healing session ended.');
        await this.updateStatus('idle');
    }
}

// CLI usage
if (require.main === module) {
    const projectName = process.argv[2];

    if (!projectName) {
        console.error('Usage: node dist/index.js <project-name>');
        process.exit(1);
    }

    const agent = new AutoHealingAgent();
    agent.heal(projectName, { verbose: true }).catch(console.error);
}
