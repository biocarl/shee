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

  constructor(private queueService: QueueService) {
  }

  populateWithData(data: PresenterSubscribeResponse): void {
   this.questionEvent = data as PollPresenterSubscribeResponse;
   this.questionResponses = Array(this.questionEvent.questions.length).fill(0);
  }

  ngOnInit(): void {
    // TODO DEBUG remove
    /*
    this.questionEvent = {
      id: "tester-id",
      interaction: "poll",
      questions : ["What is life?", "Why you?", "When will the sun go down?"]
    };
    this.questionResponses = Array(this.questionEvent.questions.length).fill(0);
    */
    // TODO DEBUG remove


    // ACTUAL CODE
    this.queueService.onClientEvent<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      console.log("Poll answer received:"+pollSubscriptionEvent);
      // TODO HERE YOU WERE
      // For real-life testing you need to comment in onInit from presenter.component
      // Take care to remove static data from poll-presenter since the id won't match
      // Add a lot of console logs so that you can analyze where to look at

      // But here is filtered if the poll actually maps to the published question id
      if(this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent?.id) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
      }
    });
  }
}
