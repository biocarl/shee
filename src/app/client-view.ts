import {PresenterMessage} from "./presenter-message";

/**
 * The ClientView interface defines the contract for a component that can display a presenter message to a client.
 * @interface
 */
export interface ClientView {
  /**
   * Initializes the component with data from a presenter message.
   * @param {PresenterMessage} data The data from the presenter message to display.
   * @returns {void}
   */
  initializeComponent(data : PresenterMessage) : void;
}
