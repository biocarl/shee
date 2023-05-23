import { Component } from '@angular/core';
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";
import {ClientView} from "../../client-view";
import {DecisionPresenterSubscribeResponse} from "../decision-presenter-subscribe-response";
import {DecisionClientPublishRequest} from "../decision-client-publish-request";


@Component({
  selector: 'app-decision-chart-client',
  templateUrl: './decision-chart-client.component.html',
  styleUrls: ['./decision-chart-client.component.css']
})
export class DecisionChartClientComponent implements ClientView {
  questionEvent ? : DecisionPresenterSubscribeResponse;
  voted: boolean = false;

  constructor(private groupService : GroupService, private queueService : QueueService) {}

  voteForQuestion(voteSelectionIndex: number) {
    if(!this.questionEvent?.answers) return
    // You can't vote twice
    this.voted = true;
    this.groupService.hasQuestions = false;

    // handle vote
    const voting : number[] = Array(this.questionEvent.answers.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message : DecisionClientPublishRequest =  {
      interaction: "decision",
      questionID: this.questionEvent.questionID,
      voting : voting,
      participantName : "unknown" // TODO Not used for now
    };
    this.queueService.publishMessageToClientChannel<DecisionClientPublishRequest>(message);
  }

  initializeComponent(data : PresenterMessage) {
    this.questionEvent = data as DecisionPresenterSubscribeResponse;
  }
}
