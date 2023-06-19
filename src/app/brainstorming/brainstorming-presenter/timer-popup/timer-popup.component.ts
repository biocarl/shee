import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

export interface DialogData {
  timer?: number,
  choice: boolean,
  stage: string
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
  ) { }
  selectedOption: string = "No";
 
  onStartClick(): void {
    if (this.isTimerValid()) {
      this.data.choice = true;
    }
  }


  private isTimerValid(): boolean {
    const min = 1;

    if (this.data.timer && this.data.timer < min) {
      alert(`Please enter a number greater than:  ${min}`);
      return false;
    }
    return true;
  }

}
