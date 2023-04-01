import {PresenterSubscribeResponse} from "./dto/presenter-subscribe-response";

export interface PresenterView {
  populateWithData(data : PresenterSubscribeResponse ) : void;
}
