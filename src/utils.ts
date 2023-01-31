import { RLLEndPoint, RLLQueryConfig } from "./types/application";
import { countryCodes, usStateCodes } from "./types/standards";

export const apiKeyValidator = (apiKey: any): void => {
  if (apiKey === undefined) {
    error("RLL Client requires API Key", "type");
  }

  if (typeof apiKey !== "string") {
    error("RLL Client API Key must be a string", "type");
  }

  if (apiKey === "") {
    error("RLL Client API Key cannot be an empty string", "type");
  }

  const validator = apiKey.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );

  if (validator === null) {
    error(
      "RLL Client API Key appears malformed. RLL Client API Keys are in UUID format.",
      "type"
    );
  }
};

export const optionsValidator = (options: {}): void => {
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
  string: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        return reject("Must be a string");
      }
      if (option.length <= 0) {
        return reject("String must have length greater than 0");
      }
      resolve(option);
    });
  },
  boolean: (option: any): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "boolean") {
        return reject("Must be a boolean");
      }
      resolve(option === true ? 1 : 0);
    });
  },
  number: (option: any): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (typeof option === "number") {
        return resolve(option);
      }
      if (typeof option !== "string" || isNaN(Number(option))) {
        return reject("Must be a number");
      } else {
        resolve(Number(option));
      }
    });
  },
  countryCode: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        return reject("Must be a string");
      }
      if (!countryCodes[option]) {
        return reject(
          "Invalid country code. Country codes should follow ISO 3166-1 A2 convention."
        );
      }
      resolve(option);
    });
  },
  stateCode: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        return reject("Must be a string");
      }
      if (!usStateCodes[option]) {
        return reject(
          "Invalid United States State Code. State Codes should follow ISO 3166-2 convention."
        );
      }
      resolve(option);
    });
  },
  cosparId: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        return reject("Must be a string");
      }
      if (!option.match(/^\d{4}\-\d{3}$/g)) {
        return reject(
          "Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)"
        );
      }
      resolve(option);
    });
  },
  shortDate: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!(option instanceof Date)) {
        return reject("Must be a Date");
      }
      resolve(
        `${option.getUTCFullYear()}-${option.getUTCMonth()}-${option.getUTCDate()}`
      );
    });
  },
  isoDate: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!(option instanceof Date)) {
        return reject("Must be a Date");
      }
      resolve(option.toISOString());
    });
  },
};

const optionsMap = {
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
  options?: RLLQueryConfig.All
): Promise<URLSearchParams> => {
  const params = new URLSearchParams();
  const paramsPromises = [];

  if (!options) {
    return Promise.resolve(params);
  }

  if (
    (options.id || options.slug || options.cospar_id) &&
    Object.keys(options).length > 1
  ) {
    warn(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  }

  for (const option in options) {
    if (!optionsMap[resource][option]) {
      warn(
        `Parameter "${option}" is not a valid option for the ${resource} endpoint. It will be ignored.`
      );
      continue;
    }

    if (options[option] === undefined) {
      warn(`Parameter "${option}" is undefined and will be ignored.`);
      continue;
    }

    const promise = optionsMap[resource][option](options[option])
      .then((o) => params.set(option, o))
      .catch((err) => {
        throw `Malformed query parameter for resource "${resource}" and parameter: "${option}": ${err}.`;
      });

    paramsPromises.push(promise);
  }

  return Promise.all(paramsPromises).then(() => params);
};

export const warn = (msg: string) => console.warn(`[RLL Client]: ${msg}`);

export const error = (
  msg: string,
  type: "type" | "range" | "error" = "error"
) => {
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