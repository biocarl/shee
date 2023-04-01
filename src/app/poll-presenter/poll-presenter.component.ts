import { Component } from '@angular/core';
import {PresenterView} from "../presenter-view";
import {PresenterSubscribeResponse} from "../dto/presenter-subscribe-response";

@Component({
  selector: 'app-poll-presenter',
  templateUrl: './poll-presenter.component.html',
  styleUrls: ['./poll-presenter.component.css']
})
export class PollPresenterComponent implements PresenterView{
  response ? : PresenterSubscribeResponse;
  populateWithData(data: PresenterSubscribeResponse): void {
   this.response = data;
  }

}
