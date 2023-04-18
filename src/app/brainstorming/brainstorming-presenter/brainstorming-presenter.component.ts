import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {BrainstormingClientSubscribeResponse} from "../brainstorming-client-subscribe-response";
import {BrainstormingPresenterStartVotingRequest} from "../brainstorming-presenter-start-voting-request";
import {v4 as uuidv4} from "uuid";


@Component({
  selector: 'app-brainstorming-presenter',
  templateUrl: './brainstorming-presenter.component.html',
  styleUrls: ['./brainstorming-presenter.component.css']
})
export class BrainstormingPresenterComponent implements PresenterView, OnInit {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  voting_open: boolean = false;
  votes?: number[];
  timerLength?: number;

  constructor(private queueService: QueueService) {
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<BrainstormingClientSubscribeResponse>(brainstormingSubscriptionEvent => {
      if (!this.ideaEvent) {
        console.error("Error: idea event was not populated by parent client component");
        return;
      }
      if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id && !brainstormingSubscriptionEvent.idea_voting) {
        this.ideaEvent.ideas.push(brainstormingSubscriptionEvent.idea_text);

      } else if (this.ideaEvent.question_id == brainstormingSubscriptionEvent.question_id && brainstormingSubscriptionEvent.idea_voting) {
        this.votes = this.votes?.map((total, index) => total + brainstormingSubscriptionEvent.idea_voting[index])
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    if (!this.ideaEvent.ideas) {
      this.ideaEvent.ideas = [];
    }
    if (this.ideaEvent.voting_in_progress) {
      this.voting_open = this.ideaEvent.voting_in_progress;
      this.votes = Array(this.ideaEvent.ideas.length).fill(0);
    }
    this.initializeTimer();
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
      ideas: this.ideaEvent.ideas,
      question: this.ideaEvent?.question,
      question_id: uuidv4(),
      single_choice: singleChoice,
      voting_in_progress: true
    };
    if (this.timerLength) {
      payload.timer = this.timerLength;
    }
    this.queueService.publishMessageToPresenterChannel(payload);
  }

  stopVoting() {
    if (!this.ideaEvent?.question_id) return
    const payload: BrainstormingPresenterStartVotingRequest = {
      interaction: "brainstorming",
      ideas: this.ideaEvent.ideas,
      question: this.ideaEvent?.question,
      question_id: this.ideaEvent?.question_id,
      single_choice: false,
      voting_in_progress: false
    };
    this.voting_open = false;
    //TODO: implement the function from stopBrainstorming
  }

  private initializeTimer() {
    if (this.ideaEvent?.timer) {
      const timerInterval = setInterval(() => {
        if (this.ideaEvent && this.ideaEvent.timer) {
          this.ideaEvent.timer -= 1;
          if (this.ideaEvent.timer <= 0) {
            this.stopVoting();
            clearInterval(timerInterval);
          }
        }
      }, 1000);
    }
  }
}

