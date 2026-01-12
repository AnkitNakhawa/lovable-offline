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

export type BlockSpec = TableCRUDBlock | HeroBlock | FeaturesBlock

export type TableCRUDBlock = {
  type: "TableCRUD"
  model: string
}

export type HeroBlock = {
  type: "Hero"
  headline: string
  subheadline: string
  ctaText: string
}

export type FeaturesBlock = {
  type: "Features"
  title: string
  features: { title: string, description: string }[]
}