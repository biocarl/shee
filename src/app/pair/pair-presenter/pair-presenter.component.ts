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
/**
 * The PairPresenterComponent is used to manage the "pair" interaction from the presenter side. It listens to events from clients and manages the state of the interaction.
 * @component
 */
export class PairPresenterComponent implements OnInit, PresenterView {
  /**
   * The current count for the "pair" interaction.
   * @public
   * @type {number}
   */
  counter: number = 0;
  /**
   * The URL of the generated QR code for the "pair" interaction.
   * @public
   * @type {string | undefined}
   */
  qrCodeUrl ?: string;

  /**
   * Initializes a new instance of the PairPresenterComponent class.
   * @constructor
   * @param {QueueService} queueService - The QueueService instance used to listen to client channel events.
   * @param {QrCodeService} qrCodeService - The QrCodeService instance used to generate the QR code for the "pair" interaction.
   * @param {GroupService} groupService - The GroupService instance used to retrieve the current group name for the "pair" interaction.
   */
  constructor(private queueService: QueueService, private qrCodeService: QrCodeService, private groupService : GroupService) {
    this.qrCodeService.generateQrCode(`https://vag.app/${this.groupService.getGroupName()}`).then(url => {
      this.qrCodeUrl = url;
    });
  }

  /**
   * Initializes the PairPresenterComponent by listening to client channel events for the "pair" interaction and managing the state of the interaction.
   * @public
   * @returns {void}
   * @usageNotes
   * The component listens to events from clients subscribed to the "pair" interaction and increments the counter for each event received.
   */
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

  /**
   * Initializes the component with data from the presenter message.
   * @public
   * @param {PresenterMessage} data - The PresenterMessage instance containing the data to initialize the component with.
   * @returns {void}
   * @usageNotes
   * This method is required to implement the PresenterView interface but is not used in this component.
   */
  initializeComponent(data: PresenterMessage): void {}
}
