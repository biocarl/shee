import {Component, OnInit} from '@angular/core';
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";
import {DecisionClientSubscribeResponse} from "../decision-client-subscribe-response";
import {DecisionPresenterSubscribeResponse} from "../decision-presenter-subscribe-response";
import {View} from "../../view";


@Component({
  selector: 'app-decision-chart-presenter',
  templateUrl: './decision-chart-presenter.component.html',
  styleUrls: ['./decision-chart-presenter.component.css']
})
export class DecisionChartPresenterComponent implements OnInit, View {
  questionEvent?: DecisionPresenterSubscribeResponse;
  questionResponses?: number[];

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.subscribeToClientChannel()
  }

  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as DecisionPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.answers.length).fill(0);
  }

  private subscribeToClientChannel():void {
    this.queueService.listenToClientChannel<DecisionClientSubscribeResponse>(pollSubscriptionEvent => {
      return this.questionEvent ?
        this.updateQuestionResponses(pollSubscriptionEvent.questionID, this.questionEvent.questionID, pollSubscriptionEvent) :
        this.handleErrorResponse();
    },"DecisionChartPresenterComponent.ngOnInit");
  }

  private updateQuestionResponses(pollID: string, questionEventID: string, pollSubscriptionEvent: DecisionClientSubscribeResponse):void {
    if (this.questionResponses && this.isIdMatch(pollID, questionEventID)) {
      this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
    }
  }

  private isIdMatch(pollID: string, questionEventID: string): boolean {
    return pollID === questionEventID;
  }

  private handleErrorResponse():void {
    if (!this.questionEvent) {
      console.error("Error: question event was not populated by parent client component");
      return;
    }
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
}
