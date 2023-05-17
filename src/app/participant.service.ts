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
              private activatedRoute: ActivatedRoute) {}

  /**
   * Retrieves the name of the current participant. When no name is found, name is retrieved from URL or Cookie.
   * @public
   * @returns {string | undefined} The name of the participant.
   */
  getParticipantName(): string | undefined {
    if(!this.participantName) {
      this.getParticipantNameFromUrlOrCookie();
    }
    return this.participantName;
  }

  /**
   * Retrieves the name of the current participant from the URL or Cookie.
   * @public
   * @returns {string | undefined} The name of the participant.
   */
  private getParticipantNameFromUrlOrCookie():string | undefined {
    const participantNameFromUrl = this.getParticipantFromUrl();
    if(participantNameFromUrl){
      return participantNameFromUrl;
    }

    const participantNameFromCookie = this.getParticipantFromCookie();
    if(participantNameFromCookie){
      return participantNameFromCookie;
    }
    return undefined;
  }

  /**
   * Sets the name of the current participant, updates query params and saves the name in a cookie. The Name is overwritten if it already exists.
   * @param {string} name The name to set for the participant.
   * @public
   * @returns {void}
   */
  setParticipantName(name: string) {
    this.participantName = name;
    this.updateUrlWithParticipantName(name);
    this.saveParticipantNameToCookie(name);
  }

  private getParticipantFromUrl():string | null{
      return this.activatedRoute.snapshot.queryParamMap.get("user");
  }

  private getParticipantFromCookie():string | null{
    const participantName = getCookieValueFor("user");
    return participantName && participantName !== '' ? participantName : null;
  }

  private updateUrlWithParticipantName(name: string): void{
    const queryParams: Params =  {user: name};
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
      });
  }

  private saveParticipantNameToCookie(name: string):void {
    addCookie("user",name);
  }
}
