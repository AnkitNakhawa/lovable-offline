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

program.parse();
