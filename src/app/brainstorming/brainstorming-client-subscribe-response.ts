export interface BrainstormingClientSubscribeResponse {
  participantName: string;
  ideaText: string;
  questionID: string;
  ideaVoting: number[],
  stickyColor: string;
}
