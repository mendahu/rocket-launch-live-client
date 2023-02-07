# rocket-launch-live-client

## Table of Contents

- [Simple Usage](#simple)
- [Client Configuration](#config)
- [Endpoints](#endpoints)
  - [Response Types](#types)
  - [Companies](#companies)
  - [Launches](#launches)
  - [Locations](#locations)
  - [Missions](#missions)
  - [Pads](#pads)
  - [Tags](#tags)
  - [Vehicles](#vehicles)
- [Watcher](#watcher)
  - [Options](#watcher_options)

This package is a fully-typed, promise-based, zero-dependency Node.JS JavaScript/TypeScript library for interacting with the [RocketLaunch.Live](https://www.rocketlaunch.live) API.

<a name="simple"></a>

## Simple usage

```js
// Import package
import { rllc } from "rocket-launch-live-client";

// Get API Key
const RLL_API_KEY = process.env.RLL_API_KEY;

// Create client
const client = rllc(RLL_API_KEY);

// Call endpoints
const launches = await client.launches();
```

<a name="config"></a>

## Client Configuration

RLL Clients require an API key as the first parameter, and will throw if one is not present.

The client can be configured with an optional second parameter using the following keys:

```js
const options = {
  // Defaults to false.
  // API Key is normally passed in the Authorization Bearer header
  // Set to true to pass your API key as a query parameter instead (not recommended)
  keyInQueryParams: true,
};

const client = rllc(RLL_API_KEY, options);
```

<a name="endpoints"></a>

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

All endpoints return a maximum of 25 results per page. A `page` argument can be passed to retrieve incremental results.

```js
const response = await client.launches({ page: 2 });
// Also accepts page number as a number-parseable string like "2"
```

For complete API Documentation on parameters, be sure to visit [RocketLaunch.Live](https://www.rocketlaunch.live/api)

<a name="types"></a>

### Response Types

All entity response types are browseable in the [GitHub Repository](https://github.com/mendahu/rocket-launch-live-client/tree/main/src/types).

<a name="companies"></a>

### Companies

```js
const response = await client.companies(options);
```

Optional search parameters:

```js
const options = {
  // Company numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // Company name
  name: "SpaceX",

  // Company country
  // ISO 3166 Alpha 2 Country Code
  country_code: "US",

  // For defunct companies
  inactive: true,
};
```

<a name="launches"></a>

### Launches

```js
const response = await client.launches(options);
```

Optional search parameters:

```js
const options = {
  // Launch numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // COSPAR
  // Format YYYY-NNN
  cospar_id: "2022-123",

  // Show launches only before this date
  // JS Date Object - Anything more precise than day is ignored
  // Also accepts any date string which can be used to create a valid Date object in JavaScript
  before_date: new Date("2023-01-31")

  // Show launches only after this date
  // JS Date Object - Anything more precise than day is ignored
  // Also accepts any date string which can be used to create a valid Date object in JavaScript
  after_date: new Date("2023-01-31")

  // Show launches that have had data updated since this date
  // Useful for checking for changes since your last API call
  // JS Date Object
  // Also accepts any date string which can be used to create a valid Date object in JavaScript
  modified_since: new Date("2023-01-31T06:00:00Z")

  // Launch location id
  // Also accepts number parseable strings like "1"
  location_id: 1,

  // Launch pad id
  // Also accepts number parseable strings like "1"
  pad_id: 1,

  // Launch provider id
  // Also accepts number parseable strings like "1"
  provider_id: 1,

  // Launch tag id
  // Also accepts number parseable strings like "1"
  tag_id: 1,

  // Launch vehicle id
  // Also accepts number parseable strings like "1"
  vehicle_id: 1,

  // US State
  // ISO 3166-2 US State Code Abbreviation
  state_abbr: "FL",

  // Country of launch
  // ISO 3166-1 Alpha 2 Country Code
  country_code: "US",

  // Search string
  // Also accepts numbers like 2020
  search: "Starlink",

  // Unique launch slug as used on RocketLaunch.live
  slug: "ses-20-ses-21"
};
```

<a name="locations"></a>

### Locations

```js
const response = await client.locations(options);
```

Optional search parameters:

```js
const options = {
  // Location numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // Location name
  name: "Cape Canaveral",

  // Location State (US)
  // ISO 3166-2 US State Code Abbreviation
  state_abbr: "FL",

  // Location country
  // ISO 3166 Alpha 2 Country Code
  country_code: "US",
};
```

<a name="missions"></a>

### Missions

```js
const response = await client.missions(options);
```

Optional search parameters:

```js
const options = {
  // Mission numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // Mission name
  name: "Juno",
};
```

<a name="pads"></a>

### Pads

```js
const response = await client.pads(options);
```

Optional search parameters:

```js
const options = {
  // Pad numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // Pad name
  name: "SpaceX",

  // Pad State (US)
  // ISO 3166-2 US State Code Abbreviation
  state_abbr: "FL",

  // Pad country
  // ISO 3166 Alpha 2 Country Code
  country_code: "US",
};
```

<a name="tags"></a>

### Tags

```js
const response = await client.tags(options);
```

Optional search parameters:

```js
const options = {
  // Tag numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // Tag text
  text: "Crewed",
};
```

<a name="vehicles"></a>

### Vehicles

```js
const response = await client.vehicles(options);
```

Optional search parameters:

```js
const options = {
  // Vehicle numeric id
  // Also accepts number parseable strings like "1"
  id: 1,

  // Vehicle name
  name: "Atlas V",
};
```

<a name="watcher"></a>

## Watcher

The `rocket-launch-live-client` has the ability to monitor the `launches` endpoint on a regular basis and return changes as they happen live.

```js
// Instantiate a new watcher
const watcher = client.watch()

// Define event handlers
watcher.on("new", (newLaunch) => {
  // handle new launch
})

watcher.on("change", (oldLaunch, newLaunch) => {
  // handle change to existing launch
}

watcher.on("error", (err) => {
  //handle errors
})

// Start monitoring
watcher.watch()

// Stop monitoring
watcher.stop()
```

<a name="watcher_options"></a>

### Watcher Options

A new watcher takes up to two arguments:

1. Interval - (optional) (default: 5) - a duration, in minutes, between calls to the API. Adjust this based on the frequency you wish to stay up to date. To avoid needlessly querying the API, this client will now allow any option less than 1 minute.
2. Query Options - (optional) - The exact same query options that can be submitted to the [`launches`](#launches) endpoint.

<a name="watcher_events"></a>

### Watcher Events

Watcher events are triggered when the client recieves a response to a query to `launches` using the `modified_since` parameter. The client will compare the changes to a cached version of the launch and trigger the appropriate event.

If there are multiple changes on a single API call, the appropriate events will be triggered more than one, so have your callbacks handle a single event.

If you are using typescript, the watcher events are available in an enum called `RLLWatcherEvent`

```ts
enum RLLWatcherEvent {
  NEW = "new",
  CHANGE = "change",
  ERROR = "error",
}
```

#### New

A new launch has been added! The Watcher will provide the new launch data as the first argument to your callback.

```js
watcher.on("new", (newLaunch) => {
  // Handle the new addition here
});
```

The `newLaunch` argument will be an `RLLEntity.Launch` object, the same shape as what is received from the `launches` endpoint (but not wrapped in the standard response).

#### Change

An existing launch has had information change. The Watcher will provide the old and new versions of the launch object to do your own comparisons.

```js
watcher.on("change", (oldLaunch, newLaunch) => {
  // Handle changes here
});
```

The `oldLaunch` and `newLaunch` will be the cached version and the new version of an `RLLEntity.Launch` object, the same shape as what is received from the `launches` endpoint (but not wrapped in the standard response).
