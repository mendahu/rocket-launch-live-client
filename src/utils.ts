import { RLLQueryConfig } from "./types/application";

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
        `[RLL Client]: RLL Client options do not accept a "${option} property. This property will be ignored.`
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

export const convertOptionsToQueryParams = (
  options:
    | RLLQueryConfig.Companies
    | RLLQueryConfig.Launches
    | RLLQueryConfig.Locations
    | RLLQueryConfig.Missions
    | RLLQueryConfig.Pads
    | RLLQueryConfig.Tags
    | RLLQueryConfig.Vehicles
): URLSearchParams => {
  const params = new URLSearchParams();
  for (const option in options) {
    params.set(option, options[option]);
  }

  return params;
};
