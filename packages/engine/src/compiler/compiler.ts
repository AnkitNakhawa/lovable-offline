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
  await generateBaseProject(spec.name, outDir)
  await generatePrisma(spec.models, outDir)
  await generatePages(spec.pages, spec.models, outDir)

  // Save spec for future edits (after IDs are generated)
  await fs.writeJSON(path.join(outDir, 'lovable.json'), spec, { spaces: 2 });
}
