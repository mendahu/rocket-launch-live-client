import { RLLEndPoint, RLLQueryConfig } from "./types/application";

export const apiKeyValidator = (apiKey: any): void => {
  if (apiKey === undefined) {
    throw new Error("[RLL Client]: RLL Client requires API Key");
  }

  if (typeof apiKey !== "string") {
    throw new Error("[RLL Client]: RLL Client API Key must be a string");
  }

  if (apiKey === "") {
    throw new Error(
      "[RLL Client]: RLL Client API Key cannot be an empty string"
    );
  }

  const validator = apiKey.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );

  if (validator === null) {
    throw new Error(
      "[RLL Client]: RLL Client API Key appears malformed. RLL Client API Keys are in UUID format."
    );
  }
};

export const optionsValidator = (options: {}): void => {
  for (const option in options) {
    if (option !== "keyInQueryParams") {
      console.warn(
        `[RLL Client]: RLL Client options do not accept a "${option}" property. This property will be ignored.`
      );
    } else {
      if (typeof options[option] !== "boolean") {
        throw new Error(
          "[RLL Client]: RLL Client configuration option 'keyInQueryParams' must be a boolean."
        );
      }
    }
  }
};

const validators = {
  string: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        reject("Must be a string");
      }
      if (option.length <= 0) {
        reject("String must have length greater than 0");
      }
      resolve(option);
    });
  },
  boolean: (option: any): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "boolean") {
        reject("Must be a boolean");
      }
      resolve(option);
    });
  },
  number: (option: any): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "number") {
        reject("Must be a number");
      }
      resolve(option);
    });
  },
  countryCode: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        reject("Must be a string");
      }
      if (option.length !== 2) {
        reject("Countries codes are two letters only (ie. RU, US)");
      }
      resolve(option);
    });
  },
  stateCode: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        reject("Must be a string");
      }
      if (option.length !== 2) {
        reject("US state codes are two letters only (ie. FL, CA)");
      }
      resolve(option);
    });
  },
  cosparId: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        reject("Must be a string");
      }
      if (!option.match(/^\d{4}\-\d{3}$/g)) {
        reject("Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)");
      }
      resolve(option);
    });
  },
  shortDate: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        reject("Must be a string");
      }
      if (
        !option.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/g)
      ) {
        reject("Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)");
      }
      resolve(option);
    });
  },
  isoDate: (option: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof option !== "string") {
        reject("Must be a string");
      }
      if (
        !option.match(
          /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])\T(0[0-9]|1[0-9]|2[0-3])\:(0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\:(0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\Z$/g
        )
      ) {
        reject("Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)");
      }
      resolve(option);
    });
  },
};

const optionsMap = {
  companies: {
    id: validators.number,
    name: validators.string,
    country_code: validators.countryCode,
    slug: validators.string,
    inactive: validators.boolean,
  },
  launches: {
    id: validators.number,
    cospar_id: validators.string,
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
    id: validators.number,
    name: validators.string,
    state_abbr: validators.stateCode,
    country_code: validators.countryCode,
  },
  missions: {
    id: validators.number,
    name: validators.string,
  },
  pads: {
    id: validators.number,
    name: validators.string,
    state_abbr: validators.stateCode,
    country_code: validators.countryCode,
  },
  tags: {
    id: validators.number,
    text: validators.string,
  },
  vehicles: {
    id: validators.number,
    name: validators.string,
  },
};

export const queryOptionsValidator = (
  resource: RLLEndPoint,
  options?: RLLQueryConfig.Companies
): Promise<URLSearchParams> => {
  const params = new URLSearchParams();
  const paramsPromises = [];

  for (const option in options) {
    if (!optionsMap[resource][option]) {
      console.warn(
        `[RLL Client]: Parameter "${option}" is not a valid option for the ${resource} endpoint. It will be ignored.`
      );
      continue;
    }

    const promise = optionsMap[resource][option](options[option])
      .then((o) => params.set(option, o))
      .catch((err) =>
        console.warn(
          `[RLL Client]: Malfored query parameter for resource "${resource}" and parameter: "${option}": ${err}.`
        )
      );

    paramsPromises.push(promise);
  }

  return Promise.allSettled(paramsPromises).then(() => params);
};
