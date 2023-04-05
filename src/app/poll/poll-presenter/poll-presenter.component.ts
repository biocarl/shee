import {Component, OnInit} from '@angular/core';
import {PresenterView} from "../../presenter-view";
import {PollPresenterSubscribeResponse} from "../poll-presenter-subscribe-response";
import {QueueService} from "../../queue.service";
import {PollClientSubscribeResponse} from "../poll-client-subscribe-response";
import {PresenterMessage} from "../../presenter-message";
import {QrCodeService} from "../../qr-code.service";
import {ActivatedRoute} from "@angular/router";
import {GroupService} from "../../group.service";

@Component({
  selector: 'app-poll-presenter',
  templateUrl: './poll-presenter.component.html',
  styleUrls: ['./poll-presenter.component.css']
})
export class PollPresenterComponent implements PresenterView, OnInit {
  questionEvent ?: PollPresenterSubscribeResponse;
  questionResponses ?: number[];
  qrCodeUrl ?: string;
  roomName: string;

  constructor(private queueService: QueueService, private qrCodeService: QrCodeService, private route: ActivatedRoute, private groupService : GroupService
  ) {
    this.roomName = this.groupService.getGroupName();
    this.route.queryParams.subscribe(params => {
      this.qrCodeService.generateQrCode(`https://localhost:4200/${this.roomName}`).then(url => {
        this.qrCodeUrl = url;
      });
    });
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<PollClientSubscribeResponse>(pollSubscriptionEvent => {
      if (!this.questionEvent) {
        console.error("Error: question event was not populated by parent client component");
        return;
      }

      if (this.questionResponses && pollSubscriptionEvent.question_id === this.questionEvent.id) {
        this.questionResponses = this.questionResponses.map((total, index) => total + pollSubscriptionEvent.voting[index]);
      }

      if (pollSubscriptionEvent.participantName) {
        console.log(pollSubscriptionEvent.participantName + ' has voted for ' + this.questionEvent.answers[pollSubscriptionEvent.voting.indexOf(1)]);
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {
    this.questionEvent = data as PollPresenterSubscribeResponse;
    this.questionResponses = Array(this.questionEvent.answers.length).fill(0);
  }
}
