# Design Document

## Overview

The AI Mistake Pattern Analyzer is a React Native mobile application built with Expo that provides NEET students with AI-powered insights into their recurring mistake patterns. The application uses a file-based routing architecture with Expo Router, NativeWind for styling, Zustand for state management, and integrates with Appwrite for backend services and Groq AI for pattern analysis.

The application consists of two primary screens: a Dashboard that displays statistics and a list of detected patterns, and a Pattern Detail screen that shows comprehensive information about a specific pattern including evidence and recommendations.

## Architecture

### Technology Stack

- **Framework**: React Native with Expo SDK
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Backend**: Appwrite (Database, Functions, Authentication)
- **AI Service**: Groq AI (accessed via Appwrite Functions)
- **Language**: TypeScript

### Project Structure

```
mistake-analyzer/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with navigation setup
│   ├── index.tsx                # Dashboard screen (home route)
│   └── pattern/[id].tsx         # Pattern detail screen (dynamic route)
├── components/
│   ├── PatternCard.tsx          # Pattern display card
│   ├── StatsGrid.tsx            # Statistics grid component
│   ├── LoadingShimmer.tsx       # Loading skeleton component
│   ├── ConfidenceBadge.tsx      # Confidence score badge
│   └── EvidenceList.tsx         # Evidence items list
├── services/
│   └── appwrite.ts              # Appwrite client and service functions
├── store/
│   └── patternStore.ts          # Zustand store for patterns and stats
├── types/
│   └── index.ts                 # TypeScript type definitions
├── utils/
│   └── formatters.ts            # Utility functions for formatting
├── tailwind.config.js           # NativeWind configuration
├── babel.config.js              # Babel configuration with NativeWind plugin
└── app.json                     # Expo configuration
```

### File-Based Routing Structure

Using Expo Router, the navigation is defined by the file structure:

- `/` → `app/index.tsx` (Dashboard)
- `/pattern/[id]` → `app/pattern/[id].tsx` (Pattern Detail)

## Components and Interfaces

### Core Components

#### 1. Dashboard Screen (`app/index.tsx`)

**Purpose**: Main screen displaying user statistics and list of detected patterns

**Key Features**:

- Gradient header with app title and analyze button
- Statistics grid showing 4 key metrics
- AI status badge showing analysis state
- Scrollable list of pattern cards
- Pull-to-refresh functionality
- Empty state when no patterns exist
- Alert banner when patterns are detected

**State Dependencies**:

- `patterns` - Array of detected patterns
- `loading` - Boolean for initial load state
- `analyzing` - Boolean for AI analysis state
- `stats` - Object containing totalQuestions, mistakes, accuracy

**Props**: None (root route)

#### 2. Pattern Detail Screen (`app/pattern/[id].tsx`)

**Purpose**: Detailed view of a single pattern with evidence and recommendations

**Key Features**:

- Back navigation button
- Pattern title and confidence badge
- Full description text
- Evidence section with list of specific examples
- AI recommendation box with gradient background
- Action buttons for practice and resolution

**State Dependencies**:

- Pattern data passed via route params

**Props**:

- Route params containing pattern object

#### 3. PatternCard Component

**Purpose**: Reusable card component for displaying pattern summary

**Props**:

```typescript
interface PatternCardProps {
  pattern: {
    $id: string;
    title: string;
    description: string;
    confidence: number;
    evidence: string[];
    recommendation: string;
  };
  onPress: () => void;
  onResolve: () => void;
}
```

**Visual Elements**:

- Title with confidence badge
- Truncated description (2-3 lines)
- Evidence count indicator
- Recommendation preview
- View Details and Resolve buttons

#### 4. StatsGrid Component

**Purpose**: Display user performance statistics in a 2x2 grid

**Props**:

```typescript
interface StatsGridProps {
  stats: {
    totalQuestions: number;
    mistakes: number;
    accuracy: string;
    patternsDetected: number;
  };
}
```

**Layout**: Responsive grid with 2 columns on mobile, auto-fit on larger screens

#### 5. LoadingShimmer Component

**Purpose**: Animated loading placeholder for pattern cards

**Features**:

- Animated opacity pulse effect
- Matches pattern card dimensions
- Displays 3 shimmer cards by default

#### 6. ConfidenceBadge Component

**Purpose**: Display confidence score with color-coded background

**Props**:

```typescript
interface ConfidenceBadgeProps {
  confidence: number;
}
```

**Logic**:

- Green background (confidence >= 85%)
- Yellow background (confidence < 85%)

#### 7. EvidenceList Component

**Purpose**: Display list of evidence items with icons

**Props**:

```typescript
interface EvidenceListProps {
  evidence: string[];
}
```

**Features**:

- Icon prefix for each item
- Scrollable if list is long
- Styled container with background

## Data Models

### Pattern Type

```typescript
interface Pattern {
  $id: string; // Appwrite document ID
  user_id: string; // User identifier
  pattern_type: string; // Category of pattern (e.g., "rushing", "confusion")
  title: string; // Human-readable pattern title
  description: string; // Detailed explanation of the pattern
  confidence: number; // Confidence score (0-100)
  evidence: string; // JSON string array of evidence items
  recommendation: string; // AI-generated recommendation text
  detected_at: string; // ISO timestamp of detection
  is_resolved: boolean; // Whether user has marked as resolved
  subject_distribution?: {
    // Optional subject breakdown
    Physics?: number;
    Chemistry?: number;
    Biology?: number;
  };
}
```

### Stats Type

```typescript
interface Stats {
  totalQuestions: number; // Total questions answered
  mistakes: number; // Total incorrect answers
  accuracy: string; // Percentage as string (e.g., "72.5")
}
```

### User Response Type (stored in Appwrite)

```typescript
interface UserResponse {
  $id: string;
  user_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken: number; // Seconds
  test_id: string;
  timestamp: string; // ISO timestamp
  question_position: number; // Position in test (1-based)
  test_duration_so_far: number; // Minutes elapsed in test
  subject?: string; // "Physics" | "Chemistry" | "Biology"
}
```

## State Management

### Zustand Store Structure

```typescript
interface PatternStore {
  // State
  patterns: Pattern[];
  loading: boolean;
  analyzing: boolean;
  stats: Stats;

  // Actions
  fetchPatterns: (userId: string) => Promise<void>;
  analyzePatterns: (userId: string) => Promise<void>;
  resolvePattern: (patternId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
}
```

### Store Implementation Details

**fetchPatterns**:

- Queries Appwrite for unresolved patterns
- Filters by user_id and is_resolved = false
- Orders by confidence descending
- Parses evidence JSON string to array
- Updates patterns and loading state

**analyzePatterns**:

- Sets analyzing state to true
- Invokes Appwrite Function to trigger Groq AI analysis
- Waits 5 seconds for async processing
- Refreshes patterns list
- Sets analyzing state to false

**resolvePattern**:

- Updates pattern document in Appwrite
- Sets is_resolved to true
- Removes pattern from local state array
- Handles errors gracefully

**fetchStats**:

- Queries all user responses from Appwrite
- Calculates total, correct, and mistakes
- Computes accuracy percentage
- Updates stats state

## Service Layer

### Appwrite Service (`services/appwrite.ts`)

**Configuration**:

```typescript
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
```

**Service Methods**:

1. **getUserPatterns(userId: string)**
   - Returns: Promise<DocumentList<Pattern>>
   - Queries: DETECTED_PATTERNS collection
   - Filters: user_id, is_resolved = false
   - Sorts: confidence DESC
   - Limit: 10 patterns

2. **getUserStats(userId: string)**
   - Returns: Promise<Stats>
   - Queries: USER_RESPONSES collection
   - Calculates: total, mistakes, accuracy
   - Limit: 1000 responses (for performance)

3. **analyzePatterns(userId: string)**
   - Returns: Promise<Response>
   - Method: HTTP POST to Appwrite Function endpoint
   - Endpoint: Provided by Appwrite (e.g., `https://cloud.appwrite.io/v1/functions/{functionId}/executions`)
   - Headers: X-Appwrite-Project, Content-Type: application/json
   - Body: JSON.stringify({ userId })
   - Note: Uses fetch() to call the Appwrite Function endpoint directly

4. **resolvePattern(patternId: string)**
   - Returns: Promise<Document<Pattern>>
   - Updates: DETECTED_PATTERNS document
   - Sets: is_resolved = true

### Appwrite Collections Schema

**DETECTED_PATTERNS Collection**:

- user_id (string, indexed)
- pattern_type (string)
- title (string)
- description (string)
- confidence (integer, 0-100)
- evidence (string, JSON array)
- recommendation (string)
- detected_at (datetime)
- is_resolved (boolean, indexed)
- subject_distribution (string, optional JSON object)

**USER_RESPONSES Collection**:

- user_id (string, indexed)
- question_id (string)
- selected_answer (string)
- is_correct (boolean)
- time_taken (integer)
- test_id (string, indexed)
- timestamp (datetime)
- question_position (integer)
- test_duration_so_far (float)
- subject (string, optional)

**Indexes**:

- DETECTED_PATTERNS: user_id + is_resolved (compound)
- USER_RESPONSES: user_id + timestamp (compound)

## Navigation Flow

### File-Based Routing with Expo Router

**Root Layout** (`app/_layout.tsx`):

```typescript
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="pattern/[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
```

**Navigation Actions**:

1. **Dashboard → Pattern Detail**:

   ```typescript
   router.push({
     pathname: "/pattern/[id]",
     params: {
       id: pattern.$id,
       pattern: JSON.stringify(pattern),
     },
   });
   ```

2. **Pattern Detail → Dashboard**:
   ```typescript
   router.back();
   ```

**Route Parameters**:

- Pattern detail receives full pattern object as JSON string
- Parsed on detail screen using `JSON.parse(params.pattern)`

## Styling System

### NativeWind Configuration

**Tailwind Config**:

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#667eea",
        secondary: "#764ba2",
      },
    },
  },
};
```

### Design Tokens

**Colors**:

- Primary: #667eea (purple)
- Secondary: #764ba2 (darker purple)
- Success: #10b981 (green)
- Warning: #f59e0b (yellow)
- Error: #ef4444 (red)
- Gray scale: Tailwind default

**Typography**:

- Headings: font-bold, text-lg to text-2xl
- Body: text-sm to text-base
- Labels: text-xs, text-gray-600

**Spacing**:

- Card padding: p-5 (20px)
- Grid gaps: gap-3 (12px)
- Section margins: mb-4 to mb-6

**Border Radius**:

- Cards: rounded-2xl (16px)
- Buttons: rounded-lg (8px)
- Badges: rounded-full

## Error Handling

### Error Handling Strategy

**Network Errors**:

- Log to console for debugging
- Display user-friendly error messages via Alert
- Maintain previous data in UI
- Allow retry via pull-to-refresh

**Data Parsing Errors**:

- Wrap JSON.parse in try-catch
- Default to empty array if evidence parsing fails
- Log parsing errors to console

**State Update Errors**:

- Use try-catch in all async store actions
- Set loading/analyzing states to false in finally blocks
- Display error alerts for user-initiated actions

**Graceful Degradation**:

- Show empty states when no data available
- Display zero values for stats if fetch fails
- Keep UI interactive even during errors

### Error Messages

**Pattern Fetch Failure**:

```
"Unable to load patterns. Pull down to refresh."
```

**Analysis Trigger Failure**:

```
"Analysis failed. Please try again later."
```

**Pattern Resolution Failure**:

```
"Unable to mark pattern as resolved. Please try again."
```

## Testing Strategy

### Component Testing

**Test Coverage**:

1. PatternCard renders correctly with all props
2. StatsGrid displays formatted numbers
3. LoadingShimmer animates properly
4. ConfidenceBadge shows correct colors
5. EvidenceList renders all items

**Testing Approach**:

- Use React Native Testing Library
- Test component rendering with mock data
- Verify prop handling and callbacks
- Test conditional rendering (empty states, loading states)

### Integration Testing

**Test Scenarios**:

1. Dashboard loads and displays patterns
2. Pull-to-refresh updates data
3. Tapping pattern card navigates to detail
4. Analyze button triggers AI analysis
5. Resolve button marks pattern as resolved
6. Navigation back button returns to dashboard

**Testing Approach**:

- Mock Appwrite service responses
- Test navigation flows
- Verify state updates after actions
- Test error handling paths

### Store Testing

**Test Coverage**:

1. fetchPatterns updates state correctly
2. analyzePatterns sets analyzing state
3. resolvePattern removes pattern from list
4. fetchStats calculates accuracy correctly
5. Error handling sets loading states to false

**Testing Approach**:

- Mock Appwrite service methods
- Test state transitions
- Verify async action completion
- Test error scenarios

### Manual Testing Checklist

**Dashboard Screen**:

- [ ] Statistics display correctly
- [ ] Patterns list loads and scrolls
- [ ] Pull-to-refresh works
- [ ] Empty state shows when no patterns
- [ ] Loading shimmer displays during fetch
- [ ] Analyze button triggers analysis
- [ ] Alert banner shows when patterns exist

**Pattern Detail Screen**:

- [ ] Pattern data displays correctly
- [ ] Evidence list renders all items
- [ ] Recommendation box is readable
- [ ] Back button navigates to dashboard
- [ ] Resolve button shows confirmation
- [ ] Practice button is visible (placeholder)

**Navigation**:

- [ ] Smooth transitions between screens
- [ ] Back navigation maintains scroll position
- [ ] Route params pass correctly

**Error Handling**:

- [ ] Network errors show appropriate messages
- [ ] Failed actions can be retried
- [ ] App doesn't crash on errors

## Performance Considerations

### Optimization Strategies

**Data Fetching**:

- Limit pattern queries to 10 results
- Limit stats queries to 1000 responses
- Use Appwrite indexes for fast queries
- Cache data in Zustand store

**Rendering**:

- Use FlatList for pattern lists (if list grows)
- Memoize expensive calculations
- Optimize re-renders with React.memo
- Use native driver for animations

**State Management**:

- Keep store minimal and focused
- Avoid unnecessary state updates
- Use selective subscriptions in components

**Bundle Size**:

- Use Expo's optimized builds
- Tree-shake unused dependencies
- Lazy load screens if needed

### Performance Targets

- Initial load: < 2 seconds
- Pattern fetch: < 1 second
- Navigation transition: < 300ms
- Pull-to-refresh: < 1.5 seconds
- Smooth scrolling: 60 FPS

## Security Considerations

### Data Security

**Appwrite Security**:

- Use Appwrite's built-in authentication (future)
- Implement collection-level permissions
- Validate user_id in all queries
- Use HTTPS for all API calls

**Client-Side Security**:

- Store sensitive config in environment variables
- Don't log sensitive user data
- Validate data before rendering
- Sanitize user inputs (future features)

**API Keys**:

- Store Appwrite credentials in .env
- Use EXPO*PUBLIC* prefix for client-safe variables
- Never commit .env files to version control

## Accessibility

### Accessibility Features

**Screen Reader Support**:

- Add accessibilityLabel to all interactive elements
- Use accessibilityHint for complex actions
- Mark decorative elements as accessibilityElementsHidden

**Touch Targets**:

- Minimum 44x44 points for all buttons
- Adequate spacing between interactive elements
- Large tap areas for cards

**Visual Accessibility**:

- High contrast text (WCAG AA compliant)
- Readable font sizes (minimum 12px)
- Color is not the only indicator (use icons + text)

**Keyboard Navigation** (future):

- Support for external keyboard navigation
- Focus indicators on interactive elements

## Future Enhancements

### Phase 2 Features

1. **User Authentication**:
   - Appwrite account creation and login
   - Multi-device sync
   - User profiles

2. **Practice Question System**:
   - Question bank integration
   - AI-generated practice sets
   - Progress tracking

3. **Offline Support**:
   - Local data caching
   - Sync when online
   - Offline-first architecture

4. **Advanced Analytics**:
   - Time-based error distribution charts
   - Subject-wise breakdown graphs
   - Progress over time visualization

5. **Notifications**:
   - Pattern detection alerts
   - Practice reminders
   - Weekly progress summaries

### Scalability Considerations

**Database**:

- Implement pagination for large datasets
- Archive old test sessions
- Optimize indexes as data grows

**AI Analysis**:

- Queue system for analysis requests
- Incremental analysis (only new data)
- Caching of analysis results

**UI Performance**:

- Virtual scrolling for long lists
- Image optimization (if added)
- Code splitting for larger app
