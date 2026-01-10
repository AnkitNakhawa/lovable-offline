import { AppSpec } from "../spec/appSpec"
import { generateBaseProject } from "./baseProject"
import { generatePrisma } from "./prisma"
import { generatePages } from "./pages"

export async function compileApp(
  spec: AppSpec,
  outDir: string
) {
  await generateBaseProject(spec.name, outDir)
  await generatePrisma(spec.models, outDir)
  await generatePages(spec.pages, spec.models, outDir)
}
