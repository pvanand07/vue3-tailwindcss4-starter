/**
 * Content parser utility for parsing message content
 * Handles parsing of question and option tags from text
 */

export interface ParsedQuestionOptions {
  questionsOnly: string[]
  questionsWithOptions: Array<{
    question: string
    options: string[]
  }>
  optionsOnly: string[]
}

/**
 * Parses text containing <question> and <option> tags
 * Returns categorized questions and options
 */
export function parseQuestionOptions(text: string): ParsedQuestionOptions {
  const result: ParsedQuestionOptions = {
    questionsOnly: [],
    questionsWithOptions: [],
    optionsOnly: []
  }

  // Remove extra whitespace and normalize
  text = text.trim()

  // Pattern to match question blocks with options
  const questionWithOptionsRegex = /<question>(.*?)<\/question>\s*((?:<option>.*?<\/option>\s*)+)<question\s*\/>/gs
  
  // Pattern to match standalone questions
  const questionOnlyRegex = /<question>(.*?)<\/question>/g
  
  // Pattern to match standalone options
  const optionRegex = /<option>(.*?)<\/option>/g

  // Track processed indices to avoid double-counting
  const processedRanges: Array<{ start: number; end: number }> = []

  // 1. First, find questions with options
  let match: RegExpExecArray | null
  while ((match = questionWithOptionsRegex.exec(text)) !== null) {
    const question = match[1].trim()
    const optionsBlock = match[2]
    
    // Extract all options from the block
    const options: string[] = []
    let optionMatch: RegExpExecArray | null
    const optionParser = /<option>(.*?)<\/option>/g
    
    while ((optionMatch = optionParser.exec(optionsBlock)) !== null) {
      options.push(optionMatch[1].trim())
    }

    result.questionsWithOptions.push({
      question,
      options
    })

    // Mark this range as processed
    processedRanges.push({
      start: match.index,
      end: match.index + match[0].length
    })
  }

  // Helper to check if index is already processed
  const isProcessed = (index: number, length: number): boolean => {
    return processedRanges.some(range => 
      (index >= range.start && index < range.end) ||
      (index + length > range.start && index + length <= range.end) ||
      (index <= range.start && index + length >= range.end)
    )
  }

  // 2. Find standalone questions (not followed by options)
  questionOnlyRegex.lastIndex = 0 // Reset regex
  while ((match = questionOnlyRegex.exec(text)) !== null) {
    if (!isProcessed(match.index, match[0].length)) {
      // Check if this is NOT followed by options and <question/>
      const afterQuestion = text.slice(match.index + match[0].length)
      const hasOptionsAfter = /^\s*<option>/.test(afterQuestion)
      
      if (!hasOptionsAfter) {
        result.questionsOnly.push(match[1].trim())
        processedRanges.push({
          start: match.index,
          end: match.index + match[0].length
        })
      }
    }
  }

  // 3. Find standalone options (not part of a question block)
  optionRegex.lastIndex = 0 // Reset regex
  while ((match = optionRegex.exec(text)) !== null) {
    if (!isProcessed(match.index, match[0].length)) {
      result.optionsOnly.push(match[1].trim())
    }
  }

  return result
}

/**
 * Removes question and option tags from text, leaving only the plain text content
 */
export function stripQuestionOptionTags(text: string): string {
  return text
    .replace(/<question>(.*?)<\/question>/g, '$1')
    .replace(/<option>(.*?)<\/option>/g, '$1')
    .replace(/<question\s*\/>/g, '')
    .trim()
}
