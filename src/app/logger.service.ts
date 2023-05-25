import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
/**
 * LoggerService is a utility service for logging messages to the console in a non-production environment.
 * @class
 * @Injectable
 */
export class LoggerService {

  constructor() { }

  /**
   * Logs a message and an optional object to the console if the application is running in a non-production environment.
   * If the object has a message property, its decoded content will also be logged.
   * @param {string} message - The message to log to the console.
   * @param {any} [Obj] - The optional object to log to the console.
   * @public
   * @returns {void}
   */
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
