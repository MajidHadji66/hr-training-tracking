import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { QuizQuestion } from './models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  // Sample quiz questions - in a real app, these would come from HTML files or a backend
  private quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: 'What is the purpose of the HR Training Tracker system?',
      answer: 'To help HR departments manage and track employee training programs, including courses, employees, and departments.',
      category: 'System Overview'
    },
    {
      id: 2,
      question: 'What technologies are used in the frontend of this application?',
      answer: 'Angular 20, TypeScript, SCSS, and Angular Material',
      category: 'Technical'
    },
    {
      id: 3,
      question: 'What is the backend technology stack?',
      answer: 'Node.js with Express.js',
      category: 'Technical'
    },
    {
      id: 4,
      question: 'What database system is planned for this application?',
      answer: 'MySQL / Cloud SQL',
      category: 'Technical'
    },
    {
      id: 5,
      question: 'What is the purpose of employee training tracking?',
      answer: 'To monitor required courses, track completion progress, and ensure employees meet their professional development requirements.',
      category: 'HR Process'
    },
    {
      id: 6,
      question: 'How do positions relate to courses in the system?',
      answer: 'Positions can have required courses assigned to them, so all employees in that position will need to complete those courses.',
      category: 'System Features'
    },
    {
      id: 7,
      question: 'What is a completion percentage?',
      answer: 'The percentage of required courses that an employee has completed out of their total assigned courses.',
      category: 'Metrics'
    },
    {
      id: 8,
      question: 'What are the two main user views in the application?',
      answer: 'Admin Dashboard (for managing all employees and training) and Employee Portal (for viewing personal training)',
      category: 'System Features'
    }
  ];

  private usedQuestionIds: Set<number> = new Set();

  getAllQuestions(): Observable<QuizQuestion[]> {
    return of([...this.quizQuestions]);
  }

  getRandomQuestion(): Observable<QuizQuestion | null> {
    const availableQuestions = this.quizQuestions.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (availableQuestions.length === 0) {
      // Reset if all questions have been used
      this.usedQuestionIds.clear();
      return this.getRandomQuestion();
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    this.usedQuestionIds.add(selectedQuestion.id);
    
    return of(selectedQuestion);
  }

  resetUsedQuestions(): void {
    this.usedQuestionIds.clear();
  }

  getQuestionsByCategory(category: string): Observable<QuizQuestion[]> {
    const filtered = this.quizQuestions.filter(q => q.category === category);
    return of(filtered);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.quizQuestions.map(q => q.category).filter(c => c !== undefined))];
    return of(categories as string[]);
  }
}
