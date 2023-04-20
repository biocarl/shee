import {Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {ParticipantService} from "../../participant.service";
import {BrainstormingClientPublishRequest} from "../brainstorming-client-publish-request";
import {BrainstormingPresenterVotingSubscribeResponse} from "../brainstorming-presenter-voting-subscribe-response";
import {BrainstormigClientVotingPublishRequest} from "../brainstormig-client-voting-publish-request";


@Component({
  selector: 'app-brainstorming-client',
  templateUrl: './brainstorming-client.component.html',
  styleUrls: ['./brainstorming-client.component.css']
})
export class BrainstormingClientComponent implements ClientView {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  votingEvent ?: BrainstormingPresenterVotingSubscribeResponse;
  openForIdeas: boolean = true;
  idea_text: string = "";
  valid_idea_text: boolean = true;
  is_sent: boolean = false;
  is_voted: boolean = false;
  multi_vote_check: boolean [];

  constructor(private groupService: GroupService, private queueService: QueueService, private participantService: ParticipantService) {
    this.multi_vote_check = Array(this.votingEvent?.ideas.length).fill(false);
  }

  voteForIdea(voteSelectionIndex: number) {
    if (!this.votingEvent?.ideas) return

    // handle idea-vote
    const voting: number[] = Array(this.votingEvent.ideas.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message: BrainstormigClientVotingPublishRequest = {
      interaction: "brainstorming",
      idea_voting: voting,
      participantName: this.participantService.getParticipantName(),
      question_id: this.votingEvent.question_id

    };
    this.queueService.publishMessageToClientChannel<BrainstormigClientVotingPublishRequest>(message);
    if (this.votingEvent.single_choice) {
      this.is_voted = true;
    }else {
      this.multi_vote_check[voteSelectionIndex] = true;
    }

  }

  sendIdea() {

    if (!this.ideaEvent?.question_id) return
    if (this.idea_text == "") {
      this.valid_idea_text = false
      setTimeout(() => {
        this.valid_idea_text = true
      }, 1000)
      return
    } else {
      this.valid_idea_text = true;
    }

    const idea: BrainstormingClientPublishRequest = {
      interaction: "brainstorming",
      idea_text: this.idea_text,
      participantName: this.participantService.getParticipantName(),
      question_id: this.ideaEvent.question_id
    };

    this.queueService.publishMessageToClientChannel<BrainstormingClientPublishRequest>(idea);

    this.idea_text = "";
    this.is_sent = true;

    setTimeout(() => {
      this.is_sent = false
    }, 1000)
  }

  initializeComponent(data: PresenterMessage) {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
    this.votingEvent = data as BrainstormingPresenterVotingSubscribeResponse;
    this.initializeTimer();
  }

  private initializeTimer() {
    if (this.votingEvent?.timer) {
      const timerInterval = setInterval(() => {
        if (this.votingEvent && this.votingEvent.timer) {
          this.votingEvent.timer -= 1;
          if (this.votingEvent.timer <= 0) {
            clearInterval(timerInterval);
          }
        }
      }, 1000);
    }
  }
}
