import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private participantName: string = "Unknown";

  getParticipantName(): string {
    return this.participantName;
  }

  setParticipantName(name: string) {
    this.participantName = name;
  }
}
