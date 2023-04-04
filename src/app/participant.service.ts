import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private participantName : string = "Anonym";

  getParticipantName() : string{
    return this.participantName;
  }

  setParticipantName(name:string){
    this.participantName = name;
  }
}
