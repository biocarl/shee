import {Component,OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {PollClientPublishRequest} from "../poll-client-publish-request";

@Component({
  selector: 'app-vote-selector',
  templateUrl: './poll-client.component.html',
  styleUrls: ['./poll-client.component.css']
})
export class PollClientComponent implements OnInit{

  groupName: string | null = "";
  questionId : string = "";
  questions ? : string[];

  colorPalette : string [] = [ "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44", "#F58B44"];
  voted: boolean = false;

  constructor(private route: ActivatedRoute, private groupService : GroupService, private queueService : QueueService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe( params => {
      this.groupName = params.get("group");
      if(this.groupName){
        this.groupService.setGroupName(this.groupName);
      }
      console.log(this.groupName);
    });

    this.queueService.onPresenterEvent<PollPresenterSubscribeResponse>(pollSubscriptionEvent=> {
      this.questionId = pollSubscriptionEvent.id;
      this.questions =  pollSubscriptionEvent.questions;
      this.groupService.hasQuestions = true;
      this.voted = false; //allow voting again
    });

    return;
  }


  voteForQuestion(voteSelectionIndex: number) {
    if(!this.questions) return

    // Wait for the others
    this.voted = true;
    this.groupService.hasQuestions = false;

    // handle vote
    const voting : number[] = Array(this.questions.length).fill(0);
    voting[voteSelectionIndex] = 1;
    const message : PollClientPublishRequest =  {
        event: "poll_event",
        question_id: this.questionId,
        voting : voting,
        participant : "biocarl" // TODO This you will retrieve from the frontend
      };

    this.queueService.publishClientEvent<PollClientPublishRequest>(message);
  }
}
