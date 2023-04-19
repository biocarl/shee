import {Component} from '@angular/core';
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
export class BrainstormingClientComponent implements ClientView {
  ideaEvent ?: BrainstormingPresenterSubscribeResponse;
  openForIdeas: boolean = true;
  idea_text: string = "";
  is_sent: boolean = false;
  stickyColor: string = "#FFD707FF"
  bgColor: string = "#ffd707F";

  constructor(private groupService: GroupService, private queueService: QueueService, private participantService: ParticipantService) {
  }

  sendIdea() {
    if (!this.ideaEvent?.question_id) return

    const idea: BrainstormingClientPublishRequest = {
      interaction: "brainstorming",
      idea_text: this.idea_text,
      participantName: this.participantService.getParticipantName(),
      question_id: this.ideaEvent.question_id,
      stickyColor: this.stickyColor
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

  changeColor(event : MouseEvent) {
    const element = event.target as HTMLElement;
    this.bgColor = getComputedStyle(element).getPropertyValue('background-color');
  }
}
