import EventEmitter from "events";
import {
  RLLEndPoint,
  RLLEntity,
  RLLError,
  RLLQueryConfig,
  RLLQueryParams,
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

interface IRLLWatcherEvent {
  new: (launch: RLLEntity.Launch) => void;
  change: (oldLaunch: RLLEntity.Launch, newLaunch: RLLEntity.Launch) => void;
  error: (error: RLLError) => void;
  ready: (launches: Map<number, RLLEntity.Launch>) => void;
  init_error: (error: RLLError) => void;
  call: (params: URLSearchParams) => void;
}

/**
 * Class representing a RocketLaunch.Live Client Watcher
 * @class
 */
export class RLLWatcher extends EventEmitter {
  private _untypedOn: (
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ) => this;
  private _untypedEmit: (eventName: string | symbol, ...args: any[]) => boolean;
  private last_call: Date;
  public launches: Map<number, RLLEntity.Launch> = new Map();
  private interval: number;
  private params: URLSearchParams;
  private timer: NodeJS.Timeout | undefined;
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

    // Reassign default Event Emitter methods
    this._untypedOn = this.on;
    this._untypedEmit = this.emit;

    // Methord Overide for type safety
    this.on = <K extends keyof IRLLWatcherEvent>(
      event: K,
      listener: IRLLWatcherEvent[K]
    ): this => this._untypedOn(event, listener);
    this.emit = <K extends keyof IRLLWatcherEvent>(
      event: K,
      ...args: Parameters<IRLLWatcherEvent[K]>
    ): boolean => this._untypedEmit(event, ...args);

    this.last_call = new Date();
    this.fetcher = fetcher;

    this.interval = intervalValidator(interval);
    this.params = queryOptionsValidator(RLLEndPoint.LAUNCHES, options);

    // ignore any limit params as these cause unnecessary API calls and do not serve the Watcher role
    this.params.delete("limit");
  }

  /**
   * Recursive API Caller to iterate through pages
   *
   * @private
   * @function
   *
   * @param {URLSearchParams} params - Search parameters
   * @param {function(results: RLLResponse<RLLEntity.Launch[]>)} callback - To execute on each page
   *
   * @returns {Promise<void>}
   */
  private recursivelyFetch = (
    params: URLSearchParams,
    callback: (results: RLLResponse<RLLEntity.Launch[]>) => any
  ): Promise<void> => {
    let page = 1;

    const recursiveFetcher = (): Promise<void> => {
      this.emit("call", params);
      return this.fetcher(params).then((results) => {
        callback(results);

        if (results.last_page > page) {
          page++;
          params.set("page", page.toString());
          return recursiveFetcher();
        }

        return;
      });
    };

    return recursiveFetcher();
  };

  /**
   * Query wrapper to trigger events
   *
   * @private
   * @function
   *
   * @returns {void}
   */
  private query(): void {
    const notify = (response: RLLResponse<RLLEntity.Launch[]>) => {
      for (const changedLaunch of response.result) {
        const { id } = changedLaunch;
        const oldLaunch = this.launches.get(id);
        if (oldLaunch) {
          this.emit("change", oldLaunch, changedLaunch);
        } else {
          this.emit("new", changedLaunch);
        }
        this.launches.set(changedLaunch.id, changedLaunch);
      }
    };

    this.params.set("modified_since", formatToRLLISODate(this.last_call));

    this.recursivelyFetch(new URLSearchParams(this.params), notify)
      .then(() => {
        this.last_call = new Date();
      })
      .catch((err) => {
        this.emit("error", err);
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
    const buildCache = (response: RLLResponse<RLLEntity.Launch[]>) => {
      for (const launch of response.result) {
        this.launches.set(launch.id, launch);
      }
    };

    this.recursivelyFetch(new URLSearchParams(this.params), buildCache)
      .then(() => {
        this.emit("ready", this.launches);
        this.last_call = new Date();
        this.timer = setInterval(() => {
          this.query();
        }, this.interval * MS_IN_MIN);
      })
      .catch((err) => {
        this.emit("init_error", err);
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
