import { Injectable } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {group} from "@angular/animations";

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groupName : string = "";
  public hasQuestions: boolean = false;

  getGroupName() : string{
    return this.groupName;
  }

  setGroupName(name:string){
    this.groupName = name;
  }
}
