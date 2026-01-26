# Artifact ID Rendering - Architecture Diagram

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatMessage Component                     │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Props Received                           │
│  • message.content: "Text <artifact_id=\"uuid\"> More text"     │
│  • message.tool_events: [{ artifacts_data: {...} }]             │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
    ┌───────────────────────────┐   ┌──────────────────────────┐
    │   artifactMap (computed)  │   │ contentSegments (computed)│
    │                           │   │                           │
    │ Filters tool_events       │   │ Parses message.content    │
    │ Builds Map:               │   │ Uses ARTIFACT_PATTERN     │
    │   uuid → plotly_json      │   │ Splits into segments      │
    └───────────────────────────┘   └──────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
    ┌───────────────────────────────┐   ┌──────────────────────────────┐
    │ referencedArtifactIds         │   │ visualizations (computed)    │
    │ (computed)                    │   │                              │
    │                               │   │ Filters tool_events          │
    │ Collects artifact IDs that    │   │ Excludes referenced IDs      │
    │ appear in content             │   │ Returns unreferenced charts  │
    └───────────────────────────────┘   └──────────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                    ┌──────────────────────────┐
                    │   Segment Processing     │
                    │                          │
                    │ For each match:          │
                    │  1. Add text before      │
                    │  2. Lookup in artifactMap│
                    │  3. Create segment       │
                    │  4. Continue...          │
                    └──────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────────────────────────┐
        │         Segments Array Created              │
        │                                             │
        │ [                                           │
        │   { type: 'text', content: 'Text' },        │
        │   { type: 'artifact', plotlyJson: '...' },  │
        │   { type: 'text', content: 'More text' }    │
        │ ]                                           │
        └─────────────────────────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────────────────────────┐
        │           Template Rendering                │
        │                                             │
        │ v-for over contentSegments                  │
        │   ├─ text → MarkdownRenderer                │
        │   ├─ artifact → PlotlyChart                 │
        │   └─ missing-artifact → Warning             │
        └─────────────────────────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────────────────────────┐
        │            Final Rendered Output            │
        │                                             │
        │ ┌─────────────────────────────────────────┐ │
        │ │ Text content (markdown formatted)       │ │
        │ └─────────────────────────────────────────┘ │
        │ ┌─────────────────────────────────────────┐ │
        │ │ [Plotly Chart Rendered Inline]          │ │
        │ └─────────────────────────────────────────┘ │
        │ ┌─────────────────────────────────────────┐ │
        │ │ More text content                       │ │
        │ └─────────────────────────────────────────┘ │
        │                                             │
        │ ┌─────────────────────────────────────────┐ │
        │ │ Unreferenced Charts Only                │ │
        │ │ (Referenced charts excluded to prevent │ │
        │ │  duplication)                           │ │
        │ └─────────────────────────────────────────┘ │
        └─────────────────────────────────────────────┘
```

## Duplication Prevention Flow

```
Message has 3 charts in tool_events:
├─ Chart A (uuid-A)
├─ Chart B (uuid-B)
└─ Chart C (uuid-C)

Content references Chart A and Chart C:
"Text <artifact_id=\"uuid-A\"> More <artifact_id=\"uuid-C\"> End"

Step 1: Parse content
├─ referencedArtifactIds = Set { 'uuid-A', 'uuid-C' }

Step 2: Build contentSegments
├─ Text
├─ Chart A (inline) ← uuid-A referenced
├─ Text
├─ Chart C (inline) ← uuid-C referenced
└─ Text

Step 3: Build visualizations (for end display)
├─ Filter tool_events
├─ Exclude uuid-A ✗ (already rendered inline)
├─ Include uuid-B ✓ (not referenced)
└─ Exclude uuid-C ✗ (already rendered inline)

Result:
├─ Chart A appears inline only
├─ Chart B appears at end only (unreferenced)
└─ Chart C appears inline only

No duplication! ✅
```

## Component Structure

```
ChatMessage.vue
├── Template
│   ├── Thinking Section (if tools exist)
│   ├── Bot Response Content
│   │   ├── Content Segments Loop
│   │   │   ├── MarkdownRenderer (text segments)
│   │   │   ├── PlotlyChart (artifact segments)
│   │   │   └── Warning Div (missing artifacts)
│   │   └── Visualizations Container (backward compat)
│   │       └── PlotlyChart (all charts)
│   └── Bot Actions (copy, share, etc.)
│
└── Script
    ├── Constants
    │   └── ARTIFACT_PATTERN regex
    ├── Computed Properties
    │   ├── artifactMap
    │   ├── contentSegments
    │   ├── referencedArtifactIds (NEW)
    │   └── visualizations (MODIFIED - excludes referenced)
    └── Methods
        ├── toggleThinking
        └── copyMessage
```

## Regex Matching Process

```
Input: "Hello <artifact_id=\"abc-123\"> World"

Step 1: Initialize
├── lastIndex = 0
├── segments = []
└── Reset regex

Step 2: First Match
├── match = <artifact_id="abc-123">
├── artifactId = "abc-123"
├── matchStart = 6
└── matchEnd = 32

Step 3: Process Before Match
├── Text: "Hello " (0 to 6)
└── Add segment: { type: 'text', content: 'Hello ' }

Step 4: Process Match
├── Lookup artifactId in artifactMap
├── Found? → { type: 'artifact', plotlyJson: '...' }
└── Not found? → { type: 'missing-artifact', artifactId: '...' }

Step 5: Continue
└── lastIndex = 32

Step 6: Process After Last Match
├── Text: " World" (32 to end)
└── Add segment: { type: 'text', content: ' World' }

Result:
[
  { type: 'text', content: 'Hello ' },
  { type: 'artifact', plotlyJson: '...' },
  { type: 'text', content: ' World' }
]
```

## State Management

```
┌────────────────────────────────────────┐
│         Message Object (Prop)          │
│                                        │
│  {                                     │
│    id: "msg-123",                      │
│    content: "...<artifact_id>...",     │
│    tool_events: [                      │
│      {                                 │
│        type: "tool_end",               │
│        artifacts_data: {               │
│          artifact_id: "uuid",          │
│          artifact_type: "plotly",      │
│          plotly_fig_json: "{...}"      │
│        }                               │
│      }                                 │
│    ]                                   │
│  }                                     │
└────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│    Reactive Computed Properties        │
│                                        │
│  artifactMap (Map)                     │
│  ├─ Key: artifact_id                   │
│  └─ Value: plotly_fig_json             │
│                                        │
│  contentSegments (Array)               │
│  └─ Segments with types                │
└────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│         Template Rendering             │
│                                        │
│  Automatically updates when:           │
│  • message.content changes             │
│  • message.tool_events changes         │
│  • Thread switches (new message)       │
└────────────────────────────────────────┘
```

## Thread Switching Flow

```
User Action: Switch from Thread A to Thread B
                    │
                    ▼
┌────────────────────────────────────────┐
│   chatStore.loadThread(threadB)        │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   Load messages from cache/API         │
│   messages.value = [...threadB msgs]   │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   ChatMessage components re-render     │
│   with new message props               │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   Each message's computed properties   │
│   recalculate based on its tool_events │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   Charts render from message data      │
│   (No global state dependency)         │
└────────────────────────────────────────┘
```

## Performance Characteristics

```
Operation              Time Complexity    Space Complexity
─────────────────────────────────────────────────────────
Build artifactMap      O(n)              O(n)
  n = number of tool_events

Parse content          O(m)              O(k)
  m = content length
  k = number of matches

Lookup artifact        O(1)              -
  (Map-based)

Render segments        O(s)              O(s)
  s = number of segments

Total per message      O(n + m)          O(n + k + s)
```

## Error Handling Flow

```
Scenario: Missing Artifact ID

User sees: <artifact_id="non-existent">
                    │
                    ▼
┌────────────────────────────────────────┐
│   Regex matches pattern                │
│   Extracts: "non-existent"             │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   Lookup in artifactMap                │
│   Result: undefined                    │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   Create missing-artifact segment      │
│   { type: 'missing-artifact',          │
│     artifactId: 'non-existent' }       │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│   Render warning placeholder           │
│   "⚠️ Chart not found: non-existent"   │
└────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                   External Components                    │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Markdown     │  │ PlotlyChart  │  │ ChatMessage  │
│ Renderer     │  │              │  │ (This file)  │
│              │  │              │  │              │
│ Receives:    │  │ Receives:    │  │ Receives:    │
│ • content    │  │ • plotlyJson │  │ • message    │
│              │  │              │  │ • index      │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                ┌──────────────────┐
                │   Rendered UI    │
                └──────────────────┘
```

---

**Legend:**
- `│ ▼` = Data flow direction
- `├─` = Branch/option
- `└─` = End of branch
- `[...]` = Visual component
- `{...}` = Data structure

