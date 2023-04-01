export interface PollClientPublish {
  event: "poll_event",
  voting : number[],
  participant : string,
  question_id: string
};
