import {Injectable} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {addCookie, getCookieValueFor} from "./cookie-utlis";

@Injectable({
  providedIn: 'root'
})
/**
 * The ParticipantService is used to store and retrieve the name of the current participant.
 * @class
 * @Injectable
 */
export class ParticipantService {
  private participantName ? : string;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  /**
   * Retrieves the name of the current participant.
   * @public
   * @returns {string} The name of the participant.
   */
  getParticipantName(): string | undefined {
    if(!this.participantName){

      // Option 1: Try to retrieve from URL
      let participant : string | undefined | null =  this.activatedRoute.snapshot.queryParamMap.get("user");
      if (participant && participant !== "") {
         this.setParticipantName(participant); // also updates the route
         return this.participantName;
      }

      // Option 2:  Try to retrieve from cookies
      participant = getCookieValueFor("user");
      if(participant && participant !== ""){
        this.setParticipantName(participant); // also updates the route
        return this.participantName;
      }
    }

    return this.participantName;
  }

  /**
   * Sets the name of the current participant and updates query params
   * @param {string} name The name to set for the participant.
   * @public
   * @returns {void}
   */
  setParticipantName(name: string) {
    this.participantName = name;

    // A: Persist user in url
    const queryParams: Params = { user: name };
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
      });


    // B: Persist user in cookies (overwrite)
    addCookie("user",this.participantName);
  }
}
