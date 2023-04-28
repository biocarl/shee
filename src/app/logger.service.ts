import { Injectable } from '@angular/core';
import {environment} from "../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  public toConsole(message: string, Obj?:any){
    if(!environment.production){
      const timestamp = `${new Date().toLocaleTimeString()}.${String(new Date().getMilliseconds()).padStart(3, "0")}`;
      console.log(`${timestamp} ` + message,Obj ? Obj : '');
      if(Obj && Obj.message){
        console.log('Decoded message: ', JSON.parse(this.#base64ToUtf8(Obj.message)));
      }
    }
  }

  #base64ToUtf8(base64: string): string {
    return decodeURIComponent(Array.prototype.map.call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }
}
