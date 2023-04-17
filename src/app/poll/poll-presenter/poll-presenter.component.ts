import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {PollClientSubscribeResponse} from "../poll-client-subscribe-response";
import {PresenterMessage} from "../../presenter-message";

@Component({
  selector: 'app-poll-presenter',
  templateUrl: './poll-presenter.component.html',
  styleUrls: ['./poll-presenter.component.css']
})
export class PollPresenterComponent implements PresenterView, OnInit {
  questionEvent ?: PollPresenterSubscribeResponse;
  questionResponses ?: number[];

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      if (!this.questionEvent) {
        console.error("Error: question event was not populated by parent client component");
        return;
      }

      if (this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent.question_id
          && this.isInValidTimeRangeIfSet()) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
      }

      if (pollSubscriptionEvent.participantName) {
        console.log(pollSubscriptionEvent.participantName + ' has voted for ' + this.questionEvent.answers[pollSubscriptionEvent.voting.indexOf(1)]);
      }
    });
  }

  getPercentage(index: number): number {
    if (!this.questionResponses) {
      return 0;
    }

    const totalVotes = this.questionResponses.reduce((acc, curr) => acc + curr, 0);
    if (totalVotes === 0) {
      return 0;
    }

    return (this.questionResponses[index] / totalVotes) * 100;
  }

  private isInValidTimeRangeIfSet() {
    if(this.questionEvent?.timer !== undefined){
      return this.questionEvent.timer > 0;
    }
    return true;
  }

  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.answers.length).fill(0);
    this.initializeTimer();
  }

  private initializeTimer() {
    if (this.questionEvent?.timer) {
      const timerInterval = setInterval(() => {
        if (this.questionEvent && this.questionEvent.timer) {
          this.questionEvent.timer -= 1;
          if (this.questionEvent.timer <= 0) {
            clearInterval(timerInterval);
          }
        }
      }, 1000);
    }
  }
}
