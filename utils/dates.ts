// https://day.js.org/docs/en/installation/installation

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advanced from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import locale from 'dayjs/plugin/localeData';

dayjs.extend(locale);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advanced);
dayjs.extend(relativeTime);

type FormatOptions = {
  formatString?: string;
  tz?: boolean;
};

const format = (date?: string, { formatString, tz }: FormatOptions = {}) =>
  date
    ? dayjs
        .utc(date)
        .local()
        .format(tz ? `${formatString} z` : formatString)
    : undefined;

const date = (date?: string, options?: FormatOptions) =>
  format(date, { formatString: 'Do MMMM, YYYY', tz: false, ...options });

const time = (date?: string, options?: FormatOptions) =>
  format(date, { formatString: 'HH:mm:ss', tz: false, ...options });

const dateTime = (date?: string, options?: FormatOptions): string | undefined =>
  format(date, {
    formatString: 'HH:mm:ssa, Do MMMM, YYYY',
    tz: false,
    ...options,
  });

const fromNow = (date?: string): string => dayjs.utc(date).local().fromNow();

const shortTimezone = (): string =>
  new Date()
    .toLocaleDateString(undefined, {
      day: '2-digit',
      timeZoneName: 'short',
    })
    .slice(4);

export { dayjs, date, time, dateTime, fromNow, shortTimezone };
