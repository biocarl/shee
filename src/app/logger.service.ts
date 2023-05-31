import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
/**
 * LoggerService is a utility service for logging messages to the console in a non-production environment.
 * @class
 * @Injectable
 */
export class LoggerService {
  private isInDevelopment = !environment.production;

  constructor() {}

  /**
   * Logs a message and an optional object to the console if the application is running in a non-production environment.
   * If the object has a message property, its decoded content will also be logged.
   * @param {string} message - The message to log to the console.
   * @param {any} [objectToLog] - The optional object to log to the console.
   * @public
   * @returns {void}
   */
  public logToConsole(message: string, objectToLog?: any): void {
    if (this.isInDevelopment) {
      this.logWithTimestamp(message, objectToLog);
      if (objectToLog?.message) {
        this.logDecodedMessage(objectToLog.message);
      }
    }
  }

  private logWithTimestamp(message: string, objectToLog?: any): void {
    const timestamp = this.createTimestamp();
    console.log(`${timestamp} ${message}`, objectToLog || '');
  }

  private createTimestamp(): string {
    const now = new Date();
    const timeWithMilliseconds = `${now.toLocaleTimeString()}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;
    return timeWithMilliseconds;
  }

  private logDecodedMessage(base64Message: string): void {
    const decodedMessage = this.base64ToUtf8(base64Message);
    console.log('Decoded message: ' + decodedMessage);
  }

  private base64ToUtf8(base64: string): string {
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(base64),
          (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('')
    );
  }
}
