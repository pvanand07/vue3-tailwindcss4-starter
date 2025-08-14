import type { Reference } from '../types/chat'

/**
 * Utility class for parsing and handling references in LLM messages
 */
export class ReferenceParser {
  private static readonly buildingCodes = 'CRZ|KMMBL|KMBR|KPBR|BMPB'

  // Updated pattern to use a non-capturing group for the building code
  private static readonly pattern = new RegExp(
    `((?:\\[[^\\]]+\\])+)\\[(?:${ReferenceParser.buildingCodes})\\]`,
    'gi'
  )

  /**
   * Parse references from a text string
   * @param text The text to parse references from
   * @returns Array of parsed references
   */
  static parseReferences(text: string): Reference[] {
    const matches: Reference[] = []
    let match: RegExpExecArray | null

    // Reset the regex lastIndex to ensure proper matching
    this.pattern.lastIndex = 0

    while ((match = this.pattern.exec(text)) !== null) {
      const [originalText, contentBlocks] = match
      const buildingCodeMatch = originalText.match(/\[([A-Z]+)\]$/)
      const buildingCode = buildingCodeMatch ? buildingCodeMatch[1] : ''
      
      const individualItems = contentBlocks.match(/\[([^\]]+)\]/g) || []

      if (individualItems.length > 0) {
        let currentPos = match.index
        individualItems.forEach((itemText) => {
          const itemContent = itemText.slice(1, -1)
          matches.push({
            id_block: itemContent.trim(),
            building_code: buildingCode,
            start: currentPos,
            end: currentPos + itemText.length,
            original_text: itemText
          })
          currentPos += itemText.length
        })
      }
    }

    return matches
  }

  /**
   * Replace references in text with clickable spans
   * @param text The original text
   * @returns HTML string with clickable references
   */
  static makeReferencesClickable(text: string): string {
    const fullMatches = text.match(this.pattern) || []
    if (fullMatches.length === 0) return text
    
    let processedText = text
    
    fullMatches.forEach(fullMatch => {
      const parsedRefs = this.parseReferences(fullMatch)
      if (parsedRefs.length > 0) {
        const buildingCode = parsedRefs[0].building_code
        let replacementHtml = ''
        parsedRefs.forEach((ref, index) => {
          replacementHtml += `<span
            class="reference-link cursor-pointer inline-flex items-center justify-center px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-700 text-xs font-medium transition-colors duration-150"
            data-reference-index="${index}"
            data-id-block="${ref.id_block}"
            data-building-code="${buildingCode}"
            title="${ref.id_block}"
          >
            ${ref.id_block}
          </span>`
        })
        processedText = processedText.replace(fullMatch, replacementHtml)
      }
    })
    
    return processedText
  }

  /**
   * Extract reference data from a clicked element
   * @param element The clicked DOM element
   * @returns Reference object or null if invalid
   */
  static extractReferenceFromElement(element: HTMLElement): Reference | null {
    const idBlock = element.getAttribute('data-id-block')
    const buildingCode = element.getAttribute('data-building-code')
    
    if (!idBlock || !buildingCode) {
      return null
    }

    return {
      id_block: idBlock,
      building_code: buildingCode,
      start: 0,
      end: 0,
      original_text: element.textContent || ''
    }
  }
}
