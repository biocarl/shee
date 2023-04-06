export interface PollPresenterSubscribeResponse {
  question_id: string;
  interaction: "poll",
  answers: string[],
  question: string;
}
