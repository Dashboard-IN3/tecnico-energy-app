export function slugify(text?: string): string {
  return text
    ?.toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}
