import RLLClient from "./Client";
import { RLLClientOptions } from "./types/application";

/**
 * Generate a RocketLaunch.Live client
 *
 * @public
 * @function
 *
 * @param {string} apiKey - Your RocketLaunch.Live API Key
 * @param {Object} [options] - Optional Client Configuration options
 * @param {boolean} options.keyInQueryParams - Set to true to send your API Key via Query parameters instead of Authorization Header (not recommended)
 *
 * @returns {RLLCLient}
 *
 * @example
 *
 * const MY_KEY = process.env.ROCKETLAUNCH_LIVE_API_KEY
 *
 * const client = clientGenerator(MY_KEY, { keyInQueryParams: true })
 */
const rllc = (apiKey: string, options?: RLLClientOptions): RLLClient =>
  new RLLClient(apiKey, options);

export { rllc };
