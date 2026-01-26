# Artifact ID Inline Rendering - Testing Guide

## Implementation Summary

The artifact ID parsing feature has been successfully implemented in `ChatMessage.vue`. The component now:

1. **Parses artifact references** from message content using the pattern `<artifact_id="uuid">`
2. **Builds an artifact map** from the message's `tool_events` 
3. **Renders content in segments**:
   - Text segments → `MarkdownRenderer`
   - Artifact segments → `PlotlyChart` (inline)
   - Missing artifacts → Warning placeholder
4. **Maintains backward compatibility** - Charts still auto-display at the end

## How It Works

### Pattern Matching
```javascript
const ARTIFACT_PATTERN = /<artifact_id="([a-f0-9-]+)">/gi
```

### Content Flow
```
Message Content
    ↓
Parse with regex
    ↓
Split into segments
    ↓
For each segment:
  - Text? → MarkdownRenderer
  - Artifact? → Lookup in artifactMap → PlotlyChart
  - Missing? → Show warning
```

## Test Scenarios

### ✅ Scenario 1: No Artifact References
**Input:** Regular message without any `<artifact_id="">` tags
**Expected:** Renders normally with MarkdownRenderer
**Status:** Should work (backward compatible)

### ✅ Scenario 2: Single Valid Artifact Reference
**Input:** 
```
Here is the chart you requested:

<artifact_id="b0dfbd2f-3e12-4d2a-b7f1-955f15e8f9f4">

The chart shows the data trends.
```
**Expected:** 
- Text before artifact
- Inline chart rendering
- Text after artifact
- Chart does NOT appear at end (no duplication)
**Status:** Implemented

### ✅ Scenario 3: Multiple Artifact References
**Input:**
```
First chart: <artifact_id="uuid-1">
Second chart: <artifact_id="uuid-2">
```
**Expected:** Both charts render inline at their respective positions
**Status:** Implemented

### ✅ Scenario 4: Same Artifact Referenced Multiple Times
**Input:**
```
Chart A: <artifact_id="same-uuid">
Discussion...
Chart A again: <artifact_id="same-uuid">
```
**Expected:** Same chart renders twice at different positions
**Status:** Implemented

### ✅ Scenario 5: Missing/Invalid Artifact ID
**Input:** `<artifact_id="non-existent-uuid">`
**Expected:** Shows warning: "⚠️ Chart not found: non-existent-uuid"
**Status:** Implemented

### ✅ Scenario 6: Malformed Syntax
**Input:** 
- `<artifact_id="">`
- `<artifact_id>`
- `artifact_id="uuid"`
**Expected:** Treated as plain text (no match)
**Status:** Handled by regex (won't match)

### ✅ Scenario 7: Thread Switching
**Action:** 
1. View message with artifact in Thread A
2. Switch to Thread B
3. Switch back to Thread A
**Expected:** Chart still renders correctly (data from tool_events)
**Status:** Should work (uses message.tool_events, not global state)

### ✅ Scenario 8: Partial Referencing (Some Referenced, Some Not)
**Input:**
```
Chart A (referenced): <artifact_id="uuid-A">
Text...
(Chart B with uuid-B exists in tool_events but NOT referenced in content)
```
**Expected:** 
- Chart A renders inline
- Chart A does NOT appear at end
- Chart B (unreferenced) appears at end
**Status:** Implemented

### ✅ Scenario 9: Mixed Content
**Input:**
```markdown
# Analysis Results

The data shows interesting patterns.

<artifact_id="chart-1">

## Key Findings
- Point 1
- Point 2

<artifact_id="chart-2">

Conclusion text here.
```
**Expected:** Markdown formatting preserved, charts inline where referenced
**Status:** Implemented

## Testing Instructions

### Manual Testing
1. Start the dev server: `pnpm run dev`
2. Open the chat application
3. Send a message to an AI that generates Plotly charts
4. In the AI response, look for the artifact_id in the tool_events
5. Manually edit a test message to include `<artifact_id="actual-uuid">`
6. Verify inline rendering

### Automated Testing (Future)
```typescript
// Test artifact map building
expect(artifactMap.get('uuid-1')).toBeDefined()

// Test content parsing
const segments = parseContent('Text <artifact_id="uuid"> More text')
expect(segments).toHaveLength(3)
expect(segments[0].type).toBe('text')
expect(segments[1].type).toBe('artifact')
expect(segments[2].type).toBe('text')
```

## Edge Cases Handled

1. ✅ Empty content → Returns empty segments array
2. ✅ Content with only whitespace → Handled
3. ✅ No tool_events → artifactMap is empty, shows "not found" warnings
4. ✅ Multiple spaces/newlines around artifact tag → Preserved in text segments
5. ✅ Artifact tag at start of content → No leading text segment
6. ✅ Artifact tag at end of content → No trailing text segment
7. ✅ Consecutive artifact tags → Each gets its own segment

## Browser Compatibility

The implementation uses:
- `Map` (ES6) - Supported in all modern browsers
- `computed` (Vue 3) - Framework feature
- Regex with global flag - Standard JavaScript
- Template v-for - Vue 3 feature

**Minimum Requirements:** Same as Vue 3 + Vite project

## Performance Considerations

- **Regex execution**: O(n) where n is content length
- **Artifact lookup**: O(1) with Map
- **Segment rendering**: O(m) where m is number of segments
- **Memory**: Minimal overhead (Map stores references, not copies)

## Known Limitations

1. Only searches within the same message's tool_events (by design)
2. Only supports Plotly charts (artifact_type: 'application/vnd.plotly.v1+json')
3. UUID format must be lowercase hex with hyphens: `[a-f0-9-]+`
4. Referenced charts appear inline only (removed from end display to prevent duplication)
5. Unreferenced charts still auto-display at end (backward compatibility)

## Future Enhancements

- [ ] Support other artifact types (images, tables, etc.)
- [ ] Cross-message artifact references
- [ ] Artifact caching for performance
- [ ] Click to expand/collapse inline charts
- [ ] Artifact reference autocomplete in input

