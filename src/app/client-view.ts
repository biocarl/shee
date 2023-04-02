import {PresenterSubscribeResponse} from "./dto/presenter-subscribe-response";

export interface ClientView {
  populateWithData(data : PresenterSubscribeResponse ) : void;
}
