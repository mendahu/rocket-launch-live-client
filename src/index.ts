import { RLLClient } from "./Client";
import { RLLClientOptions } from "./types/application";

export {
  RLLEndPoint,
  RLLResponse,
  RLLClientOptions,
  RLLQueryConfig,
  RLLEntity,
} from "./types/application";
export { ISO3166Alpha2 } from "./types/standards";
export { RLLClient } from "./Client";

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
 * const client = rllc(MY_KEY, { keyInQueryParams: true })
 */
export const rllc = (apiKey: string, options?: RLLClientOptions): RLLClient =>
  new RLLClient(apiKey, options);
