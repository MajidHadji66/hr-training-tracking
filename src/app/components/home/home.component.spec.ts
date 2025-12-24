import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { DataService } from '../../../data.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock Data
// Mock Data
const MOCK_EMPLOYEES = [{
  id: 1, firstName: 'John', lastName: 'Doe', positionId: 1,
  email: 'john@example.com', hireDate: '2023-01-01', address1: '123 Main', city: 'City', state: 'ST', postal: '12345'
}];

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let dataServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    dataServiceMock = {
      getAllEmployees: jasmine.createSpy('getAllEmployees').and.returnValue(of(MOCK_EMPLOYEES))
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: DataService, useValue: dataServiceMock }
      ]
    })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize employees signal', () => {
    expect(dataServiceMock.getAllEmployees).toHaveBeenCalled();
    expect(component.employees()).toEqual(MOCK_EMPLOYEES);
  });

  describe('viewMyTraining', () => {
    it('should navigate to employee page if id is selected', () => {
      component.selectedEmployeeId.set('1');
      component.viewMyTraining();
      expect(router.navigate).toHaveBeenCalledWith(['/employee', '1']);
    });

    it('should NOT navigate if id is empty', () => {
      component.selectedEmployeeId.set('');
      component.viewMyTraining();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
