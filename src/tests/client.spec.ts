import nock from "nock";
import { rllc } from "../index";
import { RLLClientOptions } from "../types/application";
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
});
