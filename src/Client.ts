import {
  RLLClientOptions,
  RLLEndPoint,
  RLLEntity,
  RLLQueryConfig,
  RLLQueryParams,
  RLLResponse,
} from "./types/application";
import { fetcher } from "./fetcher";
import {
  apiKeyValidator,
  optionsValidator,
  queryOptionsValidator,
} from "./utils";
import { RLLWatcher } from "./Watcher";

/**
 * Class representing a RocketLaunch.Live client
 * @class
 */
export class RLLClient {
  private apiKey: string;
  private config = {
    keyInQueryParams: false,
  };

  /**
   * Create a new RocketLaunch.live Client
   *
   * @param {string} apiKey - Your RocketLaunch.Live API Key
   * @param {Object} [options] - Optional Client Configuration options
   * @param {boolean} options.keyInQueryParams - Set to true to send your API Key via Query parameters instead of Authorization Header (not recommended)
   *
   */
  constructor(apiKey: string, options?: RLLClientOptions) {
    // Validate API Key is a valid UUID format
    // Constructor throws if not
    this.apiKey = apiKeyValidator(apiKey);

    if (!options) {
      return;
    }

    // Validate Options with warnings or throws
    optionsValidator(options);

    if (options.keyInQueryParams) {
      this.config.keyInQueryParams = options.keyInQueryParams;
    }
  }

  /**
   * Used internally to make API query
   *
   * @private
   *
   * @template T
   *
   * @param {string} endpoint - API endpoint (ie. "/launches")
   * @param {URLSearchParams} params - API Search Params
   *
   * @returns {Promise<T>}
   */
  private query<T>(endpoint: string, params: URLSearchParams): Promise<T> {
    return fetcher<T>(
      this.apiKey,
      endpoint,
      params,
      this.config.keyInQueryParams
    );
  }

  /**
   * Instantiate a new RLL Watcher which will continually query the API for changes to the launches endpoint
   *
   * @public
   *
   * @param {number} interval - Interval in minutes to query the API for changes. Defaults to 5 minutes, cannot be less than 1 minute
   * @param {RLLQueryConfig.Launches} options - Query options, same as calling the launches method
   *
   * @returns {RLLWatcher}
   */
  public watch(
    interval?: number | string,
    options?: RLLQueryConfig.Launches
  ): RLLWatcher {
    return new RLLWatcher(
      (params: URLSearchParams): Promise<RLLResponse<RLLEntity.Launch[]>> =>
        this.query<RLLResponse<RLLEntity.Launch[]>>(
          RLLEndPoint.LAUNCHES,
          params
        ),
      interval,
      options
    );
  }

  /**
   * Fetch launch companies
   *
   * @public
   * @function
   *
   * @param {Object} [options] - Launch Company Search Options
   * @param {number | string} options.id - Company id
   * @param {number | string} options.page - Page number of results
   * @param {number | string} options.name - Company name
   * @param {ISO3166Alpha2.CountryCode} options.country_code - ISO 3166 Alpha 2 Country Code
   * @param {boolean} options.inactive - Company inactive status
   *
   * @returns {Promise<RLLResponse<RLLEntity.Company[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.companies({ country_code: "US" })
   */
  public companies(
    options?: RLLQueryConfig.Companies
  ): Promise<RLLResponse<RLLEntity.Company[]>> {
    const params = queryOptionsValidator(RLLEndPoint.COMPANIES, options);
    return this.query<RLLResponse<RLLEntity.Company[]>>(
      RLLEndPoint.COMPANIES,
      params
    );
  }

  /**
   * Fetch launches
   *
   * @public
   * @function
   *
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
   * @returns {Promise<RLLResponse<RLLEntity.Launch[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.launches({ after_date: new Date("2022-10-10") })
   */
  public launches(
    options?: RLLQueryConfig.Launches
  ): Promise<RLLResponse<RLLEntity.Launch[]>> {
    const params = queryOptionsValidator(RLLEndPoint.LAUNCHES, options);
    return this.query<RLLResponse<RLLEntity.Launch[]>>(
      RLLEndPoint.LAUNCHES,
      params
    );
  }

  /**
   * Fetch launch locations
   *
   * @public
   * @function
   *
   * @param {Object} [options] - Launch Location Search Options
   * @param {number | string} options.id - Location id
   * @param {number | string} options.page - Page number of results
   * @param {number | string} options.name - Location name
   * @param {ISO3166Alpha2.StateCodeUS} options.state_abbr - ISO 3166 Alpha 2 US State Code
   * @param {ISO3166Alpha2.CountryCode} options.country_code - ISO 3166 Alpha 2 Country Code
   *
   * @returns {Promise<RLLResponse<RLLEntity.Location[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.locations({ country_code: "US" })
   */
  public locations(
    options?: RLLQueryConfig.Locations
  ): Promise<RLLResponse<RLLEntity.Location[]>> {
    const params = queryOptionsValidator(RLLEndPoint.LOCATIONS, options);
    return this.query<RLLResponse<RLLEntity.Location[]>>(
      RLLEndPoint.LOCATIONS,
      params
    );
  }

  /**
   * Fetch launch Missions
   *
   * @public
   * @function
   *
   * @param {Object} [options] - Launch Mission Search Options
   * @param {number | string} options.id - Mission id
   * @param {number | string} options.page - Page number of results
   * @param {number | string} options.name - Mission name
   *
   * @returns {Promise<RLLResponse<RLLEntity.Mission[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.missions({ name: "Mars 2020" })
   */
  public missions(
    options?: RLLQueryConfig.Missions
  ): Promise<RLLResponse<RLLEntity.Mission[]>> {
    const params = queryOptionsValidator(RLLEndPoint.MISSIONS, options);
    return this.query<RLLResponse<RLLEntity.Mission[]>>(
      RLLEndPoint.MISSIONS,
      params
    );
  }

  /**
   * Fetch launch pads
   *
   * @public
   * @function
   *
   * @param {Object} [options] - Launch Pad Search Options
   * @param {number | string} options.id - Pad id
   * @param {number | string} options.page - Page number of results
   * @param {number | string} options.name - Pad name
   * @param {ISO3166Alpha2.StateCodeUS} options.state_abbr - ISO 3166 Alpha 2 US State Code
   * @param {ISO3166Alpha2.CountryCode} options.country_code - ISO 3166 Alpha 2 Country Code
   *
   * @returns {Promise<RLLResponse<RLLEntity.Pad[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.pads({ country_code: "US" })
   */
  public pads(
    options?: RLLQueryConfig.Pads
  ): Promise<RLLResponse<RLLEntity.Pad[]>> {
    const params = queryOptionsValidator(RLLEndPoint.PADS, options);
    return this.query<RLLResponse<RLLEntity.Pad[]>>(RLLEndPoint.PADS, params);
  }

  /**
   * Fetch launch tags
   *
   * @public
   * @function
   *
   * @param {Object} [options] - Launch Tag Search Options
   * @param {number | string} options.id - Tag id
   * @param {number | string} options.page - Page number of results
   * @param {number | string} options.text - Tag text
   *
   * @returns {Promise<RLLResponse<RLLEntity.Tag[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.tags({ text: "Crewed" })
   */
  public tags(
    options?: RLLQueryConfig.Tags
  ): Promise<RLLResponse<RLLEntity.Tag[]>> {
    const params = queryOptionsValidator(RLLEndPoint.TAGS, options);
    return this.query<RLLResponse<RLLEntity.Tag[]>>(RLLEndPoint.TAGS, params);
  }

  /**
   * Fetch launch Vehicles
   *
   * @public
   * @function
   *
   * @param {Object} [options] - Launch Vehicles Search Options
   * @param {number | string} options.id - Vehicle id
   * @param {number | string} options.page - Page number of results
   * @param {number | string} options.name - Vehicle name
   *
   * @returns {Promise<RLLResponse<RLLEntity.Vehicle[]>>} Array of companies wrapped in a standard RLL Response
   *
   * @example
   *
   * const response = client.vehicles({ name: "Falcon 9" })
   */
  public vehicles(
    options?: RLLQueryConfig.Vehicles
  ): Promise<RLLResponse<RLLEntity.Vehicle[]>> {
    const params = queryOptionsValidator(RLLEndPoint.VEHICLES, options);
    return this.query<RLLResponse<RLLEntity.Vehicle[]>>(
      RLLEndPoint.VEHICLES,
      params
    );
  }
}
