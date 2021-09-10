import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ai-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  counter = '';
  counterInterval: any;
  timespan: any;

  startTime: Date;
  started = false;

  @Input('running')
  set running(value: boolean) {
    if (value) {
      this.startInterval();
    } else {
      this.stopInterval();
    }
  }
  @Input('timeSeconds')
  set timeSeconds(value: string) {
    this.timespan = this.secondsToTime(value);
    this.updateCounter();
  }

  constructor() { }

  private secondsToTime(timeInSeconds) {
    const days = Math.floor(timeInSeconds / (60 * 60 * 24));
    const hours = Math.floor((timeInSeconds - days * 60 * 60 * 24) / (60 * 60) );
    const minutes = Math.floor((timeInSeconds - days * 60 * 60 * 24 - hours * (60 * 60)) / 60);
    const seconds = Math.floor(timeInSeconds - days * 60 * 60 * 24 - hours * 60 * 60 - minutes * 60);

    return {
      days,
      hours,
      minutes,
      seconds
    };
  }

  private addOneSecond() {
    const { days, hours, minutes, seconds} = this.timespan;
    this.timespan = this.secondsToTime((days * 60 * 60 * 24) + (hours * 60 * 60) + (minutes * 60) + (seconds+1));
  }

  startInterval(){
    this.counterInterval = setInterval(() => {
      this.addOneSecond();
      this.updateCounter();
    }, 1000);
  }

  stopInterval() {
    clearInterval(this.counterInterval);
    this.counterInterval = null;
  }

  updateCounter(){
    this.counter = this.timespanFormat(this.timespan);
  }

  timespanFormat(timespan: any): string {
    return `${ timespan.days > 0 ? (this.formatTime(timespan.days) + ':') : '' }${ this.formatTime(timespan.hours) }:${ this.formatTime(timespan.minutes) }:${ this.formatTime(timespan.seconds) }`
  }

  private formatTime(time: any){
    if (time < 10){
      return `0${ time }`;
    }
    return time;
  }

  ngOnInit() {}

}
