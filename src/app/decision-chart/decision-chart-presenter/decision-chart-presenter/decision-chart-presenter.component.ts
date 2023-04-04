import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../../presenter-view";
import {QueueService} from "../../../queue.service";
import {PresenterMessage} from "../../../presenter-message";
import {PollClientSubscribeResponse} from "../../../poll/poll-client-subscribe-response";
import {PollPresenterSubscribeResponse} from "../../../poll/poll-presenter-subscribe-response";


@Component({
  selector: 'app-decision-chart-presenter',
  templateUrl: './decision-chart-presenter.component.html',
  styleUrls: ['./decision-chart-presenter.component.css']
})
export class DecisionChartPresenterComponent implements OnInit, PresenterView {
//Set to 0 if client side is rdy
  questionEvent ? : PollPresenterSubscribeResponse;
  questionResponses ? : number[];

  constructor(private queueService: QueueService) {}

  ngOnInit(): void {
    this.queueService.listenToClientChannel<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      if(!this.questionEvent){
        console.error("Error: question event was not populated by parent client component");
        return;
      }

      if(this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent.id) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
      }
    });
  }
  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.questions.length).fill(0);
  }

}
