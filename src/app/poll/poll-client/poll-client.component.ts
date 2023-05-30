import {Component} from '@angular/core';
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {PollClientPublishRequest} from "../poll-client-publish-request";
import {PresenterMessage} from "../../presenter-message";
import {ParticipantService} from "../../participant.service";
import {View} from "../../view";

@Component({
  selector: 'app-vote-selector',
  templateUrl: './poll-client.component.html',
  styleUrls: ['./poll-client.component.css']
})
/**
 * The PollClientComponent is used to display the different polling options and send the selected option to the presenter.
 * @component
 * @implements View
 */
export class PollClientComponent implements View {
  questionEvent?: PollPresenterSubscribeResponse;
  participantHasVoted: boolean = false;

  constructor(private groupService : GroupService, private queueService : QueueService, private participantService: ParticipantService) {}

  publishVoteForParticipant(voteSelectionIndex: number) {
    if (!this.questionEvent?.answers) return
    // Participant can't vote twice
    this.participantHasVoted = true;
    this.groupService.hasQuestions = false;

    const voting: number[] = Array(this.questionEvent.answers.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message: PollClientPublishRequest = {
      interaction: "poll",
      questionID: this.questionEvent.questionID,
      voting: voting,
      participantName: this.participantService.getParticipantName()
    };
    this.queueService.publishMessageToClientChannel<PollClientPublishRequest>(message);
  }

  initializeComponent(data : PresenterMessage) {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.initializeTimer();
  }

  private initializeTimer() {
    if (this.questionEvent?.timer) {
      const timerInterval = setInterval(() => {
        if (this.questionEvent && this.questionEvent.timer) {
          this.questionEvent.timer -= 1;
          if (this.questionEvent.timer <= 0) {
            clearInterval(timerInterval);
          }
        }
      }, 1000);
    }
  }
}
