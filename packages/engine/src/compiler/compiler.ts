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

  // If no theme selected or found, default to first one or a fallback?
  // Using modern as default if nothing found
  if (!themeData) {
    const themesPath = path.resolve(__dirname, '../../../templates/themes.json');
    if (fs.existsSync(themesPath)) {
      const themes = await fs.readJSON(themesPath);
      themeData = themes.themes[0];
    }
  }

  await generateBaseProject(spec.name, outDir, themeData)
  await generatePrisma(spec.models, outDir)
  await generatePages(spec.pages, spec.models, outDir)

  // Save spec for future edits (after IDs are generated)
  await fs.writeJSON(path.join(outDir, 'lovable.json'), spec, { spaces: 2 });
}
