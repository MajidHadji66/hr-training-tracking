// FIX: Add signal to imports from @angular/core
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmCompleteDialogComponent } from './confirm-complete-dialog.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../data.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { filter, switchMap, of } from 'rxjs';
import { combineLatest } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  imports: [
    RouterLink,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DatePipe,
    CommonModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeComponent {
  private dialog = inject(MatDialog);
  // Used to trigger reloads
  private reloadSignal = signal(0);

  openConfirmDialog(course: any): void {
    const dialogRef = this.dialog.open(ConfirmCompleteDialogComponent);
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.completeCourse(course);
      }
    });
  }

  completeCourse(course: any): void {
    const emp = this.employee();
    if (!emp) return;
    // Format completionDate as 'YYYY-MM-DD'
    const now = new Date();
    const completionDate =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0');
    this.dataService.markCourseCompleted(emp.id, course.id, completionDate).subscribe({
      next: (res) => {
        console.log('Course marked as completed:', res);
        // Trigger reload to update UI
        this.reloadSignal.update((v) => v + 1);
      },
      error: (err) => {
        console.error('Error marking course as completed:', err);
      },
    });
  }
  // Helper to merge requiredCourses and trainingRecords for display
  getRequiredCoursesWithStatus() {
    const emp = this.employee();
    if (!emp || !emp.requiredCourses) return [];

    // Deduplicate required courses by ID
    const uniqueCourses = Object.values(
      emp.requiredCourses.reduce((acc: Record<number, any>, course: any) => {
        acc[course.id] = course;
        return acc;
      }, {} as Record<number, any>)
    );
    return uniqueCourses.map((course: any) => {
      const record = emp.trainingRecords?.find((tr: any) => tr.courseId === course.id);
      return {
        id: course.id,
        name: course.name || 'Untitled Course',
        description: course.description || '',
        status: record?.completionDate ? 'Completed' : 'Pending',
        completionDate: record ? record.completionDate : null,
      };
    });
  }
  private readonly dataService = inject(DataService);

  id = input.required<string>();

  // Reactive stream that fetches data when the employee ID changes or reload is triggered
  private employeeData$ = combineLatest([
    toObservable(this.id).pipe(filter((id) => !!id)),
    toObservable(this.reloadSignal),
  ]).pipe(
    switchMap(([id]) => {
      const employeeId = parseInt(id, 10);
      if (!isNaN(employeeId)) {
        return this.dataService.getEmployeeFullDetailsById(employeeId);
      }
      return of(null);
    })
  );

  private courseData$ = combineLatest([
    toObservable(this.id).pipe(filter((id) => !!id)),
    toObservable(this.reloadSignal),
  ]).pipe(
    switchMap(([id]) => {
      const employeeId = parseInt(id, 10);
      if (!isNaN(employeeId)) {
        return this.dataService.getEmployeeCourses(employeeId);
      }
      return of([]);
    })
  );

  employee = toSignal(this.employeeData$);
  courses = toSignal(this.courseData$, { initialValue: [] });

  // For AI Training Analysis
  isAnalyzing = signal(false);
  analysisResult = signal('');
  analysisError = signal('');

  analyzeTraining(): void {
    const emp = this.employee() as {
      firstName?: string;
      lastName?: string;
      position?: { title?: string };
      department?: { name?: string };
    };
    if (!emp) {
      this.analysisError.set('Cannot analyze training without employee data.');
      return;
    }

    this.isAnalyzing.set(true);
    this.analysisError.set('');
    this.analysisResult.set('');

    const trainingStatusText = (this.courses() as Array<{ name?: string; status?: string }>)
      .map((course) => `- ${course.name}: ${course.status}`)
      .join('\n');

    const prompt = `
      You are an expert HR assistant. Your tone is professional, encouraging, and clear.
      Analyze the following training data for an employee and provide a brief summary in HTML format within a single <p> tag.
      The summary is for a performance review.
      Start by mentioning the employee's progress (e.g., "John has completed 2 of 3 required courses.").
      If all courses are complete, commend the employee for their diligence.
      If any courses are pending, list them clearly in a bulleted list using <ul> and <li> tags within the main <p> tag.
      Conclude with an encouraging sentence.

      Employee Name: ${emp.firstName ?? ''} ${emp.lastName ?? ''}
      Position: ${emp.position?.title ?? ''}
      Department: ${emp.department?.name ?? ''}

      Training Status:
      ${trainingStatusText}

      Please provide the HTML summary below.
    `;

    this.dataService.analyzeTraining(prompt).subscribe({
      next: (response) => {
        this.analysisResult.set(response.analysis);
        this.isAnalyzing.set(false);
      },
      error: (err: Error) => {
        console.error(err);
        this.analysisError.set(err.message);
        this.isAnalyzing.set(false);
      },
    });
  }
}
