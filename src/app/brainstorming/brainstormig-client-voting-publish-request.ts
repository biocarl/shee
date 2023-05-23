export interface BrainstormigClientVotingPublishRequest {
  interaction: "brainstorming",
  ideaVoting: number[],
  participantName?: string,
  questionID: string
}
