export type AppSpec = {
  name: string
  stack: "nextjs"
  models: ModelSpec[]
  pages: PageSpec[]
}

export type ModelSpec = {
  name: string
  fields: FieldSpec[]
}

export type FieldSpec = {
    name: string
    type: "string" | "number" | "boolean"
}

export type PageSpec = {
  route: string
  title: string
  blocks: BlockSpec[]
}

export type BlockSpec = TableCRUDBlock

export type TableCRUDBlock = {
  type: "TableCRUD"
  model: string
}