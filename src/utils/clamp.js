export default (value, min, max) => {
  return value < min ?
    min :
    max != null && value > max ?
      max :
      value
}
