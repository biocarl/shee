export interface PollPresenterSubscribeResponse {
  id: string;
  interaction: 'poll';
  answers: string[];
  question: string;
}
