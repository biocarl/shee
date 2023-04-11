export interface PollPresenterSubscribeResponse {
  id: string,
  interaction: "poll",
  timer: number,
  answers: string[],
  question: string;
}
