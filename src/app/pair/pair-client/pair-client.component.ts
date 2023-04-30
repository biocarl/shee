import {Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";
import {ParticipantService} from "../../participant.service";

/**
 * This interface defines the structure of the "pair" interaction request emitted by the presenter.
 * @interface
 */
interface CounterPresenterSubscribeResponse {
  // Currently no fields needed from presenter side for pairing
  // later we will e.g. send security relevant information like a public key in the payload
}

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
    // Currently not needed/used
    const counterRequestFromPresenter : CounterPresenterSubscribeResponse = data as CounterPresenterSubscribeResponse;

    // We simply return a alive signal and a participant if set
    const message : CounterClientPublishRequest =  {
      interaction: "pair",
      participantName: this.participantService.getParticipantName()
    };
    this.queueService.publishMessageToClientChannel<CounterClientPublishRequest>(message);
  }
}
