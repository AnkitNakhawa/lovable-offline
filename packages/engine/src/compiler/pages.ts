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
    const blockCode = await Promise.all(
      page.blocks.map(block =>
        generateBlock(block, models, outDir)
      )
    )

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
        blocks: blockCode.join("\n")
      })
    )
  }
}
