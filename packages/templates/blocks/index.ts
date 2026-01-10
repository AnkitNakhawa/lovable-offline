import { generateTableCRUD } from "./tableCrud"

export async function generateBlock(
  block: any,
  ctx: GeneratorContext
): Promise<string> {
  switch (block.type) {
    case "TableCRUD":
      return generateTableCRUD(block, ctx)
    default:
      throw new Error(`Unknown block type: ${block.type}`)
  }
}
