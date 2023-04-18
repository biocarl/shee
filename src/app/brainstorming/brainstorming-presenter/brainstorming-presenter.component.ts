import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {BrainstormingClientSubscribeResponse} from "../brainstorming-client-subscribe-response";
import {BrainstormingPresenterStartVotingRequest} from "../brainstorming-presenter-start-voting-request";


@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css']
})
export class BrainstormingPresenterComponent implements PresenterView, OnInit {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  ideaResponses: string[] = [];
  voting_open: boolean = false;

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<BrainstormingClientSubscribeResponse>(brainstormingSubscriptionEvent => {
      if (!this.ideaEvent) {
        console.error("Error: idea event was not populated by parent client component");
        return;
      }
      if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id && !brainstormingSubscriptionEvent.idea_voting) {
        this.ideaResponses.push(brainstormingSubscriptionEvent.idea_text);
      }
      else if(this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id && brainstormingSubscriptionEvent.idea_voting) {
        /*
        TODO: add the votes to an array of the ideaResponses
         */
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
  }

  stopBrainstorming(): void {
    /* this.queueService.publishMessageToPresenterChannel()
     */
  }

  startVoting(): void {
    if (!this.ideaEvent?.question_id) return
    const votingOption = document.getElementById('votingOption') as HTMLSelectElement;
    const selectedOption = votingOption.value;
    let singleChoice: boolean = selectedOption === 'oneVote';
    const payload: BrainstormingPresenterStartVotingRequest = {
      interaction: "brainstorming",
      ideas: this.ideaResponses,
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent?.question_id,
      single_choice: singleChoice,
      voting_in_progress: true
    };
    this.queueService.publishMessageToPresenterChannel(payload);
    this.voting_open = true;
  }

  stopVoting() {
    if (!this.ideaEvent?.question_id) return
    const payload: BrainstormingPresenterStartVotingRequest = {
      interaction: "brainstorming",
      ideas: this.ideaResponses,
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent?.question_id,
      single_choice: false,
      voting_in_progress: false
    };
    this.queueService.publishMessageToPresenterChannel(payload);
    this.voting_open = false;
  }
}

