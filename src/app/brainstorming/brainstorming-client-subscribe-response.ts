export interface BrainstormingClientSubscribeResponse {
  participantName: string;
  idea_text: string;
  question_id: string;
  idea_voting: number[],
  stickyColor: string;
}
