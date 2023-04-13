import { Component } from '@angular/core';
import {ClientView} from "../../client-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {ParticipantService} from "../../participant.service";
import {BrainstormingClientPublishRequest} from "../brainstorming-client-publish-request";


@Component({
  selector: 'app-brainstorming-client',
  templateUrl: './brainstorming-client.component.html',
  styleUrls: ['./brainstorming-client.component.css']
})
export class BrainstormingClientComponent implements ClientView{
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  openForIdeas: boolean = true;
  idea_text: string = "";

  constructor(private groupService: GroupService, private queueService: QueueService, private participantService: ParticipantService) {
  }

  sendIdea() {
    console.log("test");
    if (!this.ideaEvent?.question_id) return
    console.log("test1");

    const idea: BrainstormingClientPublishRequest = {
      interaction: "brainstorming",
      idea_text: this.idea_text,
      participantName: this.participantService.getParticipantName()
    };
    console.log(idea.idea_text);
    this.queueService.publishMessageToClientChannel<BrainstormingClientPublishRequest>(idea);
  }

  initializeComponent(data: PresenterMessage) {
    console.log(JSON.stringify(data));
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
  }

}
