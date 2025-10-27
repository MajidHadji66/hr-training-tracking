import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { forkJoin } from 'rxjs';

import { DataService } from '../../../data.service';
import { Course, Employee, Position } from '../../../models';

@Component({
  selector: 'app-course-management',
  standalone: true,
  templateUrl: './course-management.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  styleUrls: ['./course-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent {
  // Inputs from the parent AdminComponent
  courses = input.required<Course[]>();
  positions = input.required<Position[]>();
  employees = input.required<Employee[]>();

  private readonly dataService = inject(DataService);

  // Internal state for this component
  selectedCourseId = signal<number | null>(null);
  isLoadingCourseDetails = signal(false);
  isSaving = signal(false);
  assignedEmployees = signal<Employee[]>([]);

  // FIX: Directly inject FormBuilder here to avoid type inference issues with the class property.
  assignmentForm = inject(FormBuilder).group({
    positions: [[] as number[]],
    employees: [[] as number[]],
  });

  getEmployeePosition(employeeId: number): Position | undefined {
    const employee = this.employees().find((e) => e.id === employeeId);
    if (!employee) return undefined;
    return this.positions().find((p) => p.id === employee.positionId);
  }

  selectedCourse = computed(() => {
    const id = this.selectedCourseId();
    if (!id) return null;
    return this.courses().find((c) => c.id === id) ?? null;
  });

  onCourseSelectionChange(courseId: number | null): void {
    this.selectedCourseId.set(courseId);
    if (!courseId) {
      this.assignedEmployees.set([]);
      this.assignmentForm.reset({ positions: [], employees: [] });
      return;
    }

    this.isLoadingCourseDetails.set(true);
    this.assignmentForm.reset({ positions: [], employees: [] });

    forkJoin({
      positionIds: this.dataService.getPositionIdsForCourse(courseId),
      employees: this.dataService.getEmployeesForCourse(courseId),
    }).subscribe(({ positionIds, employees }) => {
      this.assignmentForm.patchValue({ positions: positionIds });
      this.assignmentForm.markAsPristine();
      this.assignedEmployees.set(employees);
      this.isLoadingCourseDetails.set(false);
    });
  }

  saveAssignments(): void {
    const courseId = this.selectedCourseId();
    if (!courseId || this.assignmentForm.pristine) return;

    this.isSaving.set(true);

    const { positions, employees } = this.assignmentForm.value;

    const positionAssignments$ = this.dataService.assignCourseToPositions(
      courseId,
      positions ?? []
    );
    const employeeAssignments$ = this.dataService.assignCourseToEmployees(
      courseId,
      employees ?? []
    );

    forkJoin([positionAssignments$, employeeAssignments$]).subscribe({
      next: () => {
        this.dataService.getEmployeesForCourse(courseId).subscribe((employees) => {
          this.assignedEmployees.set(employees);
        });
        // Clear only the individual employee assignments after saving
        this.assignmentForm.patchValue({ employees: [] });
        this.assignmentForm.markAsPristine();
      },
      error: (err) => {
        console.error('Failed to save assignments', err);
        this.isSaving.set(false);
      },
      complete: () => {
        this.isSaving.set(false);
      },
    });
  }
}
