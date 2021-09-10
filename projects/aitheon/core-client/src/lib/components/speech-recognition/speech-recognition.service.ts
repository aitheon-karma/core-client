import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  private recognition: any;

  constructor(
    private toastr: ToastrService
  ) { }

  getRecognition(): SpeechRecognition {

    if (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window) || ('mozSpeechRecognition' in window)) {
      // @ts-ignore
      this.recognition = new (window['SpeechRecognition'] || window['webkitSpeechRecognition'] || window['mozSpeechRecognition']);
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      return this.recognition;
    } else {
      this.toastr.error('Voice input don`t support in your browser');
    }
  }
}
