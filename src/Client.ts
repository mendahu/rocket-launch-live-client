import {
  RLLClientOptions,
  RLLEndPoint,
  RLLEntity,
  RLLQueryConfig,
} from "./application_types";
import { BASE_URL } from "./constants";
import { apiKeyValidator } from "./utils";

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

    if (options.keyInQueryParams) {
      this.config.keyInQueryParams = options.keyInQueryParams;
    }
  }

  private query<T>(endpoint: string): Promise<T> {
    const url = new URL("json/" + endpoint, BASE_URL);
    let headers: HeadersInit | undefined;

    if (this.config.keyInQueryParams) {
      url.searchParams.set("key", this.apiKey);
    } else {
      headers = { authorization: `Bearer ${this.apiKey}` };
    }

    return fetch(url.href, { headers }).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw res;
      }
    });
  }

  public companies(
    options?: RLLQueryConfig.Companies
  ): Promise<RLLEntity.Company[] | RLLEntity.Company> {
    return this.query<RLLEntity.Company[] | RLLEntity.Company>(
      RLLEndPoint.COMPANIES
    );
  }

  public launches(
    options?: RLLQueryConfig.Launches
  ): Promise<RLLEntity.Launch[] | RLLEntity.Launch> {
    return this.query<RLLEntity.Launch[] | RLLEntity.Launch>(
      RLLEndPoint.LAUNCHES
    );
  }

  public locations(
    options?: RLLQueryConfig.Locations
  ): Promise<RLLEntity.Location[] | RLLEntity.Location> {
    return this.query<RLLEntity.Location[] | RLLEntity.Location>(
      RLLEndPoint.LOCATIONS
    );
  }

  public missions(
    options?: RLLQueryConfig.Missions
  ): Promise<RLLEntity.Mission[] | RLLEntity.Mission> {
    return this.query<RLLEntity.Mission[] | RLLEntity.Mission>(
      RLLEndPoint.MISSIONS
    );
  }

  public pads(
    options?: RLLQueryConfig.Pads
  ): Promise<RLLEntity.Pad[] | RLLEntity.Pad> {
    return this.query<RLLEntity.Pad[] | RLLEntity.Pad>(RLLEndPoint.PADS);
  }

  public tags(
    options?: RLLQueryConfig.Tags
  ): Promise<RLLEntity.Tag[] | RLLEntity.Tag> {
    return this.query<RLLEntity.Tag[] | RLLEntity.Tag>(RLLEndPoint.TAGS);
  }

  public vehicles(
    options?: RLLQueryConfig.Vehicles
  ): Promise<RLLEntity.Vehicle[] | RLLEntity.Vehicle> {
    return this.query<RLLEntity.Vehicle[] | RLLEntity.Vehicle>(
      RLLEndPoint.VEHICLES
    );
  }
}

export default RLLClient;
