# Flashcard Quiz Feature

## Overview

The HR Training Tracker now includes an interactive flashcard quiz feature that helps users test and reinforce their knowledge about HR training concepts, system features, and best practices.

## Features

- **Random Question Selection**: Questions are randomly selected from the available pool
- **Flip Animation**: Beautiful card flip animation to reveal answers
- **Category Tags**: Questions are organized by category (System Overview, Technical, HR Process, etc.)
- **Progress Tracking**: Keep track of how many questions you've viewed in the current session
- **Reset Function**: Start over with a fresh set of questions at any time

## How to Access

1. From the home page, click on the "Training Flashcards" card
2. Or navigate directly to `/flashcards` in your browser

## How to Use

1. **View Question**: A random question will be displayed on the card's front face
2. **Reveal Answer**: Click the "Show Answer" button or click the card itself to flip and see the answer
3. **Next Question**: Click "Next Question" to get another random question
4. **Reset Quiz**: Click "Reset Quiz" to clear the question history and start fresh

## Adding Custom Quiz Questions

### Method 1: Update the Quiz Service (Current Implementation)

The current implementation stores questions in the `QuizService` (`src/quiz.service.ts`). To add new questions:

1. Open `src/quiz.service.ts`
2. Add new question objects to the `quizQuestions` array:

```typescript
{
  id: 11, // Use a unique ID
  question: 'Your question text here?',
  answer: 'Your answer text here.',
  category: 'Category Name' // Optional
}
```

### Method 2: Using HTML Files (Future Enhancement)

We've created a sample HTML structure in `public/quiz-questions/sample-questions.html` that demonstrates how quiz questions could be stored in HTML format:

```html
<div class="question" data-id="1" data-category="Category Name">
  <div class="question-text">Your question here?</div>
  <div class="answer-text">Your answer here.</div>
</div>
```

To fully implement HTML-based questions, you would need to:

1. Create HTML files in the `public/quiz-questions/` directory using the format shown above
2. Update the `QuizService` to parse HTML files and extract questions
3. Load questions dynamically from the HTML files

Here's a sample implementation for parsing HTML questions:

```typescript
// In quiz.service.ts
loadQuestionsFromHTML(htmlContent: string): QuizQuestion[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const questionElements = doc.querySelectorAll('.question');
  
  return Array.from(questionElements).map(el => ({
    id: parseInt(el.getAttribute('data-id') || '0'),
    question: el.querySelector('.question-text')?.textContent || '',
    answer: el.querySelector('.answer-text')?.textContent || '',
    category: el.getAttribute('data-category') || undefined
  }));
}
```

## Question Categories

Current categories include:
- **System Overview**: General information about the HR Training Tracker
- **Technical**: Technology stack and implementation details
- **HR Process**: HR-specific training processes
- **System Features**: Specific features of the application
- **Metrics**: Performance and tracking metrics
- **Best Practices**: HR training best practices
- **Compliance**: Regulatory and compliance topics

You can create your own categories when adding questions!

## Future Enhancements

Potential improvements for the flashcard feature:

1. **Import from Multiple HTML Files**: Load questions from multiple HTML files
2. **Filter by Category**: Allow users to practice questions from specific categories
3. **Difficulty Levels**: Add difficulty ratings to questions
4. **Score Tracking**: Keep track of how many questions users answer correctly
5. **Spaced Repetition**: Implement spaced repetition algorithms for better learning
6. **User Progress Persistence**: Save user progress across sessions
7. **Custom Question Sets**: Allow users to create and save their own question sets
8. **Multimedia Support**: Add support for images, audio, or video in questions/answers

## Technical Details

### Components
- **FlashcardComponent** (`src/app/components/flashcard/`): Main component for displaying flashcards
- **QuizService** (`src/quiz.service.ts`): Service for managing quiz questions and logic
- **QuizQuestion Interface** (`src/models.ts`): TypeScript interface for question objects

### Styling
- Custom CSS animations for card flip effect
- Gradient backgrounds for visual appeal
- Responsive design for mobile and desktop
- Material Design components for buttons and icons

## Accessibility

The flashcard feature includes:
- Keyboard navigation support
- Screen reader friendly content
- High contrast color schemes
- Clear visual feedback for interactions
