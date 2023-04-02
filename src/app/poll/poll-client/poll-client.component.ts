import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {PollClientPublishRequest} from "../poll-client-publish-request";
import {PresenterSubscribeResponse} from "../../dto/presenter-subscribe-response";
import {ClientView} from "../../client-view";

@Component({
  selector: 'app-vote-selector',
  templateUrl: './poll-client.component.html',
  styleUrls: ['./poll-client.component.css']
})
export class PollClientComponent implements ClientView {

  questionEvent ? : PollPresenterSubscribeResponse;

  colorPalette : string [] = [ "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44"];
  voted: boolean = false;

  constructor(private route: ActivatedRoute, private groupService : GroupService, private queueService : QueueService) {}

  voteForQuestion(voteSelectionIndex: number) {
    if(!this.questionEvent?.questions) return

    // Wait for the others
    this.voted = true;
    this.groupService.hasQuestions = false;

    // handle vote
    const voting : number[] = Array(this.questionEvent.questions.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message : PollClientPublishRequest =  {
        event: "poll_event",
        question_id: this.questionEvent.id,
        voting : voting,
        participant : "biocarl" // TODO This you will retrieve from the frontend
      };

    this.queueService.publishClientEvent<PollClientPublishRequest>(message);
  }

  populateWithData(data : PresenterSubscribeResponse) {
    this.questionEvent = data as PollPresenterSubscribeResponse;
  }
}
