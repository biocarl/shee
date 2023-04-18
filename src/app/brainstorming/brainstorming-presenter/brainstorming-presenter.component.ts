import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {BrainstormingClientSubscribeResponse} from "../brainstorming-client-subscribe-response";


@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css']
})
export class BrainstormingPresenterComponent implements PresenterView, OnInit {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  ideaResponses : BrainstormingClientSubscribeResponse[] = [];
  timeRemaining: number = 0;
  countdownTimer: any;
  openForIdeas: boolean = false;

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<BrainstormingClientSubscribeResponse>(brainstormingSubscriptionEvent => {
      if (!this.ideaEvent) {
        console.error("Error: idea event was not populated by parent client component");
        return;
      }
      if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id) {
        this.ideaResponses.push(brainstormingSubscriptionEvent);
      }

    });
  }

  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
  }

  stopBrainstorming () : void{
   /* this.queueService.publishMessageToPresenterChannel()
    */
    clearInterval(this.countdownTimer);
    this.openForIdeas = false;
    this.queueService.publishMessageToClientChannel({ openForIdeas: false });
  }

  startBrainstorming(): void {
    clearInterval(this.countdownTimer);
    this.openForIdeas = true;
    this.queueService.publishMessageToClientChannel({ openForIdeas: true });

    if (this.timeRemaining > 0) {
      this.countdownTimer = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.stopBrainstorming();
        }
      }, 1000);
    }
  }


  deleteIdea(idea: BrainstormingClientSubscribeResponse, index: number) {
    this.ideaResponses.splice(index, 1);
  }



}
