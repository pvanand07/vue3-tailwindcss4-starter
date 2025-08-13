import { ReferenceParser } from './references'

/**
 * Markdown-it plugin for parsing and rendering references
 */
export function markdownReferencePlugin(md: any) {
  // Override text renderer to handle references
  md.renderer.rules.text = function (tokens: any[], idx: number) {
    const token = tokens[idx]
    const content = token.content

    // Use the updated makeReferencesClickable method
    return ReferenceParser.makeReferencesClickable(content)
  }
}
