#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { compileApp, AppSpec } from '@lovable/engine';

const program = new Command();

program
    .name('lovable-offline')
    .description('Offline Lovable-like App Compiler')
    .version('0.0.1');

program
    .command('create')
    .description('Create a new app from a spec file')
    .argument('<spec>', 'Path to the app spec JSON file')
    .argument('<out>', 'Output directory')
    .action(async (specPath, outDir) => {
        try {
            console.log(`Reading spec from ${specPath}...`);
            const specContent = await fs.readFile(specPath, 'utf-8');
            const spec = JSON.parse(specContent) as AppSpec;

            console.log(`Compiling app "${spec.name}" to ${outDir}...`);

            // Ensure absolute path for outDir
            const absoluteOutDir = path.resolve(process.cwd(), outDir);

            await compileApp(spec, absoluteOutDir);

            console.log('Done!');
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program
    .command('magic')
    .description('Generate a new app from a natural language prompt')
    .argument('<prompt>', 'Natural language description of the app')
    .argument('<out>', 'Output directory')
    .action(async (prompt, outDir) => {
        try {
            console.log(`Thinking about "${prompt}"...`);

            // Dynamic import to avoid load issues if planner isn't built yet during dev
            const { generateAppSpec } = await import('@lovable/planner');

            const spec = await generateAppSpec(prompt);
            console.log(`Generated spec for "${spec.name}"!`);

            const absoluteOutDir = path.resolve(process.cwd(), outDir);
            console.log(`Compiling app to ${absoluteOutDir}...`);
            await compileApp(spec, absoluteOutDir);

            console.log('Done! Your app is ready.');
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program
    .command('edit')
    .description('Update the current app based on a prompt')
    .argument('<prompt>', 'Description of changes')
    .action(async (prompt) => {
        try {
            const cwd = process.cwd();
            const specPath = path.join(cwd, 'lovable.json');

            // 1. Check for valid project
            try {
                await fs.access(specPath);
            } catch {
                console.error('Error: No lovable.json found. Please run this command inside a lovable project.');
                process.exit(1);
            }

            console.log(`Reading current state...`);
            const specContent = await fs.readFile(specPath, 'utf-8');
            const currentSpec = JSON.parse(specContent) as AppSpec;

            console.log(`Thinking about changes: "${prompt}"...`);

            // 2. Planner Update
            const { updateAppSpec } = await import('@lovable/planner');
            const newSpec = await updateAppSpec(currentSpec, prompt);

            console.log(`Applying changes to "${newSpec.name}"...`);

            // 3. Re-compile (Incremental-ish)
            await compileApp(newSpec, cwd);

            console.log('Done! Changes applied.');
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program.parse();
