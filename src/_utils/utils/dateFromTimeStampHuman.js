import moment from 'moment'

export const dateFromTimeStampHuman = timestamp => {
  try {
    let date = moment.unix(timestamp).format('D MMMM YYYY')
    return date
  } catch (error) {
    console.warn(error)
    return '01 January 1970'
  }
}
