import moment from 'moment'

export const dateFromTimeStampHuman = timestamp => {
  return moment.unix(timestamp).format('D MMMM YYYY')
}
