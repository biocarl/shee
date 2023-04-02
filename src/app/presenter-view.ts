import {PresenterMessage} from "./presenter-message";

export interface PresenterView {
  initializeComponent(data : PresenterMessage ) : void;
}
