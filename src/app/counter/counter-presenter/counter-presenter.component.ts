import {Component, OnInit} from '@angular/core';
import {QueueService} from "../../queue.service";
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";

interface CounterClientSubscribeResponse {
  participantName: string;
  interaction: string;
}

@Component({
  selector: 'app-counter-presenter',
  templateUrl: './counter-presenter.component.html',
  styleUrls: ['./counter-presenter.component.css']
})
export class CounterPresenterComponent implements OnInit, PresenterView {
  counter: number = 0;

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<CounterClientSubscribeResponse>(counterSubscriptionEvent => {
      if (counterSubscriptionEvent.interaction && counterSubscriptionEvent.interaction === "counter") {
        this.counter++;
      }
      if (counterSubscriptionEvent.participantName) {
        console.log(counterSubscriptionEvent.participantName + " is listening.")
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {
  }
}
