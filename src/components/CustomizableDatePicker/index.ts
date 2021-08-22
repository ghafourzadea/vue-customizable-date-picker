/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue, { Component, PropType } from "vue";
import { VNode } from "vue/types/umd";

// styles
import "../../assets/styles.scss";

// components
import MainHeader from "./MainHeader.vue";
import MonthTable from "./MonthTable.vue";

// types
import { Calendar, Day, InputValue, RangeValue } from "./types";

export default function datePickerFactory(calendars: Calendar[]): Component {
  return Vue.extend({
    name: "CustomizableFactory",
    props: {
      value: {
        type: [Date, Object] as PropType<InputValue>,
        required: false,
      },
      monthCount: {
        type: Number,
        default: 1,
      },
      currentCalendar: {
        type: Number,
        default: 0,
      },
      range: {
        type: Boolean,
        default: false,
      },
      readOnly: {
        type: Boolean,
        default: false,
      },
      min: {
        type: Date as PropType<Date>,
        required: false,
        default: null,
      },
      max: {
        type: Date as PropType<Date>,
        required: false,
        default: null,
      },
    },
    data: function () {
      const calendar: Calendar = calendars[this.currentCalendar];
      let month = calendar.currentMonth;
      let year = calendar.currentYear;
      const value = this.range ? (this.value as RangeValue)?.start : this.value;
      if (value) {
        month = calendar.getMonth(value as Date);
        year = calendar.getYear(value as Date);
      } else if (this.min) {
        month = calendar.getMonth(this.min);
        year = calendar.getYear(this.min);
      }
      return {
        month,
        year,
        selectedFirstRange: null as Day | null,
        currentHoveredDay: null as Day | null,
      };
    },
    watch: {
      currentCalendar() {
        this.month = calendars[this.currentCalendar].currentMonth;
        this.year = calendars[this.currentCalendar].currentYear;
      },
    },
    computed: {
      dataTables(): VNode[] {
        const tables: VNode[] = [];
        for (let i = 0; i < this.monthCount; i++) {
          const month =
            this.month + i < 12 ? this.month + i : (this.month + i) % 12;
          const year = this.month + i > 11 ? this.year + 1 : this.year;
          tables.push(
            this.$createElement(MonthTable, {
              props: {
                year: year,
                month: month,
                currentCalendar: this.currentCalendar,
                value: this.value,
                range: this.range,
                selectedFirstRange: this.selectedFirstRange,
                currentHoveredDay: this.currentHoveredDay,
                min: this.min,
                max: this.max,
                calendar: this.calendar,
              },
              key: `${year}-${i}`,
              on: this.readOnly
                ? {}
                : {
                    "day-click": this.$listeners["day-click"] || (() => null),
                    input: this.onInput,
                    drag: this.onDrag,
                    "day-hover": this.onDayHover,
                  },
              scopedSlots: this.$scopedSlots,
            })
          );
        }
        return tables;
      },
      calendar(): Calendar {
        return calendars[this.currentCalendar];
      },
    },
    methods: {
      next() {
        if (this.month + 1 <= 11) {
          this.month++;
        } else {
          this.month = 0;
          this.year++;
        }
        this.$emit("page-change", {
          year: this.year,
          month: this.month,
        });
      },
      prev() {
        if (this.month - 1 >= 0) {
          this.month--;
        } else {
          this.month = 11;
          this.year--;
        }
        this.$emit("page-change", {
          year: this.year,
          month: this.month,
        });
      },
      onDrag(value: Date) {
        this.$emit("input", {
          start: null,
          end: null,
        });
        this.$emit("drag");
        this.selectedFirstRange = value;
      },
      onInput(value: InputValue) {
        this.selectedFirstRange = null;
        this.$emit("input", value);
      },
      onDayHover(day: Day) {
        this.currentHoveredDay = day;
        this.$emit("day-hover", day);
      },
    },
    render(createElement) {
      return createElement(
        "div",
        { class: "customizable-date-picker-container" },
        [
          createElement(MainHeader, {
            on: { next: (this as any).next, prev: (this as any).prev },
            scopedSlots: this.$scopedSlots,
          }),
          ...(this as any).dataTables,
        ]
      );
    },
  });
}
