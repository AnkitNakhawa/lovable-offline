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

export type BlockSpec = TableCRUDBlock | HeroBlock | FeaturesBlock | NavbarBlock | FooterBlock | PricingBlock

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

export type NavbarBlock = {
  type: "Navbar"
  logo: string
  links: { label: string, href: string }[]
}

export type FooterBlock = {
  type: "Footer"
  copyright: string
  links: { label: string, href: string }[]
}

export type PricingBlock = {
  type: "Pricing"
  title: string
  plans: { name: string, price: string, features: string[], ctaText: string }[]
}