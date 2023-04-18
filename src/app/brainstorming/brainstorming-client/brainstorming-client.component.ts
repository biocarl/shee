import {Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {PresenterMessage} from "../../presenter-message";
import {BrainstormingPresenterSubscribeResponse} from "../brainstorming-presenter-subscribe-response";
import {GroupService} from "../../group.service";
import {QueueService} from "../../queue.service";
import {ParticipantService} from "../../participant.service";
import {BrainstormingClientPublishRequest} from "../brainstorming-client-publish-request";


interface Colors {
  [key: string]: string;
  red: string;
  orange: string;
  yellow: string;
  olive: string;
  green: string;
  teal: string;
  blue: string;
  violet: string;
  purple: string;
  pink: string;
}

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
  bgColor: string = "var(--menuColor_dark)";


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

  getColors(): Colors {
    return {
      red: '#db2828',
      orange: '#f2711c',
      yellow: '#fbbd08',
      olive: '#b5cc18',
      green: '#21ba45',
      teal: '#00b5ad',
      blue: '#2185d0',
      violet: '#6435c9',
      purple: '#a333c8',
      pink: '#e03997'
    };
  }


  changeColor(color: string) {
    const colors = this.getColors();
    this.bgColor = colors[color];
  }
}
