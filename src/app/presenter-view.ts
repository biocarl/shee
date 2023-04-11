import {PresenterMessage} from "./presenter-message";

/**
 * The PresenterView interface represents the common methods used to initialize a presenter view.
 * @interface
 */
export interface PresenterView {
  /**
   * Initializes the presenter view with the given data.
   * @param {PresenterMessage} data The presenter message data.
   * @returns {void}
   */
  initializeComponent(data : PresenterMessage ) : void;
}
