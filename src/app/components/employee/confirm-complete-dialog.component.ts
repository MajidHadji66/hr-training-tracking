import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-complete-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Completion</h2>
    <mat-dialog-content>
      <p>Are you sure about completing?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-stroked-button
        color="warn"
        style="margin-right: 8px; min-width: 80px;"
        (click)="onNoClick()"
      >
        No
      </button>
      <button mat-raised-button color="primary" style="min-width: 80px;" (click)="onYesClick()">
        Yes
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule],
})
export class ConfirmCompleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmCompleteDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
    console.log('User confirmed completion');
  }
}
