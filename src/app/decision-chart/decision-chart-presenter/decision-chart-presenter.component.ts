import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";
import {PollPresenterSubscribeResponse} from "../../poll/poll-presenter-subscribe-response";
import {DecisionClientSubscribeResponse} from "../decision-client-subscribe-response";
import {DecisionPresenterSubscribeResponse} from "../decision-presenter-subscribe-response";
import {PairPresenterComponent} from "../../pair/pair-presenter/pair-presenter.component";
import {PairClientComponent} from "../../pair/pair-client/pair-client.component";


@Component({
  selector: 'app-decision-chart-presenter',
  templateUrl: './decision-chart-presenter.component.html',
  styleUrls: ['./decision-chart-presenter.component.css']
})
export class DecisionChartPresenterComponent implements OnInit, PresenterView {
  questionEvent ? : DecisionPresenterSubscribeResponse;
  questionResponses ? : number[];

  constructor(private queueService: QueueService) {}


  ngOnInit(): void {
    this.queueService.listenToClientChannel<DecisionClientSubscribeResponse>(pollSubscriptionEvent => {
      if(!this.questionEvent){
        console.error("Error: question event was not populated by parent client component");
        return;
      }

      if(this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent.question_id) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
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


  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as DecisionPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.questions.length).fill(0);

  }

}
