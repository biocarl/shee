export interface BrainstormingClientPublishRequest {
  interaction: "brainstorming",
  idea_id: string,
  idea_text: string,
  participantName: string;
}
