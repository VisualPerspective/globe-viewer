const RAD2DEG = 180 / Math.PI
const DEG2RAD = Math.PI / 180

// https://www.npmjs.com/package/mod-loop
function loop(value, divisor) {
  var n = value % divisor;
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
  var D = getJulianFromUnix(time) - 2451545
  var g = 357.529 + 0.98560028 * D
  var L = 280.459 + 0.98564736 * D

  var lambda = L +
          1.915 * Math.sin(g * DEG2RAD) +
          0.020 * Math.sin(2 * g * DEG2RAD)

  var e = 23.439 - 0.00000036 * D
  var y = Math.cos(e * DEG2RAD) * Math.sin(lambda * DEG2RAD)
  var x = Math.cos(lambda * DEG2RAD)

  var rightAscension = Math.atan2(y, x)
  var declination = Math.asin(
    Math.sin(e * DEG2RAD) * Math.sin(lambda * DEG2RAD)
  )

  var gmst = 18.697374558 + 24.06570982441908 * D;
  var hourAngle = (gmst / 24 * Math.PI * 2) - rightAscension

  return {
    hourAngle: hourAngle,
    declination: declination
  }
}
