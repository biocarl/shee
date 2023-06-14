import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'

export interface DialogData {
 timer: number,
}

@Component({
  selector: 'app-timer-popup',
  templateUrl: './timer-popup.component.html',
  styleUrls: ['./timer-popup.component.css']
})
export class TimerPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<TimerPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
