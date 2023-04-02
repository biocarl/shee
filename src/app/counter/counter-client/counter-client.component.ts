import {Component} from '@angular/core';
import {ClientView} from "../../client-view";
import {QueueService} from "../../queue.service";
import {PresenterMessage} from "../../presenter-message";

interface CounterPresenterSubscribeResponse {
  // This is the event presenter side was publishing
}

interface CounterClientPublishRequest {
  interaction: string
  // Here you could for example send an external IP to ensure (on presenter side)
  // that no one is sending a request twice
}

@Component({
  selector: 'app-counter-client',
  templateUrl: './counter-client.component.html',
  styleUrls: ['./counter-client.component.css']
})
export class CounterClientComponent implements ClientView {
  private counterRequestFromPresenter ? : CounterPresenterSubscribeResponse;

  constructor(private queueService : QueueService) {}
  initializeComponent(data: PresenterMessage): void {
    this.counterRequestFromPresenter = data as CounterPresenterSubscribeResponse;


    const message : CounterClientPublishRequest =  {
      interaction: "counter",
    };
    this.queueService.publishMessageToClientChannel<CounterClientPublishRequest>(message);
  }
}
