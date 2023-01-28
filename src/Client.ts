import {
  RLLClientOptions,
  RLLEndPoint,
  RLLEntity,
  RLLQueryConfig,
  RLLResponse,
} from "./types/application";
import { fetcher } from "./fetcher";
import {
  apiKeyValidator,
  optionsValidator,
  queryOptionsValidator,
} from "./utils";

class RLLClient {
  private apiKey: string;
  private config = {
    keyInQueryParams: false,
  };

  constructor(apiKey: string, options?: RLLClientOptions) {
    // Validate API Key is a valid UUID format
    // Constructor throws if not
    apiKeyValidator(apiKey);
    this.apiKey = apiKey;

    if (!options) {
      return;
    }

    // Validate Options with warnings or throws
    optionsValidator(options);

    if (options.keyInQueryParams) {
      this.config.keyInQueryParams = options.keyInQueryParams;
    }
  }

  private query<T>(endpoint: string, params: URLSearchParams): Promise<T> {
    return fetcher<T>(
      this.apiKey,
      endpoint,
      params,
      this.config.keyInQueryParams
    );
  }

  public companies(
    options?: RLLQueryConfig.Companies
  ): Promise<RLLResponse<RLLEntity.Company[] | RLLEntity.Company>> {
    return queryOptionsValidator(RLLEndPoint.COMPANIES, options).then(
      (params) =>
        this.query<RLLResponse<RLLEntity.Company[] | RLLEntity.Company>>(
          RLLEndPoint.COMPANIES,
          params
        )
    );
  }

  public launches(
    options?: RLLQueryConfig.Launches
  ): Promise<RLLResponse<RLLEntity.Launch[] | RLLEntity.Launch>> {
    return queryOptionsValidator(RLLEndPoint.LAUNCHES, options).then((params) =>
      this.query<RLLResponse<RLLEntity.Launch[] | RLLEntity.Launch>>(
        RLLEndPoint.LAUNCHES,
        params
      )
    );
  }

  public locations(
    options?: RLLQueryConfig.Locations
  ): Promise<RLLResponse<RLLEntity.Location[] | RLLEntity.Location>> {
    return queryOptionsValidator(RLLEndPoint.LOCATIONS, options).then(
      (params) =>
        this.query<RLLResponse<RLLEntity.Location[] | RLLEntity.Location>>(
          RLLEndPoint.LOCATIONS,
          params
        )
    );
  }
  public missions(
    options?: RLLQueryConfig.Missions
  ): Promise<RLLResponse<RLLEntity.Mission[] | RLLEntity.Mission>> {
    return queryOptionsValidator(RLLEndPoint.MISSIONS, options).then((params) =>
      this.query<RLLResponse<RLLEntity.Mission[] | RLLEntity.Mission>>(
        RLLEndPoint.MISSIONS,
        params
      )
    );
  }

  public pads(
    options?: RLLQueryConfig.Pads
  ): Promise<RLLResponse<RLLEntity.Pad[] | RLLEntity.Pad>> {
    return queryOptionsValidator(RLLEndPoint.PADS, options).then((params) =>
      this.query<RLLResponse<RLLEntity.Pad[] | RLLEntity.Pad>>(
        RLLEndPoint.PADS,
        params
      )
    );
  }

  public tags(
    options?: RLLQueryConfig.Tags
  ): Promise<RLLResponse<RLLEntity.Tag[] | RLLEntity.Tag>> {
    return queryOptionsValidator(RLLEndPoint.TAGS, options).then((params) =>
      this.query<RLLResponse<RLLEntity.Tag[] | RLLEntity.Tag>>(
        RLLEndPoint.TAGS,
        params
      )
    );
  }

  public vehicles(
    options?: RLLQueryConfig.Vehicles
  ): Promise<RLLResponse<RLLEntity.Vehicle[] | RLLEntity.Vehicle>> {
    return queryOptionsValidator(RLLEndPoint.VEHICLES, options).then((params) =>
      this.query<RLLResponse<RLLEntity.Vehicle[] | RLLEntity.Vehicle>>(
        RLLEndPoint.VEHICLES,
        params
      )
    );
  }
}

export default RLLClient;
