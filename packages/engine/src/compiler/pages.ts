import path from "path"
import fs from "fs-extra"
import { renderTemplate } from "./render"
import { PageSpec, ModelSpec } from "../spec/appSpec"
import { generateBlock } from "./blocks"

export async function generatePages(
  pages: PageSpec[],
  models: ModelSpec[],
  outDir: string
) {
  for (const page of pages) {
    const blockResults = await Promise.all(
      page.blocks.map(block =>
        generateBlock(block, models, outDir)
      )
    )

    const uniqueImports = Array.from(new Set(blockResults.flatMap(b => b.imports)));
    const blockCode = blockResults.map(b => b.code).join("\n");

    const pagePath = path.join(
      outDir,
      "app",
      page.route === "/" ? "" : page.route,
      "page.tsx"
    )

    await fs.outputFile(
      pagePath,
      renderTemplate("page.tsx.hbs", {
        title: page.title,
        blocks: blockCode,
        imports: uniqueImports
      })
    )
  }
}
