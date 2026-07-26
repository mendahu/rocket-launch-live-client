import { EventEmitter } from "node:events";
import {
  RLLEndPoint,
  RLLEntity,
  RLLError,
  RLLQueryConfig,
  RLLResponse,
} from "../types/application.js";
import {
  error,
  warn,
  queryOptionsValidator,
  formatToRLLISODate,
} from "../utils.js";

const DEFAULT_INTERVAL_IN_MINS = 5;
const MS_IN_MIN = 60000;
/** Max concurrent page fetches while building the initial Watcher cache. */
const INIT_PAGE_CONCURRENCY = 3;

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
  private running = false;
  private queryInFlight = false;
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
   * @param {number | string} options.page - Ignored; Watcher always starts at page 1
   * @param {number | string} options.limit - Ignored; Watcher uses the API default page size
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

    // Ignore limit/page: Watcher must crawl the full matching set from page 1.
    // Leaving a caller page in params would skip earlier pages and derail the cache.
    this.params.delete("limit");
    this.params.delete("page");
  }

  /**
   * Fetch a single launches page. Always normalizes the page query param so a
   * caller-supplied `page` cannot derail pagination.
   *
   * @private
   */
  private fetchPage = (
    baseParams: URLSearchParams,
    page: number
  ): Promise<RLLResponse<RLLEntity.Launch[]>> => {
    const params = new URLSearchParams(baseParams);
    params.delete("page");
    if (page > 1) {
      params.set("page", page.toString());
    }

    this.emit("call", params);
    return this.fetcher(params);
  };

  /**
   * Fetch every page for a query. After page 1 reveals `last_page`, remaining
   * pages are fetched with bounded concurrency (1 = fully serial).
   *
   * @private
   */
  private fetchAllPages = async (
    baseParams: URLSearchParams,
    callback: (results: RLLResponse<RLLEntity.Launch[]>) => void,
    concurrency: number
  ): Promise<void> => {
    const first = await this.fetchPage(baseParams, 1);
    callback(first);

    const lastPage = first.last_page;
    if (lastPage <= 1) {
      return;
    }

    let nextPage = 2;
    const workerCount = Math.min(Math.max(concurrency, 1), lastPage - 1);

    const workers = Array.from({ length: workerCount }, async () => {
      while (nextPage <= lastPage) {
        const page = nextPage;
        nextPage += 1;
        const results = await this.fetchPage(baseParams, page);
        callback(results);
      }
    });

    await Promise.all(workers);
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
    // Skip ticks that fire while a previous poll (possibly multi-page) is still
    // running, so slow responses cannot stack concurrent requests and events.
    if (this.queryInFlight) {
      return;
    }
    this.queryInFlight = true;

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

    // Polls stay serial: change sets are usually small and ordered processing
    // keeps event emission simpler.
    this.fetchAllPages(new URLSearchParams(this.params), notify, 1)
      .then(() => {
        this.last_call = new Date();
      })
      .catch((err) => {
        this.emit("error", err);
      })
      .finally(() => {
        this.queryInFlight = false;
      });
  }

  /**
   * Begin monitoring API using the configured query parameters.
   * Subsequent calls while already running are no-ops.
   *
   * @public
   * @function
   *
   * @returns {void}
   */
  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;

    const buildCache = (response: RLLResponse<RLLEntity.Launch[]>) => {
      for (const launch of response.result) {
        this.launches.set(launch.id, launch);
      }
    };

    this.fetchAllPages(
      new URLSearchParams(this.params),
      buildCache,
      INIT_PAGE_CONCURRENCY
    )
      .then(() => {
        // stop() may have been called during the initial crawl
        if (!this.running) {
          return;
        }
        this.emit("ready", this.launches);
        this.last_call = new Date();
        this.timer = setInterval(() => {
          this.query();
        }, this.interval * MS_IN_MIN);
      })
      .catch((err) => {
        this.running = false;
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
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
