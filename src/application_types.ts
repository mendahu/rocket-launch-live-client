import { ISO3166Alpha2 } from "./standards_types";

interface RLLRecord {
  id: number;
  name: string;
}

export namespace RLLEntity {
  export interface Company extends RLLRecord {
    country: string;
    slug: string;
    inactive: boolean;
  }

  enum LaunchResult {
    NOT_SET = -1,
    FAILURE = 0,
    SUCCESS = 1,
    PARTIAL_FAILURE = 2,
    IN_FLIGHT_ABORT_CREWED = 3,
  }

  export interface Launch extends RLLRecord {
    sort_date: Date;
    provider: Company;
    vehicle: Vehicle;
    pad: Pad;
    missions: Mission[];
    launch_description: string;
    win_open: Date;
    t0: Date;
    win_close: Date;
    est_date: Date;
    date_str: string;
    tags: Tag[];
    slug: string;
    weather_summary: unknown;
    weather_temp: number;
    weather_icon: string;
    weather_updated: Date;
    quicktext: string;
    media?: {
      ldfeatured: string;
      featured: string;
    }[];
    result: LaunchResult;
    modified: Date;
  }

  export interface Location extends RLLRecord {
    latitude: number;
    longitude: number;
    country: string;
    state: string;
    utc_offset: number;
  }

  export interface Mission extends RLLRecord {
    description: string;
    launch: Launch;
    company: Company;
  }

  export interface Pad extends RLLRecord {
    location: Location;
    country: string;
    state: string;
  }

  export interface Tag extends Omit<RLLRecord, "name"> {
    text: string;
  }

  export interface Vehicle extends RLLRecord {}
}

interface RLLBaseQueryConfig {
  id?: number;
}

export namespace RLLQueryConfig {
  export interface Companies extends RLLBaseQueryConfig {
    name?: string;
    country_code?: ISO3166Alpha2.CountryCode;
    slug?: string;
    inactive?: boolean;
  }

  export interface Launches extends RLLBaseQueryConfig {
    cospar_id?: string;
    after_date?: Date;
    before_date?: Date;
    modified_since?: Date;
    location_id?: number;
    pad_id?: number;
    provider_id?: number;
    tag_id?: number;
    vehicle_id?: number;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
    search?: string;
    slug?: string;
  }

  export interface Locations extends RLLBaseQueryConfig {
    name?: string;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
  }

  export interface Missions extends RLLBaseQueryConfig {
    name?: string;
  }

  export interface Pads extends RLLBaseQueryConfig {
    name?: string;
    state_abbr?: ISO3166Alpha2.StateCodeUS;
    country_code?: ISO3166Alpha2.CountryCode;
  }

  export interface Tags extends RLLBaseQueryConfig {
    text?: string;
  }

  export interface Vehicles extends RLLBaseQueryConfig {
    name?: string;
  }
}

export namespace RLLClient {
  export type Options = {
    clientSide?: boolean;
  };
}
