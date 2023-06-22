import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

export interface DialogData {
  timer?: number,
  choice: boolean,
  stage: string,
  isMultivote:boolean
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
  votingOption:string="No";

  onStartClick(): void {
    if(this.selectedOption==='No'){
      this.data.choice = true;
      this.data.timer = undefined;
    }
    else if (this.isTimerValid()) {
      this.data.choice = true;
      this.data.isMultivote= this.votingOption==="Yes";
    }
  }

  private isTimerValid(): boolean {
    const min = 1;

    if (this.data.timer &&(isNaN(this.data.timer) ||  this.data.timer < min)) {
      alert(`Please enter a number greater than:  ${min}`);
      return false;
    }
    return true;
  }
}

