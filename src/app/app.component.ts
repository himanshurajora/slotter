import { assertPlatform, Component } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

interface Slot {
  days: number[];
  startTime: string;
  endTime: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  vertical = 1;
  days = [0, 1, 2, 3, 4, 5, 6];
  hours = _.reduce(
    _.range(0, 24),
    (prev: string[], curr: number) => {
      return [...prev, `${curr < 10 ? '0' + curr : curr}:00`];
    },
    []
  );

  slots: Slot[] = [
    {
      days: [3, 4],
      startTime: '00:30',
      endTime: '12:00',
    },
  ];

  currentSlotIndex: number = -1;
  selectedSlot: Slot | undefined;
  // slots: {
  //   days: string[];
  //   startTime: string;
  //   endTime: string;
  // }[] = [];

  isMouseDown = false;
  isMouseUp = true;

  ngOnInit() {
    console.log(this.hours, this.days, this.slots);
  }

  isBooked(
    day: number,
    days: number[],
    hour: string,
    startTime: string,
    endTime: string
  ) {
    if (days.includes(day)) {
      let time = moment(hour, 'HH:mm');
      let st = moment(startTime, 'HH:mm');
      let et = moment(endTime, 'HH:mm');

      return time.isSameOrAfter(st) && time.isSameOrBefore(et);
    }

    return false;
  }

  isInsideSelectedSlot(day: number, hour: string) {
    if (this.selectedSlot) {
      console.log('I cam here');
      return this.isBooked(
        day,
        this.selectedSlot.days,
        hour,
        this.selectedSlot.startTime,
        this.selectedSlot.endTime
      )
        ? 'selected'
        : '';
    }

    console.log
    return '';
  }

  hasSlot(day: number, hour: string) {
    return _.some(this.slots, (slot) => {
      return this.isBooked(day, slot.days, hour, slot.startTime, slot.endTime);
    })
      ? 'booked'
      : '';
  }

  getOrCreateSlot(day: number, hour: string, create: boolean = true) {
    const slot = _.find(this.slots, (slot) => {
      return this.isBooked(day, slot.days, hour, slot.startTime, slot.endTime);
    });

    if (!slot) {
      if (create) {
        this.slots.push({
          days: [day],
          startTime: hour,
          endTime: hour,
        });
        return _.last(this.slots);
      }
      return null;
    }

    return slot;
  }

  /**
   * this function reset the current slot and create a slot on the clicked slot if no slot is created
   * @param event
   * @param day
   * @param hour
   */
  slotClickHandler(event: MouseEvent, day: number, hour: string) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.currentSlotIndex = -1;
    const slot = this.getOrCreateSlot(day, hour);
    if (slot) {
      this.selectedSlot = slot;
    }
  }

  selectCurrentSlot(event: MouseEvent, day: number, hour: string) {
    const slot = this.getOrCreateSlot(day, hour);
    this.currentSlotIndex = _.indexOf(this.slots, slot);
  }

  /**
   * The function that is mainly responsible for the ui controls
   * It check the current state of the existing
   * @param event
   * @param day
   * @param hour
   * @returns
   */
  updateSlot(event: MouseEvent, day: number, hour: string) {
    const slot = this.selectedSlot;
    if (this.currentSlotIndex === -1 || !slot) return;

    // handling days
    const firstDay = _.first(slot.days);
    const lastDay = _.last(slot.days);
    const indexOfFirstDay = _.indexOf(this.days, firstDay);
    const indexOfLastDay = _.indexOf(this.days, lastDay);
    let indexOfSelectedDay = _.indexOf(this.days, day);
    while (indexOfSelectedDay < indexOfFirstDay) {
      slot.days.push(this.days[indexOfSelectedDay++]);
    }
    while (indexOfSelectedDay > indexOfLastDay) {
      slot.days.push(this.days[indexOfSelectedDay--]);
    }

    slot.days.sort((a, b) => a - b);

    // handling hours
    while (moment(hour, 'HH:mm').isBefore(moment(slot.startTime, 'HH:mm'))) {
      slot.startTime = moment(hour, 'HH:mm')
        .subtract(1, 'hour')
        .format('HH:mm');
    }

    while (moment(hour, 'HH:mm').isAfter(moment(slot.endTime, 'HH:mm'))) {
      slot.endTime = moment(hour, 'HH:mm').add(1, 'hour').format('HH:mm');
    }

    // check for overlap
    this.promptIfOverlap(slot);

    this.currentSlotIndex = -1;
  }

  promptIfOverlap(slot: Slot) {
    // const blocks = [];

    let i = _.first(slot.days);
    let n = _.last(slot.days);

    console.log('called', i, n);

    // if (!i || !n) return;

    // let startTime = this.mTime(slot.startTime);

    // console.log(startTime.format('HH:mm'));

    // startTime.add(1, 'hour');

    // console.log(startTime.format('HH:mm'));

    // while (i <= n) {
    //   let startTime = this.mTime(slot.startTime);
    //   while (startTime.isSameOrBefore(this.mTime(slot.endTime))) {
    //     blocks.push({ day: i, hour: this.mFormat(startTime) });
    //     console.log(blocks);
    //     startTime.add(1, 'hour');
    //   }
    //   i++;
    // }

    for (let s of this.slots) {
      console.log(s.days, slot.days);
      if (
        _.intersection(s.days, slot.days).length > 0 &&
        this.mTime(slot.startTime).isAfter(this.mTime(s.startTime)) &&
        this.mTime(slot.endTime).isBefore(this.mTime(s.startTime))
      ) {
        alert('Overlap');
        return;
      }
    }
  }

  mTime(hour: string) {
    return moment(hour, 'HH:mm');
  }

  mFormat(time: moment.Moment) {
    return time.format('HH:mm');
  }

  title = 'slotter';
}
