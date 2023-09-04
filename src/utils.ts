import { RLLEndPoint, RLLQueryConfig } from "./types/application.js";
import { isValidCountryCode, isValidStateCode } from "./types/standards.js";

const getLeadingZero = (month: number, offset: number = 0): string => {
  const str = "0".concat((month + offset).toString());
  return str.slice(-2);
};

export const formatToRLLISODate = (date: Date): string => {
  return date.toISOString().slice(0, 19).concat("Z");
};

export const apiKeyValidator = (apiKey: any): string => {
  if (apiKey === undefined) {
    error("RLL Client requires API Key", "type");
  }

  if (typeof apiKey !== "string") {
    error("RLL Client API Key must be a string", "type");
  }

  const trimmedKey = apiKey.trim();

  if (trimmedKey === "") {
    error("RLL Client API Key cannot be an empty string", "type");
  }

  const validator = trimmedKey.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );

  if (validator === null) {
    error(
      "RLL Client API Key appears malformed. RLL Client API Keys are in UUID format.",
      "type"
    );
  }

  return trimmedKey;
};

export const optionsValidator = (options: {
  [key: string | number | symbol]: any;
}): void => {
  for (const option in options) {
    if (option !== "keyInQueryParams") {
      warn(
        `RLL Client options do not accept a "${option}" property. This property will be ignored.`
      );
    } else {
      if (typeof options[option] !== "boolean") {
        error(
          "RLL Client configuration option 'keyInQueryParams' must be a boolean.",
          "type"
        );
      }
    }
  }
};

const validators = {
  string: (option: any): string => {
    if (typeof option === "number") {
      return option.toString();
    }
    if (typeof option !== "string") {
      throw "Must be a string";
    }
    if (option.length <= 0) {
      throw "String must have length greater than 0";
    }
    return option;
  },
  boolean: (option: any): number => {
    if (typeof option !== "boolean") {
      throw "Must be a boolean";
    }
    return option === true ? 1 : 0;
  },
  number: (option: any): number => {
    if (typeof option === "number") {
      return option;
    }
    if (typeof option !== "string" || option === "" || isNaN(Number(option))) {
      throw "Must be a number";
    } else {
      return Number(option);
    }
  },
  countryCode: (option: any): string => {
    if (typeof option !== "string") {
      throw "Must be a string";
    }
    if (!isValidCountryCode(option)) {
      throw "Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.";
    }
    return option;
  },
  stateCode: (option: any): string => {
    if (typeof option !== "string") {
      throw "Must be a string";
    }
    if (!isValidStateCode(option)) {
      throw "Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.";
    }
    return option;
  },
  cosparId: (option: any): string => {
    if (typeof option !== "string") {
      throw "Must be a string";
    }
    if (!option.match(/^\d{4}\-\d{3}$/g)) {
      throw "Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)";
    }
    return option;
  },
  shortDate: (option: any): string => {
    if (typeof option !== "string" && !(option instanceof Date)) {
      throw "Must be a JavaScript Date Object or ISO 8601 Date String";
    }

    let date: Date;

    if (typeof option === "string") {
      const parsed = Date.parse(option);
      if (isNaN(parsed)) {
        throw "Must be an ISO 8601 Date String";
      }
      date = new Date(parsed);
    } else {
      date = option;
    }

    return `${date.getUTCFullYear()}-${getLeadingZero(
      date.getUTCMonth(),
      1
    )}-${getLeadingZero(date.getUTCDate())}`;
  },
  isoDate: (option: any): string => {
    if (typeof option !== "string" && !(option instanceof Date)) {
      throw "Must be a JavaScript Date Object or ISO 8601 Date String";
    }

    let date: Date;

    if (typeof option === "string") {
      const parsed = Date.parse(option);
      if (isNaN(parsed)) {
        throw "Must be an ISO 8601 Date String";
      }
      date = new Date(parsed);
    } else {
      date = option;
    }

    return formatToRLLISODate(date);
  },
  limit: (option: any): number => {
    const num = validators.number(option);
    if (num < 1) {
      throw "Must be a number greater than 0";
    }
    if (num > 25) {
      throw "Must be a number less than 26";
    }
    return num;
  },
  direction: (option: any): string => {
    if (typeof option !== "string") {
      throw "Must be a string";
    }
    if (option !== "asc" && option !== "desc") {
      throw 'String must be either "asc" or "desc"';
    }
    return option;
  },
};

const optionsMap: Record<RLLEndPoint, any> = {
  companies: {
    page: validators.number,
    id: validators.number,
    name: validators.string,
    country_code: validators.countryCode,
    inactive: validators.boolean,
  },
  launches: {
    page: validators.number,
    id: validators.number,
    cospar_id: validators.cosparId,
    after_date: validators.shortDate,
    before_date: validators.shortDate,
    modified_since: validators.isoDate,
    location_id: validators.number,
    pad_id: validators.number,
    provider_id: validators.number,
    tag_id: validators.number,
    vehicle_id: validators.number,
    state_abbr: validators.stateCode,
    country_code: validators.countryCode,
    search: validators.string,
    slug: validators.string,
    limit: validators.limit,
    direction: validators.direction,
  },
  locations: {
    page: validators.number,
    id: validators.number,
    name: validators.string,
    state_abbr: validators.stateCode,
    country_code: validators.countryCode,
  },
  missions: {
    page: validators.number,
    id: validators.number,
    name: validators.string,
  },
  pads: {
    page: validators.number,
    id: validators.number,
    name: validators.string,
    state_abbr: validators.stateCode,
    country_code: validators.countryCode,
  },
  tags: {
    page: validators.number,
    id: validators.number,
    text: validators.string,
  },
  vehicles: {
    page: validators.number,
    id: validators.number,
    name: validators.string,
  },
};

export const queryOptionsValidator = (
  resource: RLLEndPoint,
  options?:
    | RLLQueryConfig.Companies
    | RLLQueryConfig.Launches
    | RLLQueryConfig.Locations
    | RLLQueryConfig.Missions
    | RLLQueryConfig.Pads
    | RLLQueryConfig.Tags
    | RLLQueryConfig.Vehicles
): URLSearchParams => {
  const params = new URLSearchParams();

  if (options === undefined) {
    return params;
  }

  if (
    typeof options === "string" ||
    typeof options === "number" ||
    typeof options === "boolean" ||
    typeof options === "bigint" ||
    typeof options === "symbol" ||
    typeof options === "function" ||
    options === null ||
    Array.isArray(options)
  ) {
    error("Invalid type for query options. Must be an object.");
  }

  if (
    (options.id || "slug" in options || "cospar_id" in options) &&
    Object.keys(options).length > 1
  ) {
    warn(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  }

  for (const option in options) {
    if (!(option in optionsMap[resource])) {
      warn(
        `Parameter "${option}" is not a valid option for the ${resource} endpoint. It will be ignored.`
      );
      continue;
    }

    if (options[option as keyof typeof options] === undefined) {
      warn(`Parameter "${option}" is undefined and will be ignored.`);
      continue;
    }

    try {
      const o = optionsMap[resource][option](
        options[option as keyof typeof options]
      );
      params.set(option, o);
    } catch (err) {
      error(
        `Malformed query parameter for resource "${resource}" and parameter: "${option}": ${err}.`,
        "type"
      );
    }
  }

  return params;
};

export const warn = (msg: string) => console.warn(`[RLL Client]: ${msg}`);

export const error = (
  msg: string,
  type: "type" | "range" | "error" = "error"
): void => {
  switch (type) {
    case "error": {
      throw new Error(`[RLL Client]: ${msg}`);
    }
    case "type": {
      throw new TypeError(`[RLL Client]: ${msg}`);
    }
    case "range": {
      throw new RangeError(`[RLL Client]: ${msg}`);
    }
  }
};
