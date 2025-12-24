import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CourseManagementComponent } from './course-management.component';
import { DataService } from '../../../data.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock Data
const MOCK_COURSES = [{ id: 1, name: 'Course A', description: 'Desc A' }];
const MOCK_POSITIONS = [{ id: 1, title: 'Position A', departmentId: 10 }];
const MOCK_EMPLOYEES = [{
  id: 1, firstName: 'John', lastName: 'Doe', positionId: 1,
  email: 'john@example.com', hireDate: '2023-01-01', address1: '123 Main', city: 'City', state: 'ST', postal: '12345'
}];
// For getEmployeesForCourse
const MOCK_ASSIGNED_EMPLOYEES = [MOCK_EMPLOYEES[0]];

describe('CourseManagementComponent', () => {
  let component: CourseManagementComponent;
  let fixture: ComponentFixture<CourseManagementComponent>;
  let dataServiceMock: any;

  beforeEach(async () => {
    dataServiceMock = {
      getPositionIdsForCourse: jasmine.createSpy('getPositionIdsForCourse').and.returnValue(of([1])),
      getEmployeesForCourse: jasmine.createSpy('getEmployeesForCourse').and.returnValue(of(MOCK_ASSIGNED_EMPLOYEES)),
      assignCourseToPositions: jasmine.createSpy('assignCourseToPositions').and.returnValue(of(null)),
      assignCourseToEmployees: jasmine.createSpy('assignCourseToEmployees').and.returnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [CourseManagementComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataService, useValue: dataServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CourseManagementComponent);
    component = fixture.componentInstance;

    // Set Inputs
    fixture.componentRef.setInput('courses', MOCK_COURSES);
    fixture.componentRef.setInput('positions', MOCK_POSITIONS);
    fixture.componentRef.setInput('employees', MOCK_EMPLOYEES);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Course Selection', () => {
    it('should reset form and fetch details when course is selected', () => {
      // Act
      component.onCourseSelectionChange(1);

      // Assert
      expect(component.selectedCourseId()).toBe(1);
      expect(dataServiceMock.getPositionIdsForCourse).toHaveBeenCalledWith(1);
      expect(dataServiceMock.getEmployeesForCourse).toHaveBeenCalledWith(1);

      // Check form patch
      expect(component.assignmentForm.value.positions).toEqual([1]);
      // Check assigned employees signal
      expect(component.assignedEmployees()).toEqual(MOCK_ASSIGNED_EMPLOYEES);
    });

    it('should clear selection when id is null', () => {
      component.onCourseSelectionChange(null);
      expect(component.selectedCourseId()).toBeNull();
      expect(component.assignedEmployees()).toEqual([]);
      expect(component.assignmentForm.value.positions).toEqual([]);
    });
  });

  describe('Saving Assignments', () => {
    it('should call assign methods and reload employees on save', () => {
      // Arrange
      component.onCourseSelectionChange(1); // Load data first
      // Modify form to make it dirty (if pristine check exists)
      component.assignmentForm.enable(); // ensure enabled
      // The logic checks `this.assignmentForm.pristine`. 
      // Initial patch marks as pristine. We need to mark dirty.
      component.assignmentForm.markAsDirty();

      // Act
      component.saveAssignments();

      // Assert
      expect(dataServiceMock.assignCourseToPositions).toHaveBeenCalledWith(1, [1]);
      expect(dataServiceMock.assignCourseToEmployees).toHaveBeenCalledWith(1, []); // default mock value

      // Should reload employees
      expect(dataServiceMock.getEmployeesForCourse).toHaveBeenCalledTimes(2); // once initial, once after save
    });

    it('should not save if no course selected', () => {
      component.onCourseSelectionChange(null);
      component.assignmentForm.markAsDirty();
      component.saveAssignments();
      expect(dataServiceMock.assignCourseToPositions).not.toHaveBeenCalled();
    });

    it('should not save if form is pristine', () => {
      component.onCourseSelectionChange(1);
      // Form is patched and marked pristine in subscribe
      component.saveAssignments();
      // Should rely on pristine check
      expect(dataServiceMock.assignCourseToPositions).toHaveBeenCalledTimes(0); // Should be 0 if pristine check works
    });
  });
});
