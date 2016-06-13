export default (str) => {
  if (typeof str !== 'string') {
    throw new Error('Humanized accepts as the only parameter a string')
  }

  if (!str) {
    return str
  }

  return str[0].toUpperCase() + str.slice(1)
}
