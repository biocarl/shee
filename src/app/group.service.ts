import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  public groupName : string = "";
  public hasQuestions: boolean = false;
}
