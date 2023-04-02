export interface PollClientPublishRequest {
  interaction: "poll",
  voting : number[],
  participant : string,
  question_id: string
};
