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
import {BrainstormingPresenterComponent} from "../brainstorming-presenter/brainstorming-presenter.component";


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
  is_sent: boolean = false;

  constructor(private groupService: GroupService, private queueService: QueueService, private participantService: ParticipantService) {
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
  }

  sendIdea() {

    if (!this.ideaEvent?.question_id) return

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
  }

  protected readonly BrainstormingPresenterComponent = BrainstormingPresenterComponent;
}
