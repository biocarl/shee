import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {PollClientSubscribeResponse} from "../../poll/poll-client-subscribe-response";
import {BrainstormingClientSubscribeResponse} from "../brainstorming-client-subscribe-response";
import {PollPresenterSubscribeResponse} from "../../poll/poll-presenter-subscribe-response";

@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css']
})
export class BrainstormingPresenterComponent implements PresenterView, OnInit {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  ideaResponses : string[] = [];

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<BrainstormingClientSubscribeResponse>(brainstormingSubscriptionEvent => {
      if (!this.ideaEvent) {
        console.error("Error: idea event was not populated by parent client component");
        return;
      }
      console.log("HIER" + this.ideaEvent.question_id)
      console.log(brainstormingSubscriptionEvent.question_id)
      if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id) {
        console.log(JSON.stringify(brainstormingSubscriptionEvent))
        this.ideaResponses.push(brainstormingSubscriptionEvent.idea_text);
      }

    });
  }

  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
  }

  stopBrainstorming () : void{
   /* this.queueService.publishMessageToPresenterChannel()
    */
  }

}
