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
    },
    {
      id: 9,
      question: 'Why is continuous employee training important?',
      answer: 'It ensures employees stay current with industry standards, improves job performance, increases engagement, and helps organizations remain competitive.',
      category: 'Best Practices'
    },
    {
      id: 10,
      question: 'What role does training tracking play in compliance?',
      answer: 'It provides documented proof that employees have completed required certifications and training, which is essential for regulatory compliance and audits.',
      category: 'Compliance'
    }
  ];

  private usedQuestionIds: Set<number> = new Set();

  getAllQuestions(): Observable<QuizQuestion[]> {
    return of([...this.quizQuestions]);
  }

  getRandomQuestion(): Observable<QuizQuestion | null> {
    // Check if question pool is empty
    if (this.quizQuestions.length === 0) {
      return of(null);
    }

    const availableQuestions = this.quizQuestions.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (availableQuestions.length === 0) {
      // Reset if all questions have been used and try again
      this.usedQuestionIds.clear();
      // After clearing, all questions are available again
      const allQuestions = [...this.quizQuestions];
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      const selectedQuestion = allQuestions[randomIndex];
      this.usedQuestionIds.add(selectedQuestion.id);
      return of(selectedQuestion);
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
    const categories = [...new Set(this.quizQuestions.map(q => q.category).filter((c): c is string => c !== undefined))];
    return of(categories);
  }
}
