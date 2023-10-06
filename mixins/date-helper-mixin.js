import dayjs from 'dayjs'

export const dateHelperMixin = {
  methods: {
    timezoneOffset () {
      const date = new Date()
      const sign = (date.getTimezoneOffset() > 0) ? '-' : '+'
      const offset = Math.abs(date.getTimezoneOffset())
      const hours = this.pad(Math.floor(offset / 60))
      const minutes = this.pad(offset % 60)
      return sign + hours + ':' + minutes
    },
    pad (valueToPad) {
      return valueToPad < 10 ? '0' + valueToPad : valueToPad
    },
    getAbbreviatedTimezone () {
      const date = new Date()
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        timeZoneName: 'short'
      }).slice(4)
    },
    getLocalTimeNowMinusDay () {
      return dayjs().tz(dayjs.tz.guess()).subtract(24, 'hour').format()
    },
    getLocalTimeNowPlusDay () {
      return dayjs().tz(dayjs.tz.guess()).add(24, 'hour').format()
    },
    getLocalTimeNow () {
      return dayjs().tz(dayjs.tz.guess()).format()
    }
  }
}
