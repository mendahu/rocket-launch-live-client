import { IncomingMessage, OutgoingHttpHeaders } from "node:http";
import https from "node:https";
import { createGunzip } from "node:zlib";
import { RLLError } from "./types/application.js";

const BASE_URL = "https://fdo.rocketlaunch.live";

/** Default HTTP request timeout (30 seconds). */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/** Default max decompressed response body size (10 MiB). */
export const DEFAULT_MAX_RESPONSE_BYTES = 10 * 1024 * 1024;

const RESPONSE_TOO_LARGE = "ERR_RESPONSE_TOO_LARGE";

export const fetcher = <T>(
  apiKey: string,
  endpoint: string,
  params: URLSearchParams,
  keyInQueryParams: boolean,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
  maxResponseBytes: number = DEFAULT_MAX_RESPONSE_BYTES
): Promise<T> => {
  const url = new URL("json/" + endpoint, BASE_URL);
  const headers: OutgoingHttpHeaders = {
    "accept-encoding": "gzip",
  };

  if (keyInQueryParams) {
    params.set("key", apiKey);
  } else {
    headers.authorization = `Bearer ${apiKey}`;
  }

  params.forEach((v, k) => url.searchParams.set(k, v));

  return query<T>(url, headers, timeoutMs, maxResponseBytes);
};

const readResponseBody = (
  res: IncomingMessage,
  maxBytes: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const encoding = res.headers["content-encoding"];
    const isGzip = encoding === "gzip" || encoding === "x-gzip";
    const contentLength = Number(res.headers["content-length"]);

    // Reject early when the declared body is already over the limit.
    // For gzip this is the compressed size; the stream limit still applies
    // after decompression for gzip bombs.
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      res.destroy();
      const err = new Error(
        `RLLC response exceeded the ${maxBytes}-byte size limit.`
      ) as Error & { code: string };
      err.code = RESPONSE_TOO_LARGE;
      reject(err);
      return;
    }

    const stream = isGzip ? res.pipe(createGunzip()) : res;
    const chunks: Buffer[] = [];
    let total = 0;
    let settled = false;

    const fail = (err: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      stream.destroy();
      res.destroy();
      reject(err);
    };

    stream.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        const err = new Error(
          `RLLC response exceeded the ${maxBytes}-byte size limit.`
        ) as Error & { code: string };
        err.code = RESPONSE_TOO_LARGE;
        fail(err);
        return;
      }
      chunks.push(chunk);
    });

    stream.on("error", (err) => {
      fail(err);
    });

    stream.on("end", () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(Buffer.concat(chunks).toString());
    });
  });
};

const query = <T>(
  url: URL,
  headers: OutgoingHttpHeaders,
  timeoutMs: number,
  maxResponseBytes: number
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
        readResponseBody(res, maxResponseBytes)
          .then((response) => {
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
          })
          .catch((err: Error & { code?: string }) => {
            if (err?.code === RESPONSE_TOO_LARGE) {
              const error: RLLError = {
                error: "Response too large",
                statusCode: res.statusCode ?? null,
                message: err.message,
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
