export const dateFromTimeStampHuman = timestamp => {
  const day = ('0' + timestamp.getDate()).slice(-2)
  const locale = 'en-us'
  const year = timestamp.getFullYear()
  const month = timestamp.toLocaleString(locale, { month: 'long' })
  return day + ' ' + month + ' ' + year
}
