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
  templateUrl: './counter-presenter.component.html',
  styleUrls: ['./counter-presenter.component.css']
})
export class CounterPresenterComponent implements OnInit, PresenterView {
  counter: number = 0;
  qrCodeUrl ?: string;

  constructor(private queueService: QueueService, private qrCodeService: QrCodeService, private groupService : GroupService) {
    this.qrCodeService.generateQrCode(`https://vag.app/${this.groupService.getGroupName()}`).then(url => {
      this.qrCodeUrl = url;
    });
  }

  ngOnInit(): void {
    this.queueService.listenToClientChannel<CounterClientSubscribeResponse>(counterSubscriptionEvent => {
      if (counterSubscriptionEvent.interaction && counterSubscriptionEvent.interaction === "counter") {
        this.counter++;
      }
      if (counterSubscriptionEvent.participantName) {
        console.log(counterSubscriptionEvent.participantName + " is listening.")
      }
    });
  }

  initializeComponent(data: PresenterMessage): void {
  }
}
