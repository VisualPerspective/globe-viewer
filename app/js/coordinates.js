import { toRadians } from './utils'

// https://www.npmjs.com/package/mod-loop
function loop(value, divisor) {
  let n = value % divisor;
  return n < 0 ? (divisor + n) : n
}

function getJulianFromUnix(time) {
  return ((time / 1000) / 86400.0) + 2440587.5
}

// Returns equatorial coordinates for the sun at
// a given time, based on:
// http://aa.usno.navy.mil/faq/docs/SunApprox.php
// http://www.stargazing.net/kepler/sun.html
export default function sunCoordinates(time) {
  let D = getJulianFromUnix(time) - 2451545
  let g = 357.529 + 0.98560028 * D
  let L = 280.459 + 0.98564736 * D

  let lambda = L +
          1.915 * Math.sin(toRadians(g)) +
          0.020 * Math.sin(toRadians(2 * g))

  let e = 23.439 - 0.00000036 * D
  let y = Math.cos(toRadians(e)) * Math.sin(toRadians(lambda))
  let x = Math.cos(toRadians(lambda))

  let rightAscension = Math.atan2(y, x)
  let declination = Math.asin(
    Math.sin(toRadians(e)) * Math.sin(toRadians(lambda))
  )

  let gmst = 18.697374558 + 24.06570982441908 * D;
  let hourAngle = (gmst / 24 * Math.PI * 2) - rightAscension

  return {
    hourAngle: hourAngle,
    declination: declination
  }
}
