import { ISO3166Alpha2 } from "./standards";

export enum RLLEndPoint {
  COMPANIES = "companies",
  LAUNCHES = "launches",
  LOCATIONS = "locations",
  MISSIONS = "missions",
  PADS = "pads",
  TAGS = "tags",
  VEHICLES = "vehicles",
}

export namespace RLLEntity {
  interface RLLRecord {
    id: number;
  }

  export interface Country {
    name: string;
    code: ISO3166Alpha2.CountryCode | "";
  }

  export interface State {
    name: string;
    abbr?: ISO3166Alpha2.StateCodeUS;
  }

  export interface Company extends RLLRecord {
    name: string;
    country: Country;
    inactive: boolean | null;
  }

  export enum LaunchResult {
    NOT_SET = -1,
    FAILURE = 0,
    SUCCESS = 1,
    PARTIAL_FAILURE = 2,
    IN_FLIGHT_ABORT_CREWED = 3,
  }

  export interface Media extends RLLRecord {
    media_url: string | null;
    youtube_vidid: string | null;
    featured: boolean;
    ldfeatured: boolean;
    approved: boolean;
  }

  export interface Launch extends RLLRecord {
    name: string;
    cospar_id: string | null;
    sort_date: string;
    provider: { slug: string } & Omit<Company, "inactive" | "country">;
    vehicle: { company_id: number; slug: string } & Omit<Vehicle, "company">;
    pad: Omit<Pad, "full_name" | "location"> & {
      location: Omit<
        Location,
        | "pads"
        | "utc_offset"
        | "latitute"
        | "latitude"
        | "longitude"
        | "country"
        | "state"
      > & {
        slug: string;
        country: string;
        state: ISO3166Alpha2.StateCodeUS | null;
      };
    };
    missions: Omit<Mission, "launch_id" | "company">[];
    mission_description: string | null;
    launch_description: string;
    win_open: string | null;
    t0: string | null;
    win_close: string | null;
    est_date: {
      month: number | null;
      day: number | null;
      year: number | null;
      quarter: number | null;
    };
    date_str: string;
    tags: Omit<Tag, "slug">[];
    slug: string;
    weather_summary: string | null;
    weather_condition: string | null;
    weather_wind_mph: number | null;
    weather_temp: number | null;
    weather_icon: string | null;
    weather_updated: string | null;
    quicktext: string;
    media?: Media[];
    result: LaunchResult;
    suborbital: boolean;
    modified: string;
  }

  export interface Location extends RLLRecord {
    name: string;
    latitute: string; // original API had a typo which was preserved for backwards compatibility
    latitude: string;
    longitude: string;
    state: State | null;
    statename?: string | null;
    country: Country | null;
    pads: Omit<Pad, "full_name" | "location" | "country" | "state">[];
    utc_offset: number | null;
  }

  export interface Mission extends RLLRecord {
    name: string;
    description: string | null;
    launch_id: number;
    company: Omit<Company, "inactive" | "country">;
  }

  export interface Pad extends RLLRecord {
    name: string;
    full_name: string;
    location: Omit<Location, "pads" | "utc_offset" | "latitute" | "statename">;
  }

  export interface Tag extends RLLRecord {
    text: string;
    slug: string;
  }

  export interface Vehicle extends RLLRecord {
    name: string;
    company: Omit<Company, "inactive" | "country">;
  }
}

export const RLLQueryParams = {
  id: true,
  page: true,
  name: true,
  country_code: true,
  inactive: true,
  cospar_id: true,
  after_date: true,
  before_date: true,
  modified_since: true,
  location_id: true,
  pad_id: true,
  provider_id: true,
  tag_id: true,
  vehicle_id: true,
  state_abbr: true,
  search: true,
  slug: true,
  text: true,
};

export namespace RLLQueryConfig {
  interface Base {
    id?: number | string;
    page?: number | string;
  }

  export interface Companies extends Base {
    name?: string | number;
    country_code?: ISO3166Alpha2.CountryCode;
    inactive?: boolean;
  }

  export interface Launches extends Base {
    cospar_id?: string;
    after_date?: Date | string;
    before_date?: Date | string;
    modified_since?: Date | string;
    location_id?: number | string;
    pad_id?: number | string;
    provider_id?: number | string;
    tag_id?: number | string;
    vehicle_id?: number | string;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
    search?: string | number;
    slug?: string | number;
  }

  export interface Locations extends Base {
    name?: string | number;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
  }

  export interface Missions extends Base {
    name?: string | number;
  }

  export interface Pads extends Base {
    name?: string | number;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
  }

  export interface Tags extends Base {
    text?: string | number;
  }

  export interface Vehicles extends Base {
    name?: string | number;
  }
}

export type RLLClientOptions = {
  keyInQueryParams?: boolean;
};

export type RLLResponse<T> = {
  errors?: string[];
  valid_auth: boolean;
  count: number;
  limit: number;
  total: number;
  last_page: number;
  result: T;
};

export type RLLError = {
  error: string;
  statusCode: number | null;
  message: string;
  server_response: string | null;
};
