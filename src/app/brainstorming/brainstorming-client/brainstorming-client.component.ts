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

  constructor(private groupService: GroupService, private queueService: QueueService, private participantService: ParticipantService) {
  }

  sendIdea() {
    let idea_text: string = "";
    if (!this.ideaEvent?.idea_id) return
    const idea: BrainstormingClientPublishRequest = {
      interaction: "brainstorming",
      idea_id : this.ideaEvent.idea_id,
      idea_text: idea_text,
      participantName: this.participantService.getParticipantName()
    };
    this.queueService.publishMessageToClientChannel<BrainstormingClientPublishRequest>(idea);
  }

  initializeComponent(data: PresenterMessage) {
    this.ideaEvent = data as BrainstormingPresenterSubscribeResponse;
  }

}
