import { assertPlatform, Component } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

interface Slot {
  day: number;
  hour: string;
}

export const dayNumberMap = {
  0: '*',
  1: '*',
  2: '*',
  3: '*',
  4: '*',
  5: '*',
  6: '*',
};

type DayType = keyof typeof dayNumberMap;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  vertical = 1;
  days: DayType[] = [0, 1, 2, 3, 4, 5, 6];
  hours = _.reduce(
    _.range(0, 24, 1),
    (prev: string[], curr: number) => {
      return [...prev, `${curr < 10 ? '0' + curr : curr}:00`];
    },
    []
  );
  bookedDays: Record<number, boolean> = {};
  bookedHours: Record<string, boolean> = {};

  getDay(day: DayType) {
    return dayNumberMap[day];
  }

  slots: Slot[] = [];

  // to keep all slots before processing
  intSlots: Slot[] = [];

  currentSlotIndex: number = -1;
  selectedSlot: Slot | undefined;

  isMouseDown = false;
  isMouseUp = true;

  title = 'slotter';

  ngOnInit() {}

  isBooked(
    day: number,
    selectedDay: number,
    hour: string,
    selectedHour: string
  ) {
    if (day === selectedDay) {
      let time = moment(hour, 'HH:mm');
      let h = moment(selectedHour, 'HH:mm');

      return time.isSame(h);
    }

    return false;
  }

  hasSlot(day: number, hour: string) {
    return _.some(this.slots, (slot) => {
      return this.isBooked(day, slot.day, hour, slot.hour);
    })
      ? 'booked'
      : '';
  }

  toggleSlot(day: number, hour: string, create: boolean = true) {
    const slotIndex = _.findIndex(this.slots, (slot) => {
      return this.isBooked(day, slot.day, hour, slot.hour);
    });

    if (slotIndex === -1) {
      if (create) {
        this.slots.push({
          day,
          hour,
        });

        this.selectedSlot = _.last(this.slots);
        return this.selectedSlot;
      }
      return null;
    }

    return this.slots.splice(slotIndex, 1)[0];
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
    const slot = this.toggleSlot(day, hour);
    if (slot) {
      this.selectedSlot = slot;
    }

    this.updateFlags();
  }

  updateFlags() {
    this.bookedDays = _.reduce(
      this.slots,
      (prev, curr) => {
        return { ...prev, [curr.day]: true };
      },
      {}
    );

    this.bookedHours = _.reduce(
      this.slots,
      (prev, curr) => {
        return {
          ...prev,
          [curr.hour]: true,
        };
      },
      {}
    );
  }

  toggleAllSlotsForADay(day: number) {
    const allSelectedSlotsForDay = _.filter(this.slots, (slot: Slot) => {
      return slot.day === day;
    });

    // remove all existing slots for day
    this.slots = _.filter(this.slots, (slot) => {
      return day !== slot.day;
    });

    if (allSelectedSlotsForDay.length !== this.hours.length) {
      this.slots = [
        ...this.slots,
        ..._.map(this.hours, (hour) => {
          return { day, hour };
        }),
      ];
    }

    this.updateFlags();
  }

  toggleAllSlotsForHour(hour: string) {
    const allSelectedSlotsForHour = _.filter(this.slots, (slot: Slot) => {
      return slot.hour === hour;
    });

    // remove all existing slots for hour
    this.slots = _.filter(this.slots, (slot) => {
      return hour !== slot.hour;
    });

    if (allSelectedSlotsForHour.length !== this.days.length) {
      this.slots = [
        ...this.slots,
        ..._.map(this.days, (day) => {
          return { day, hour };
        }),
      ];
    }

    this.updateFlags();
  }
}
