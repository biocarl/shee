import { PresenterMessage } from './presenter-message';

export interface ClientView {
  initializeComponent(data: PresenterMessage): void;
}
