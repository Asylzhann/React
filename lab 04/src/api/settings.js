// Key used to store the data in localStorage.
// It is unique to this project, so other projects on the same website cannot clash with it.
export const DATA_KEY = "pet-shelter-data";

// Settings of the fake API: random delay of 0.5 to 3 seconds and a 5% chance of an error.
// Raise maxDelay or errorChance to test race conditions and error handling.
export const API_CONFIG = {
  minDelay: 500,
  maxDelay: 3000,
  errorChance: 0.05,
};
