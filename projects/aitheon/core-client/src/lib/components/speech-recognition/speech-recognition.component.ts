import { AfterViewInit, Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpeechRecognitionService } from './speech-recognition.service';

@Component({
  selector: 'ai-speech-recognition',
  templateUrl: './speech-recognition.component.html',
  styleUrls: ['./speech-recognition.component.scss']
})
export class SpeechRecognitionComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() speechFound = new EventEmitter<string>();
  @Output() startListen = new EventEmitter<boolean>();
  public isRecording = false;
  private final_transcript = '';
  private recognition: SpeechRecognition;
  private subscriptions = [];

  constructor( private speechRecognitionService: SpeechRecognitionService ) { }

  ngOnInit() {
    this.recognition = this.speechRecognitionService.getRecognition();
  }

  ngAfterViewInit() {
    const startEvent = fromEvent(this.recognition, 'start');
    const endEvent = fromEvent(this.recognition, 'end');
    const resultEvent = fromEvent(this.recognition, 'result');

    const onStart = startEvent.subscribe(() => {
      this.isRecording = true;
    });
    const onEnd = endEvent.subscribe(() => {
      this.isRecording = false;
    });
    const onResult = resultEvent.pipe(
        map((e: SpeechRecognitionEvent) => {
          let interim_transcript = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            e.results[i].isFinal ? this.final_transcript += e.results[i][0].transcript : interim_transcript += e.results[i][0].transcript;
          }
          return `${this.final_transcript} ${interim_transcript}`;
        }))
        .subscribe((text: string) => {
          this.speechFound.emit(text);
        });

    this.subscriptions = this.subscriptions.concat([ onStart, onEnd, onResult ]);
  }

  handleToggle() {
    this.isRecording = !this.isRecording;
    if (this.isRecording === true) {
      this.final_transcript = '';
      this.startListen.emit(true);
    } else {
      this.startListen.emit(false);
    }
    this.isRecording ? this.recognition.start() : this.recognition.stop();
  }

  ngOnDestroy() {
    this.recognition.stop();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
