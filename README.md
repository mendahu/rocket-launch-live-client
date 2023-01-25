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
