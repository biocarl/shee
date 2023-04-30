export interface BrainstormigClientVotingPublishRequest {
  interaction: "brainstorming",
  idea_voting: number[],
  participantName?: string,
  question_id: string
}
