import { TestBed } from '@angular/core/testing';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all questions', (done) => {
    service.getAllQuestions().subscribe(questions => {
      expect(questions.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return a random question', (done) => {
    service.getRandomQuestion().subscribe(question => {
      expect(question).toBeTruthy();
      expect(question?.id).toBeDefined();
      expect(question?.question).toBeDefined();
      expect(question?.answer).toBeDefined();
      done();
    });
  });

  it('should reset used questions', (done) => {
    service.resetUsedQuestions();
    service.getRandomQuestion().subscribe(question => {
      expect(question).toBeTruthy();
      done();
    });
  });

  it('should return categories', (done) => {
    service.getCategories().subscribe(categories => {
      expect(categories.length).toBeGreaterThan(0);
      done();
    });
  });
});
