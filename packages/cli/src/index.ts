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

program.parse();
