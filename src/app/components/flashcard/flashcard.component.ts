import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { QuizService } from '../../../quiz.service';
import { QuizQuestion } from '../../../models';

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashcardComponent {
  private readonly quizService = inject(QuizService);
  
  currentQuestion = signal<QuizQuestion | null>(null);
  showAnswer = signal<boolean>(false);
  questionCount = signal<number>(0);

  constructor() {
    this.loadNextQuestion();
  }

  loadNextQuestion(): void {
    this.showAnswer.set(false);
    this.quizService.getRandomQuestion().subscribe(question => {
      this.currentQuestion.set(question);
      if (question) {
        this.questionCount.update(count => count + 1);
      }
    });
  }

  toggleAnswer(): void {
    this.showAnswer.update(current => !current);
  }

  resetQuiz(): void {
    this.quizService.resetUsedQuestions();
    this.questionCount.set(0);
    this.loadNextQuestion();
  }
}
