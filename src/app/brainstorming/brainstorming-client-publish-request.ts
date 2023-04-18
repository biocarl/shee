export interface BrainstormingClientPublishRequest {
  interaction: "brainstorming",
  idea_text: string,
  participantName: string;
  question_id: string;
  stickyColor: string;
}
