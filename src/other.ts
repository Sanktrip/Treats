import { setData, EMPTY_DATASTORE } from './dataStore';
import { resetLogs } from './log';
import { clearMessageSendLaterTimeout } from './message';
import { clearPhotos, clearPhotosTimeout } from './profileImg';
import { clearStandupTimeout } from './standup';

/**
 * resets dataStore to its original state and clears all timeouts created by other functions
 *
 * ARGUMENTS:
 * takes no arguments
 *
 * RETURN VALUES:
 * @returns {void} - returns nothing
 */
function clearV1(): Record<string, never> {
  clearStandupTimeout();
  clearMessageSendLaterTimeout();

  clearPhotosTimeout();
  clearPhotos();

  setData(EMPTY_DATASTORE);
  resetLogs();
  return {};
}

export { clearV1 };
