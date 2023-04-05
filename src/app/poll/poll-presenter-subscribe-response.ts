export interface PollPresenterSubscribeResponse {
  id: string,
  interaction: "poll",
  questions : string[],
  timer:number
}
