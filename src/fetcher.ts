import { OutgoingHttpHeaders } from "http";
import https from "https";
import { RLLError } from "./types/application";

const BASE_URL = "https://fdo.rocketlaunch.live";

export const fetcher = <T>(
  apiKey: string,
  endpoint: string,
  params: URLSearchParams,
  keyInQueryParams: boolean
): Promise<T> => {
  const url = new URL("json/" + endpoint, BASE_URL);
  let headers: OutgoingHttpHeaders | undefined;

  if (keyInQueryParams) {
    params.set("key", apiKey);
  } else {
    headers = { authorization: `Bearer ${apiKey}` };
  }

  params.forEach((v, k) => url.searchParams.set(k, v));

  return query<T>(url, headers);
};

const query = <T>(url: URL, headers?: OutgoingHttpHeaders): Promise<T> => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data: Uint8Array[] = [];

      res.on("data", (chunk) => data.push(chunk));

      res.on("end", () => {
        const response = Buffer.concat(data).toString();

        if (res.statusCode === 200) {
          resolve(JSON.parse(response));
        } else if (res.statusCode === 404) {
          const error: RLLError = {
            error: "Resource not found",
            statusCode: 404,
            message:
              "The server returned a 404 Not Found response. Check that your API key is valid, and that you are not requesting a page number beyond the available results.",
            server_response: response,
          };
          reject(error);
        } else {
          const error: RLLError = {
            error: "Unknown server error",
            statusCode: res.statusCode ?? null,
            message:
              "RLLC recieved a response from the server but it is not one we're familiar with.",
            server_response: response,
          };
          reject(error);
        }
      });
    });

    req.on("error", () => {
      const error: RLLError = {
        error: "Unknown error",
        statusCode: null,
        message:
          "RLLC recieved an unknown error. This usually means that the HTTP request did not complete",
        server_response: null,
      };
      reject(error);
    });
  });
};
