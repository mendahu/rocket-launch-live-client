# rocket-launch-live-client

This package is a JavaScript library for interacting with the [RocketLaunch.Live](https://www.rocketlaunch.live) API.

_This project is currently a work in progress._

Simple usage:

```js
// Import package
import rllc from "rocket-launch-live-client";

// Get API Key
const RLL_API_KEY = process.env.RLL_API_KEY;

// Create client
const client = rllc(RLL_API_KEY);

// Call endpoints
const launches = await client.launches();
```

## Client Configuration

RLL Clients require an API key as the first parameter, and will throw if one is not present.

The client can be configured with an optional second parameter using the following keys:

```js
const options = {
  keyInQueryParams: true,
  // Defaults to false.
  // Set to true to pass your API key as a query parameter instead of an authorization header (not recommended)
};
```

## Endpoints

All endpoints return the following response format, where `T` is an array of results:

```ts
type RLLResponse<T> = {
  errors?: string[];
  valid_auth: boolean;
  count: number;
  limit: number;
  total: number;
  last_page: number;
  result: T;
};
```

All endpoints return a maximum of 25 results per page. A `page` param can be passed to retrieve incremental results.

```js
const response = await client.launches({ page: 2 });
```

For complete API Documentation on parameters, be sure to visit [RocketLaunch.Live](https://www.rocketlaunch.live/api)

### Companies

```js
const response = await client.companies(options);
```

Optional search parameters:

```js
const options = {
  id: 1,
  name: "SpaceX",
  country_code: "US", // ISO 3166 Alpha 2 Country Code
  inactive: true, // for defunct companies
};
```

### Launches

```js
const response = await client.launches(options);
```

Optional search parameters:

```js
const options = {
  id: 1,
  cospar_id: "2022-123", // Format YYYY-NNN
  before_date: new Date("2023-01-31") // JS Date Object - Anything more precise than day is ignored
  after_date: new Date("2023-01-31") // JS Date Object - Anything more precise than day is ignored
  modified_since: new Date("2023-01-31T06:00:00Z") // JS Date Object
  location_id: 1,
  pad_id: 1,
  provider_id: 1,
  tag_id: 1,
  vehicle_id: 1,
  state_abbr: "FL", //ISO 3166-2 US State Code Abbreviation
  country_code: "US", // ISO 3166-1 Alpha 2 Country Code
  search: "Starlink",
  slug: "ses-20-ses-21"
};
```
