import {Component, OnInit} from '@angular/core';
import {QueueService} from "../../queue.service";
import {PresenterView} from "../../presenter-view";
import {PresenterMessage} from "../../presenter-message";
import {QrCodeService} from "../../qr-code.service";
import {GroupService} from "../../group.service";

interface CounterClientSubscribeResponse {
  participantName: string;
  interaction: string;
}

@Component({
  selector: 'app-counter-presenter',
  templateUrl: './pair-presenter.component.html',
  styleUrls: ['./pair-presenter.component.css']
})
export class PairPresenterComponent implements OnInit, PresenterView {
  counter: number = 0;
  qrCodeUrl ?: string;

  constructor(private queueService: QueueService, private qrCodeService: QrCodeService, private groupService : GroupService) {
    this.qrCodeService.generateQrCode(`https://shee.app/${this.groupService.getGroupName()}`).then(url => {
      this.qrCodeUrl = url;
    });
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<CounterClientSubscribeResponse>(counterSubscriptionEvent => {
      if (counterSubscriptionEvent.interaction && counterSubscriptionEvent.interaction === "pair") {
        this.counter++;
      }
      if (counterSubscriptionEvent.participantName) {
        console.log(counterSubscriptionEvent.participantName + " is listening.")
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {}
}
