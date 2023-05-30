import {PresenterMessage} from "./presenter-message";


export interface View {
  /**
   * Initializes the presenter view with the given data.
   * @param {PresenterMessage} data The presenter message data.
   * @returns {void}
   */
  initializeComponent(data : PresenterMessage ) : void;
}
