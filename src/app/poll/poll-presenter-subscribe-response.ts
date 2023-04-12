export interface PollPresenterSubscribeResponse {
  question_id: string;
  interaction: "poll",
  timer?: number,
  answers: string[],
  question: string;
}
