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

interface RLLRecord {
  id: number;
  name: string;
}

export namespace RLLEntity {
  interface Country {
    name: string;
    code: ISO3166Alpha2.CountryCode;
  }

  interface State {
    name: string;
    abbr: ISO3166Alpha2.StateCodeUS;
  }

  export interface Company extends RLLRecord {
    country: Country;
    inactive: boolean | null;
  }

  enum LaunchResult {
    NOT_SET = -1,
    FAILURE = 0,
    SUCCESS = 1,
    PARTIAL_FAILURE = 2,
    IN_FLIGHT_ABORT_CREWED = 3,
  }

  interface Media extends Omit<RLLRecord, "name"> {
    media_url: string | null;
    youtube_vidid: string | null;
    featured: boolean;
    ldfeatured: boolean;
    approved: boolean;
  }

  export interface Launch extends RLLRecord {
    cospar_id: string;
    sort_date: string;
    provider: Omit<Company, "inactive" | "country">;
    vehicle: Omit<Vehicle, "company_id" | "company">;
    pad: Omit<Pad, "full_name">;
    missions: Omit<Mission, "launch_id">[];
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
    latitute: string; // original API had a typo which was preserved for backwards compatibility
    latitude: string;
    longitude: string;
    state: State | null;
    statename?: string | null;
    country: Country;
    pads: Omit<Pad, "location" | "country" | "state">[];
    utc_offset: number;
  }

  export interface Mission extends RLLRecord {
    description: string | null;
    launch_id: number;
    company: Omit<Company, "slug" | "inactive" | "country">;
  }

  export interface Pad extends RLLRecord {
    full_name: string;
    location: Omit<Location, "pads" | "utc_offset" | "latitute">;
  }

  export interface Tag extends Omit<RLLRecord, "name"> {
    text: string;
    slug: string;
  }

  export interface Vehicle extends RLLRecord {
    company_id?: number;
    company: Omit<Company, "slug" | "inactive" | "country">;
  }
}

interface RLLBaseQueryConfig {
  id?: number | string;
  page?: number | string;
}

export namespace RLLQueryConfig {
  export interface Companies extends RLLBaseQueryConfig {
    name?: string | number;
    country_code?: ISO3166Alpha2.CountryCode;
    inactive?: boolean;
  }

  export interface Launches extends RLLBaseQueryConfig {
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

  export interface Locations extends RLLBaseQueryConfig {
    name?: string | number;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
  }

  export interface Missions extends RLLBaseQueryConfig {
    name?: string | number;
  }

  export interface Pads extends RLLBaseQueryConfig {
    name?: string | number;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
  }

  export interface Tags extends RLLBaseQueryConfig {
    text?: string | number;
  }

  export interface Vehicles extends RLLBaseQueryConfig {
    name?: string | number;
  }

  export interface All
    extends Companies,
      Launches,
      Locations,
      Missions,
      Pads,
      Tags,
      Vehicles {}
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
