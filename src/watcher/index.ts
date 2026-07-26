import { RLLClient } from "../Client.js";
import { RLLQueryConfig } from "../types/application.js";
import { RLLWatcher } from "../Watcher.js";

export { RLLWatcher } from "../Watcher.js";

/**
 * Create a Watcher that polls the launches endpoint for changes.
 *
 * Import this from `rocket-launch-live-client/watcher` so applications that only
 * need the REST client do not load Watcher code.
 *
 * @param {RLLClient} client - An RLL client created with `rllc()`
 * @param {number | string} [interval] - Poll interval in minutes (default 5, minimum 1)
 * @param {RLLQueryConfig.Launches} [options] - Launch query options (same as `client.launches`)
 *
 * @returns {RLLWatcher}
 *
 * @example
 * import { rllc } from "rocket-launch-live-client";
 * import { watch } from "rocket-launch-live-client/watcher";
 *
 * const client = rllc(process.env.ROCKETLAUNCH_LIVE_API_KEY);
 * const watcher = watch(client, 5, { country_code: "US" });
 * watcher.start();
 */
export const watch = (
  client: RLLClient,
  interval?: number | string,
  options?: RLLQueryConfig.Launches
): RLLWatcher =>
  new RLLWatcher(
    (params) => client.queryLaunches(params),
    interval,
    options
  );
