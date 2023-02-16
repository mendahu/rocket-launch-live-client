import EventEmitter from "events";
import {
  RLLEndPoint,
  RLLEntity,
  RLLQueryConfig,
  RLLResponse,
} from "./types/application";
import {
  error,
  warn,
  queryOptionsValidator,
  formatToRLLISODate,
} from "./utils";

const DEFAULT_INTERVAL_IN_MINS = 5;
const MS_IN_MIN = 60000;

export enum RLLWatcherEvent {
  NEW = "new",
  CHANGE = "change",
  ERROR = "error",
  READY = "ready",
  INITIALIZATION_ERROR = "init_error",
}

const intervalValidator = (interval: any): number => {
  if (typeof interval !== "number" && typeof interval !== "string") {
    error("RLLWatcher interval must be a number.");
    return DEFAULT_INTERVAL_IN_MINS;
  }

  if (
    typeof interval === "string" &&
    (isNaN(Number(interval)) || interval === "")
  ) {
    error("RLLWatcher interval must be a number.", "type");
    return DEFAULT_INTERVAL_IN_MINS;
  }

  const typedInterval = Number(interval);

  if (typedInterval <= 0) {
    error(
      "RLLWatcher interval cannot be a negative number or zero. Watcher intervals should be greater than or equal to 1 minute."
    );
    return DEFAULT_INTERVAL_IN_MINS;
  }

  if (typedInterval < 1) {
    warn(
      "RLLWatcher does not accept intervals less than 1. Your watcher will default to 5 minute intervals unless corrected."
    );
    return DEFAULT_INTERVAL_IN_MINS;
  }

  return typedInterval;
};

/**
 * Class representing a RocketLaunch.Live Client Watcher
 * @class
 */
export class RLLWatcher extends EventEmitter {
  private last_call: Date;
  private launches: Record<number, RLLEntity.Launch> = {};
  private interval: number;
  private params: Promise<URLSearchParams>;
  private timer: NodeJS.Timer | undefined;
  private fetcher: (
    params: URLSearchParams
  ) => Promise<RLLResponse<RLLEntity.Launch[]>>;

  /**
   * Create a new RocketLaunch.live Client Watcher
   *
   * @param {function(params: URLSearchParams): Promise<RLLResponse<RLLEntity.Launch[]>>} fetcher - fetcher function to make API calls
   * @param {number | string} [interval] - Optional Client Configuration options
   * @param {Object} [options] - Launch Search Options
   * @param {number | string} options.id - Launch id
   * @param {number | string} options.page - Page number of results
   * @param {string} options.cospar_id - Launch COSPAR ID (ie. 2022-123)
   * @param {Date | string} options.before_date - Only return launches before this date
   * @param {Date | string} options.after_date - Only return launches after this date
   * @param {Date | string} options.modified_since - Only return launches with API changes after this date
   * @param {number | string} options.location_id - Launches from this Location
   * @param {number | string} options.pad_id - Launches from this Pad
   * @param {number | string} options.provider_id - Launches from this Company
   * @param {number | string} options.tag_id - Launches with this Tag
   * @param {number | string} options.vehicle_id - Launches on this Vehicle
   * @param {ISO3166Alpha2.StateCodeUS} options.state_abbr - ISO 3166 Alpha 2 US State Code
   * @param {ISO3166Alpha2.CountryCode} options.country_code - ISO 3166 Alpha 2 Country Code
   * @param {number | string} options.search - Launches matching this search string
   * @param {number | string} options.slug - Launches matching this unique slug
   *
   */
  constructor(
    fetcher: (
      params: URLSearchParams
    ) => Promise<RLLResponse<RLLEntity.Launch[]>>,
    interval: number | string = DEFAULT_INTERVAL_IN_MINS,
    options?: RLLQueryConfig.Launches
  ) {
    super();
    this.last_call = new Date();
    this.fetcher = fetcher;

    this.interval = intervalValidator(interval);

    this.params = queryOptionsValidator(RLLEndPoint.LAUNCHES, options).catch(
      (err) => {
        error(err);
        throw err;
      }
    );
  }

  /**
   * Query wrapper to trigger events
   *
   * @private
   * @function
   *
   * @returns {void}
   */
  private query(): void {
    this.params
      .then((p) => {
        p.set("modified_since", formatToRLLISODate(this.last_call));
        return this.fetcher(p);
      })
      .then((res) => {
        for (const newLaunch of res.result) {
          const { id } = newLaunch;
          const oldLaunch = this.launches[id];
          if (oldLaunch) {
            this.emit(
              RLLWatcherEvent.CHANGE,
              this.launches[newLaunch.id],
              newLaunch
            );
          } else {
            this.emit(RLLWatcherEvent.NEW, newLaunch);
          }
          this.launches[newLaunch.id] = newLaunch;
        }

        this.last_call = new Date();
      })
      .catch((err) => {
        this.emit(RLLWatcherEvent.ERROR, err);
      });
  }

  /**
   * Begin monitoring API using the configured query parameters.
   *
   * @public
   * @function
   *
   * @returns {void}
   */
  public start(): void {
    let page = 1;
    let params: URLSearchParams;

    const fetchLaunchesForCache = (): Promise<void> => {
      return this.fetcher(params).then((res) => {
        for (const launch of res.result) {
          this.launches[launch.id] = launch;
        }
        if (res.last_page > page) {
          page++;
          params.set("page", page.toString());
          return fetchLaunchesForCache();
        }

        return;
      });
    };

    this.params
      .then((p) => {
        params = new URLSearchParams(p);
        return fetchLaunchesForCache();
      })
      .then(() => {
        this.emit(RLLWatcherEvent.READY, Object.values(this.launches));
        this.last_call = new Date();
        this.timer = setInterval(() => {
          this.query();
        }, this.interval * MS_IN_MIN);
      })
      .catch((err) => {
        this.emit(RLLWatcherEvent.INITIALIZATION_ERROR, err);
      });
  }

  /**
   * Stop monitoring API
   *
   * @public
   * @function
   *
   * @returns {void}
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
