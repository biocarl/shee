import {Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";
import {ParticipantService} from "../../participant.service";
import {PairPresenterSubscribeResponse} from "../pair-presenter-subscribe-response";

/**
 * This interface defines the structure of the client message sent to the presenter for the "pair" interaction.
 * @interface
 */
interface CounterClientPublishRequest {
  interaction: string,
  participantName ?: string
  // Here you could for example send an external IP (salted hash) to ensure (on presenter side)
  // that no one is sending a request twice
}

@Component({
  selector: 'app-counter-client',
  templateUrl: './pair-client.component.html',
  styleUrls: ['./pair-client.component.css']
})
/**
 * The pair client component is used to signal and display a successful pairing on client side.
 * @component
 * @implements ClientView
 */
export class PairClientComponent implements ClientView {
  constructor(private queueService : QueueService, private participantService: ParticipantService) {}

  initializeComponent(data: PresenterMessage): void {
    const counterRequestFromPresenter = data as PairPresenterSubscribeResponse;

    if(counterRequestFromPresenter.anonymity === "public" && !this.participantService.getParticipantName()){
      this.participantService.setParticipantName(this.promptUsername());
    }

    this.emitPairingFinalized();
  }

  private promptUsername() {
    // TODO This should be extracted into a module which handles the username before this module is inflated
    let promptResponse: string | null = "";
    while (!promptResponse || promptResponse === "") {
      promptResponse = prompt("Your name, pls ☺️", "")
    }
    return promptResponse;
  }

  private emitPairingFinalized() {
    const message: CounterClientPublishRequest = {
      interaction: "pair",
      participantName: this.participantService.getParticipantName()
    };
    this.queueService.publishMessageToClientChannel<CounterClientPublishRequest>(message);
  }
}
