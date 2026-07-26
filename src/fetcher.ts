import { OutgoingHttpHeaders } from "node:http";
import https from "node:https";
import { RLLError } from "./types/application.js";

const BASE_URL = "https://fdo.rocketlaunch.live";

/** Default HTTP request timeout (30 seconds). */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

export const fetcher = <T>(
  apiKey: string,
  endpoint: string,
  params: URLSearchParams,
  keyInQueryParams: boolean,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<T> => {
  const url = new URL("json/" + endpoint, BASE_URL);
  let headers: OutgoingHttpHeaders | undefined;

  if (keyInQueryParams) {
    params.set("key", apiKey);
  } else {
    headers = { authorization: `Bearer ${apiKey}` };
  }

  params.forEach((v, k) => url.searchParams.set(k, v));

  return query<T>(url, headers, timeoutMs);
};

const query = <T>(
  url: URL,
  headers: OutgoingHttpHeaders | undefined,
  timeoutMs: number
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    let settled = false;

    const finish = (action: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      action();
    };

    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const req = https.get(
      url,
      { headers, signal: controller.signal },
      (res) => {
        const data: Uint8Array[] = [];

        res.on("data", (chunk) => data.push(chunk));

        res.on("end", () => {
          const response = Buffer.concat(data).toString();

          let server_response: any;

          try {
            server_response = JSON.parse(response);
          } catch {
            server_response = response;
          }

          if (res.statusCode === 200) {
            finish(() => resolve(server_response));
          } else {
            const error: RLLError = {
              error: "API Call Failed",
              statusCode: res.statusCode ?? null,
              message:
                "RLLC recieved a response from the server but it did not complete as expected.",
              server_response,
            };
            finish(() => reject(error));
          }
        });
      }
    );

    req.on("error", () => {
      if (controller.signal.aborted) {
        const error: RLLError = {
          error: "Timeout",
          statusCode: null,
          message: `RLLC request timed out after ${timeoutMs}ms.`,
          server_response: null,
        };
        finish(() => reject(error));
        return;
      }

      const error: RLLError = {
        error: "Unknown error",
        statusCode: null,
        message:
          "RLLC recieved an unknown error. This usually means that the HTTP request did not complete",
        server_response: null,
      };
      finish(() => reject(error));
    });
  });
};
