export interface BrainstormingClientPublishRequest {
  interaction: "brainstorming",
  ideaText: string,
  participantName?: string;
  questionID: string;
  stickyColor: string;
}
