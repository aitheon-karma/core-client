import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';

@Pipe({ name: 'notifyDate' })
export class NotifyDatePipe implements PipeTransform {
  constructor() { }
  public transform(date: Date): string {

    const moment = moment_;
    const formatDate = moment(date).format('MM/DD/YYYY');
    const nowDate = moment().format('MM/DD/YYYY');
    const yesterday = moment().subtract(1, 'day').format('MM/DD/YYYY');
    let result = '';
    if (formatDate === nowDate) {
      result = moment(date).format('h:mm a');
    } else if (formatDate === yesterday) {
      result = 'Yesterday';
    } else {
      result = moment(date).format('ll');
    }
    return result;
  }
}
