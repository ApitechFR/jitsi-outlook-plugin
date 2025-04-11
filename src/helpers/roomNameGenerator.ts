import roomData from "../utils/roomData.json";

function randomAlphanumString(length) {
  return _randomString(length, roomData.ALPHANUM);
}
function _randomString(length, characters) {
  let result = "";

  for (let i = 0; i < length; ++i) {
    result += randomElement(characters);
  }

  return result;
}
function randomElement(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Select a random element from an array.
 * @param arr - The array to select from.
 * @returns A random element from the array.
 */
function randomElementFlush<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a professional room name.
 * @returns A room name.
 */
export function generateRoomName(): string {
  const place = randomElementFlush(roomData.PLACE);
  const noun = randomElementFlush(roomData.PLURALNOUN);
  const verb = randomElementFlush(roomData.VERB);
  const AlphanumString = randomAlphanumString(randomInt(7, 10));

  return `${place}${noun}${verb}-${AlphanumString}`;
}

// Example usage
//console.log(generateRoomName());
