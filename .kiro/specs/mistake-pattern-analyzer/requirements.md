# Requirements Document

## Introduction

The AI Mistake Pattern Analyzer is a React Native mobile application designed to help NEET (National Eligibility cum Entrance Test) students identify and understand their recurring mistake patterns. By analyzing test performance data stored in Appwrite, the system uses Groq AI to detect behavioral patterns in errors and provides personalized recommendations to help students improve their exam performance.

## Glossary

- **Pattern Analyzer System**: The React Native mobile application that displays AI-detected mistake patterns
- **Appwrite Backend**: The backend-as-a-service platform that stores user responses, test sessions, and detected patterns
- **Groq AI Service**: The AI service that analyzes user response data to detect mistake patterns
- **Pattern**: A recurring behavioral mistake identified by AI analysis (e.g., rushing through multi-diagram questions)
- **Evidence**: Specific examples from past tests that support a detected pattern
- **Confidence Score**: A percentage (0-100%) indicating how certain the AI is about a detected pattern
- **User Response**: A record of a student's answer to a single question, including correctness, time taken, and metadata
- **Test Session**: A collection of user responses from a single test attempt
- **NEET Subjects**: Physics, Chemistry, and Biology - the three subjects tested in NEET exams

## Requirements

### Requirement 1: Display User Statistics Dashboard

**User Story:** As a NEET student, I want to see my overall test performance statistics at a glance, so that I can understand my current performance level.

#### Acceptance Criteria

1. WHEN the Pattern Analyzer System loads the dashboard, THE Pattern Analyzer System SHALL fetch and display the total number of questions the user has answered
2. WHEN the Pattern Analyzer System loads the dashboard, THE Pattern Analyzer System SHALL calculate and display the total number of mistakes made by the user
3. WHEN the Pattern Analyzer System loads the dashboard, THE Pattern Analyzer System SHALL calculate and display the user's accuracy percentage as (correct answers / total answers) × 100
4. WHEN the Pattern Analyzer System loads the dashboard, THE Pattern Analyzer System SHALL display the count of currently detected unresolved patterns
5. THE Pattern Analyzer System SHALL display all statistics in a grid layout with clear labels and prominent numbers

### Requirement 2: Fetch and Display Detected Patterns

**User Story:** As a NEET student, I want to view AI-detected mistake patterns from my test history, so that I can understand what types of errors I repeatedly make.

#### Acceptance Criteria

1. WHEN the Pattern Analyzer System loads the dashboard, THE Pattern Analyzer System SHALL query Appwrite Backend for all unresolved patterns associated with the user
2. THE Pattern Analyzer System SHALL sort patterns by confidence score in descending order
3. THE Pattern Analyzer System SHALL display each pattern with its title, description, confidence score, and evidence count
4. WHEN a pattern has a confidence score of 85% or higher, THE Pattern Analyzer System SHALL display the confidence badge with a green background
5. WHEN a pattern has a confidence score below 85%, THE Pattern Analyzer System SHALL display the confidence badge with a yellow background
6. WHEN no patterns are detected for the user, THE Pattern Analyzer System SHALL display an empty state message indicating no patterns have been found yet

### Requirement 3: Trigger Manual Pattern Analysis

**User Story:** As a NEET student, I want to manually trigger AI analysis of my test data, so that I can get updated pattern insights after completing new tests.

#### Acceptance Criteria

1. THE Pattern Analyzer System SHALL display an "Analyze" button in the dashboard header
2. WHEN the user taps the "Analyze" button, THE Pattern Analyzer System SHALL display a confirmation dialog explaining the analysis process
3. WHEN the user confirms the analysis, THE Pattern Analyzer System SHALL invoke the Groq AI Service through Appwrite Backend to analyze the user's response data
4. WHILE the analysis is in progress, THE Pattern Analyzer System SHALL display "Analyzing..." text on the button and disable further taps
5. WHEN the analysis completes, THE Pattern Analyzer System SHALL automatically refresh the patterns list to show newly detected patterns
6. WHEN the analysis completes, THE Pattern Analyzer System SHALL display a success message to the user

### Requirement 4: View Detailed Pattern Information

**User Story:** As a NEET student, I want to view detailed information about a specific mistake pattern, so that I can understand the evidence and get actionable recommendations.

#### Acceptance Criteria

1. WHEN the user taps on a pattern card, THE Pattern Analyzer System SHALL navigate to a pattern detail screen
2. THE Pattern Analyzer System SHALL display the pattern title, description, and confidence score on the detail screen
3. THE Pattern Analyzer System SHALL display all evidence items associated with the pattern in a list format
4. THE Pattern Analyzer System SHALL display the AI-generated recommendation for addressing the pattern
5. THE Pattern Analyzer System SHALL provide a back navigation button to return to the dashboard
6. THE Pattern Analyzer System SHALL display action buttons for "Practice Similar Questions" and "Mark as Resolved"

### Requirement 5: Mark Patterns as Resolved

**User Story:** As a NEET student, I want to mark a mistake pattern as resolved after I've worked on improving it, so that I can track which patterns I've addressed.

#### Acceptance Criteria

1. WHEN the user taps the "Mark as Resolved" button on a pattern card or detail screen, THE Pattern Analyzer System SHALL display a confirmation dialog
2. WHEN the user confirms marking the pattern as resolved, THE Pattern Analyzer System SHALL update the pattern's is_resolved field to true in Appwrite Backend
3. WHEN a pattern is marked as resolved, THE Pattern Analyzer System SHALL remove it from the dashboard patterns list
4. WHEN a pattern is marked as resolved, THE Pattern Analyzer System SHALL update the patterns detected count in the statistics grid
5. IF the update fails, THE Pattern Analyzer System SHALL display an error message and keep the pattern in the list

### Requirement 6: Refresh Dashboard Data

**User Story:** As a NEET student, I want to pull down to refresh my dashboard data, so that I can see the latest patterns and statistics without restarting the app.

#### Acceptance Criteria

1. THE Pattern Analyzer System SHALL support pull-to-refresh gesture on the dashboard screen
2. WHEN the user performs a pull-to-refresh gesture, THE Pattern Analyzer System SHALL fetch updated statistics from Appwrite Backend
3. WHEN the user performs a pull-to-refresh gesture, THE Pattern Analyzer System SHALL fetch updated patterns list from Appwrite Backend
4. WHILE refreshing data, THE Pattern Analyzer System SHALL display a loading indicator
5. WHEN the refresh completes, THE Pattern Analyzer System SHALL update all displayed data with the latest values

### Requirement 7: Display Loading States

**User Story:** As a NEET student, I want to see loading indicators when data is being fetched, so that I know the app is working and not frozen.

#### Acceptance Criteria

1. WHEN the Pattern Analyzer System is fetching patterns from Appwrite Backend, THE Pattern Analyzer System SHALL display animated shimmer loading placeholders
2. WHEN the Pattern Analyzer System is fetching statistics, THE Pattern Analyzer System SHALL display the previous statistics values or zero values until new data loads
3. THE Pattern Analyzer System SHALL display shimmer placeholders that match the approximate size and shape of pattern cards
4. WHEN data loading completes, THE Pattern Analyzer System SHALL replace shimmer placeholders with actual pattern cards within 300 milliseconds

### Requirement 8: Handle Error States

**User Story:** As a NEET student, I want to see clear error messages when something goes wrong, so that I understand what happened and can try again.

#### Acceptance Criteria

1. WHEN the Pattern Analyzer System fails to fetch patterns from Appwrite Backend, THE Pattern Analyzer System SHALL log the error to the console
2. WHEN the Pattern Analyzer System fails to fetch statistics from Appwrite Backend, THE Pattern Analyzer System SHALL log the error to the console
3. WHEN the Pattern Analyzer System fails to trigger pattern analysis, THE Pattern Analyzer System SHALL display an error message to the user
4. WHEN the Pattern Analyzer System fails to mark a pattern as resolved, THE Pattern Analyzer System SHALL display an error message to the user
5. THE Pattern Analyzer System SHALL continue displaying previously loaded data when fetch operations fail

### Requirement 9: Navigate Between Screens

**User Story:** As a NEET student, I want to navigate smoothly between the dashboard and pattern details, so that I can explore patterns without losing my place.

#### Acceptance Criteria

1. THE Pattern Analyzer System SHALL use file-based routing for navigation between screens
2. WHEN the user taps a pattern card, THE Pattern Analyzer System SHALL navigate to the pattern detail screen with a slide-in animation
3. WHEN the user taps the back button on the pattern detail screen, THE Pattern Analyzer System SHALL navigate back to the dashboard
4. THE Pattern Analyzer System SHALL pass the complete pattern object to the detail screen during navigation
5. THE Pattern Analyzer System SHALL maintain the dashboard scroll position when returning from the detail screen

### Requirement 10: Display Subject-Specific Pattern Tags

**User Story:** As a NEET student, I want to see which NEET subjects are affected by each pattern, so that I can prioritize my study focus.

#### Acceptance Criteria

1. WHEN a pattern affects multiple NEET subjects, THE Pattern Analyzer System SHALL display subject tags showing the distribution
2. THE Pattern Analyzer System SHALL display tags for Physics, Chemistry, and Biology when applicable
3. THE Pattern Analyzer System SHALL include the mistake count for each subject in the tag label
4. THE Pattern Analyzer System SHALL display subject tags in a horizontal scrollable list if there are multiple subjects
5. WHEN a pattern does not have subject-specific data, THE Pattern Analyzer System SHALL not display subject tags
