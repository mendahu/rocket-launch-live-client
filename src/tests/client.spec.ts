import nock from "nock";
import { rllc } from "../index.js";
import { RLLClientOptions } from "../types/application.js";
import { expect, describe, it, vi } from "vitest";

describe("rllc Client", () => {
  it("should throw error with no API key", () => {
    expect(rllc).to.throw("[RLL Client]: RLL Client requires API Key");
  });

  it("should throw error with a non-string API Key", () => {
    expect(() => rllc(5 as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc(true as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc(null as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc(["api key"] as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc({ key: "api" } as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc(BigInt(5) as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc(Symbol() as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => rllc((() => "key") as unknown as string)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
  });

  it("should throw error with a non-uuid string", () => {
    expect(() => rllc("")).to.throw(
      "[RLL Client]: RLL Client API Key cannot be an empty string"
    );
    expect(() => rllc("sdf-sdf-2424-dfs-34243")).to.throw(
      "[RLL Client]: RLL Client API Key appears malformed. RLL Client API Keys are in UUID format."
    );
    expect(() => rllc("sdsdf-123-sdfsdfsdf-sdfsdfsd-fsdfsdf")).to.throw(
      "[RLL Client]: RLL Client API Key appears malformed. RLL Client API Keys are in UUID format."
    );
  });

  it("should not throw with properly formed uuid", () => {
    rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
  });

  it("should not throw with random options, but should warn", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
      banana: true,
    } as RLLClientOptions);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      '[RLL Client]: RLL Client options do not accept a "banana" property. This property will be ignored.'
    );
  });

  it("should throw if keyInQueryParams is not a boolean", () => {
    expect(() =>
      rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
        keyInQueryParams: "banana" as unknown as boolean,
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'keyInQueryParams' must be a boolean."
    );
  });

  it("should throw if timeoutMs is not a positive number", () => {
    expect(() =>
      rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
        timeoutMs: "banana" as unknown as number,
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'timeoutMs' must be a number greater than 0."
    );

    expect(() =>
      rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
        timeoutMs: 0,
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'timeoutMs' must be a number greater than 0."
    );

    expect(() =>
      rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
        timeoutMs: -5,
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'timeoutMs' must be a number greater than 0."
    );
  });

  it("should reject when the request exceeds the timeout", async () => {
    nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .delay(500)
      .reply(200, {
        valid_auth: true,
        count: 0,
        limit: 25,
        total: 0,
        last_page: 1,
        result: [],
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
      timeoutMs: 50,
    });

    await expect(client.launches()).rejects.toEqual({
      error: "Timeout",
      statusCode: null,
      message: "RLLC request timed out after 50ms.",
      server_response: null,
    });

    nock.cleanAll();
  });

  it("should throw if maxResponseBytes is not a positive number", () => {
    expect(() =>
      rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
        maxResponseBytes: "banana" as unknown as number,
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'maxResponseBytes' must be a number greater than 0."
    );

    expect(() =>
      rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
        maxResponseBytes: 0,
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'maxResponseBytes' must be a number greater than 0."
    );
  });

  it("should reject responses larger than maxResponseBytes", async () => {
    const body = JSON.stringify({
      valid_auth: true,
      count: 0,
      limit: 25,
      total: 0,
      last_page: 1,
      result: [],
      pad: "x".repeat(200),
    });

    const scope = nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .reply(200, body, {
        "Content-Type": "application/json",
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
      maxResponseBytes: 64,
    });

    await expect(client.launches()).rejects.toMatchObject({
      error: "Response too large",
      statusCode: 200,
      server_response: null,
    });

    scope.done();
  });

  it("should reject gzip responses that expand past maxResponseBytes", async () => {
    const zlib = await import("node:zlib");
    // Highly compressible: tiny on the wire, large after gunzip.
    const inflated = Buffer.alloc(64 * 1024, 0);
    const compressed = zlib.gzipSync(inflated);

    expect(compressed.length).toBeLessThan(1024);

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        "accept-encoding": "gzip",
      },
    })
      .get("/json/launches")
      .reply(200, compressed, {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json",
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
      maxResponseBytes: 1024,
    });

    await expect(client.launches()).rejects.toMatchObject({
      error: "Response too large",
      statusCode: 200,
      server_response: null,
    });

    scope.done();
  });

  it("should not pass api key to params normally", async () => {
    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query((actualQueryObject) => {
        return !actualQueryObject.key;
      })
      .reply(200, {});

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    await client.launches();

    scope.done();
  });

  it("should pass api key to params", async () => {
    const scope = nock("https://fdo.rocketlaunch.live", {
      badheaders: ["authorization"],
    })
      .get("/json/launches?key=aac004f6-07ab-4f82-bff2-71d977072c56")
      .reply(200, {});

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56", {
      keyInQueryParams: true,
    });
    await client.launches();

    scope.done();
  });

  it("should decode gzip-compressed API responses", async () => {
    const zlib = await import("node:zlib");
    const payload = {
      valid_auth: true,
      count: 0,
      limit: 25,
      total: 0,
      last_page: 1,
      result: [],
    };
    const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(payload)));

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        "accept-encoding": "gzip",
      },
    })
      .get("/json/launches")
      .reply(200, compressed, {
        "Content-Encoding": "gzip",
        "Content-Type": "application/json",
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const response = await client.launches();

    expect(response).toEqual(payload);
    scope.done();
  });

  it("should handle HTML error responses", async () => {
    const scope = nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .reply(404, "<html>Not Found</html>");

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    try {
      await client.launches();
    } catch (e) {
      expect(e).toEqual({
        error: "API Call Failed",
        message:
          "RLLC recieved a response from the server but it did not complete as expected.",
        server_response: "<html>Not Found</html>",
        statusCode: 404,
      });
    }

    scope.done();
  });

  it("should handle HTML success responses with RLL error", async () => {
    const scope = nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .reply(200, "<html>Not Found</html>");

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    try {
      await client.launches();
    } catch (e) {
      expect(e).toEqual({
        error: "API Call Failed",
        message:
          "RLLC recieved a response from the server but it did not complete as expected.",
        server_response: "<html>Not Found</html>",
        statusCode: 200,
      });
    }
  });

  it("should handle JSON error responses", async () => {
    const scope = nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .reply(400, { error: "Bad Request", message: "You did something wrong" });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    try {
      await client.launches();
    } catch (e) {
      expect(e).toEqual({
        error: "API Call Failed",
        message:
          "RLLC recieved a response from the server but it did not complete as expected.",
        server_response: {
          error: "Bad Request",
          message: "You did something wrong",
        },
        statusCode: 400,
      });
    }

    scope.done();
  });
});
