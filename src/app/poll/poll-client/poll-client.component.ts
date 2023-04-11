import {Component} from '@angular/core';
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {PollClientPublishRequest} from "../poll-client-publish-request";
import {ClientView} from "../../client-view";
import {PresenterMessage} from "../../presenter-message";
import {ParticipantService} from "../../participant.service";

@Component({
  selector: 'app-vote-selector',
  templateUrl: './poll-client.component.html',
  styleUrls: ['./poll-client.component.css']
})
export class PollClientComponent implements ClientView {
  questionEvent ? : PollPresenterSubscribeResponse;
  voted: boolean = false;

  constructor(private groupService : GroupService, private queueService : QueueService, private participantService: ParticipantService) {}

  voteForQuestion(voteSelectionIndex: number) {
    if(!this.questionEvent?.answers) return
    // You can't vote twice
    this.voted = true;
    this.groupService.hasQuestions = false;

    // handle vote
    const voting : number[] = Array(this.questionEvent.answers.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message : PollClientPublishRequest =  {
        interaction: "poll",
        question_id: this.questionEvent.id,
        voting : voting,
        participantName : this.participantService.getParticipantName()
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
