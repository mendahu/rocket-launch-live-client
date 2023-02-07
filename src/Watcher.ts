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

const MS_IN_MIN = 60000;

export enum RLLWatcherEvent {
  NEW = "new",
  CHANGE = "change",
  ERROR = "error",
}

const intervalValidator = (interval: any): number => {
  if (typeof interval !== "number" && typeof interval !== "string") {
    error("RLLWatcher interval must be a number.");
    return 5;
  }

  if (
    typeof interval === "string" &&
    (isNaN(Number(interval)) || interval === "")
  ) {
    error("RLLWatcher interval must be a number.", "type");
    return 5;
  }

  const typedInterval = Number(interval);

  if (typedInterval < 1) {
    warn(
      "RLLWatcher does not accept intervals less than 1. Your watcher will default to 5 minute intervals unless corrected."
    );
    return 5;
  }

  return typedInterval;
};

export class RLLWatcher extends EventEmitter {
  private last_call: Date;
  private launches: Record<number, RLLEntity.Launch> = {};
  private interval: number;
  private params: Promise<URLSearchParams>;
  private timer: NodeJS.Timer | undefined;
  private fetcher: (
    params: URLSearchParams
  ) => Promise<RLLResponse<RLLEntity.Launch[]>>;

  constructor(
    fetcher: (
      params: URLSearchParams
    ) => Promise<RLLResponse<RLLEntity.Launch[]>>,
    interval: number = 5,
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

  public watch(): void {
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
        params = p;
        return fetchLaunchesForCache();
      })
      .catch((err) => {
        error(err);
      })
      .then(() => {
        this.last_call = new Date();
        this.timer = setInterval(() => {
          this.query();
        }, this.interval * MS_IN_MIN);
      });
  }

  public stop(): void {
    clearInterval(this.timer);
  }
}
