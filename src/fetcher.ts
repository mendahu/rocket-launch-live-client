const https = require("node:https");

const BASE_URL = "https://fdo.rocketlaunch.live";

export const fetcher = <T>(
  apiKey: string,
  endpoint: string,
  params: URLSearchParams,
  keyInQueryParams: boolean
): Promise<T> => {
  const url = new URL("json/" + endpoint, BASE_URL);
  let headers: HeadersInit | undefined;

  if (keyInQueryParams) {
    params.set("key", apiKey);
  } else {
    headers = { authorization: `Bearer ${apiKey}` };
  }

  params.forEach((v, k) => url.searchParams.set(k, v));

  return query<T>(url, headers);
};

const query = <T>(url: URL, headers?: HeadersInit): Promise<T> => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = [];

      res.on("data", (chunk) => data.push(chunk));

      res.on("end", () => {
        const response = Buffer.concat(data).toString();

        resolve(JSON.parse(response));
      });
    });
    req.on("error", reject);
  });
};
