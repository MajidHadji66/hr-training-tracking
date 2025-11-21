import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { AdminComponent } from './components/admin/admin.component';
import { FlashcardComponent } from './components/flashcard/flashcard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'HR Training Tracker' },
  { path: 'admin', component: AdminComponent, title: 'Admin Dashboard' },
  { path: 'employee/:id', component: EmployeeComponent, title: 'Employee Details' },
  { path: 'flashcards', component: FlashcardComponent, title: 'Training Flashcards' },
  { path: '**', redirectTo: '' },
];
