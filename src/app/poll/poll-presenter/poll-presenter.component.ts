import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PresenterSubscribeResponse} from "../../dto/presenter-subscribe-response";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {PollClientSubscribeResponse} from "../poll-client-subscribe-response";


@Component({
  selector: 'app-poll-presenter',
  templateUrl: './poll-presenter.component.html',
  styleUrls: ['./poll-presenter.component.css']
})
export class PollPresenterComponent implements PresenterView, OnInit {
  questionEvent ? : PollPresenterSubscribeResponse;
  questionResponses ? : number[];

  constructor(private queueService: QueueService) {}


  ngOnInit(): void {
    this.queueService.onClientEvent<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      if(!this.questionEvent){
        console.error("Error: question event was not populated by parent client component");
        return;
      }

      if(this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent.id) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
      }
    });
  }

  populateWithData(data: PresenterSubscribeResponse): void {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.questions.length).fill(0);
  }
}
