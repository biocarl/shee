import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor() { }

  onPresenterEvent<Type>(handlePresenterEvent: (event : Type) => void) {

  }
}
