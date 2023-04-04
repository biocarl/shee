export interface PollClientPublishRequest {
  interaction: "poll",
  voting : number[],
  participantName : string,
  question_id: string
};
