import { AppSpec } from "../spec/appSpec"
import { generateBaseProject } from "./baseProject"
import { generatePrisma } from "./prisma"
import { generatePages } from "./pages"
import * as fs from 'fs-extra';
import * as path from 'path';

export async function compileApp(
  spec: AppSpec,
  outDir: string
) {
  // Load theme
  let themeData = null;
  if (spec.theme) {
    const themesPath = path.resolve(__dirname, '../../../templates/themes.json');
    if (fs.existsSync(themesPath)) {
      const themes = await fs.readJSON(themesPath);
      themeData = themes.themes.find((t: any) => t.id === spec.theme);
    }
  }

  // If no theme selected or found, default to first one or a fallback
  if (!themeData) {
    const themesPath = path.resolve(__dirname, '../../../templates/themes.json');
    if (fs.existsSync(themesPath)) {
      const themes = await fs.readJSON(themesPath);
      themeData = themes.themes[0];
    } else {
      // Hardcoded fallback if themes.json doesn't exist
      themeData = {
        id: 'modern',
        name: 'Modern Clean',
        colors: {
          primary: '#3b82f6',
          'primary-foreground': '#ffffff',
          secondary: '#f1f5f9',
          'secondary-foreground': '#0f172a',
          background: '#ffffff',
          foreground: '#0f172a',
          muted: '#f8fafc',
          'muted-foreground': '#64748b',
          border: '#e2e8f0'
        },
        radius: '0.5rem',
        font: 'Inter'
      };
    }
  }

  await generateBaseProject(spec.name, outDir, themeData)
  await generatePrisma(spec.models, outDir)
  await generatePages(spec.pages, spec.models, outDir)

  // Save spec for future edits (after IDs are generated)
  await fs.writeJSON(path.join(outDir, 'lovable.json'), spec, { spaces: 2 });
}
