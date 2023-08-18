import {environment} from "../environments/environment";
import {Injectable} from "@angular/core";
import {LoggerService} from "./logger.service";
import {HttpClient} from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})

export class BackendQueueService {

  constructor(private log: LoggerService,private http: HttpClient) {
  }

  public publishMessageToBackend(clientOrPres: string,topicSuffix: string, message: String) {
    const payloadForBackend = {content: message};
    this.log.logToConsole("Trying to send Post to Backend:", payloadForBackend);
    this.log.logToConsole("decoded:", message);
    const url = environment.production ? "https://shee-backend.bulbt.com/" : "http://localhost:8080/"
    this.http.post<any>(`${url}${clientOrPres+topicSuffix}/messages`, payloadForBackend)
      .subscribe(result => {
        this.log.logToConsole("Post to Backend earlier was successful.", result)
      });
  }
}


