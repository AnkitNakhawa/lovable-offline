import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';

export async function generateBaseProject(name: string, outDir: string) {
    //set template directory
    const templatesDir = path.resolve(__dirname, '../../../templates/base');

    // ensure output dir
    await fs.mkdir(outDir, { recursive: true });

    await copyRecursive(templatesDir, outDir, { name, appName: name });
}

async function copyRecursive(src: string, dest: string, context: any) {
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src);
        for (const entry of entries) {
            await copyRecursive(path.join(src, entry), path.join(dest, entry), context);
        }
    } else {
        if (src.endsWith('.hbs')) {
            const content = await fs.readFile(src, 'utf-8');
            const template = Handlebars.compile(content);
            const result = template(context);
            // Remove .hbs extension
            const destPath = dest.replace(/\.hbs$/, '');

            // add ownership header
            if (destPath.endsWith('.css')) {
                const header = "/* GENERATED FILE - DO NOT EDIT */\n";
                await fs.writeFile(destPath, header + result);
            } else if (destPath.endsWith('.ts') || destPath.endsWith('.tsx') || destPath.endsWith('.js')) {
                const header = "// GENERATED FILE - DO NOT EDIT\n";
                await fs.writeFile(destPath, header + result);
            } else {
                await fs.writeFile(destPath, result);
            }
        } else {
            await fs.copyFile(src, dest);
        }
    }
}
