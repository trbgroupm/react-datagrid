// import clamp from './clamp'

export default (array, { skip, limit }) => {
  return array.slice(skip, skip + limit)
}
