import nock from "nock";
import { describe, it, vi, expect, beforeEach } from "vitest";
import { rllc, RLLClient, RLLQueryConfig } from "../index.js";

describe("locations method", () => {
  let client: RLLClient;

  beforeEach(() => {
    client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
  });

  it("should execute a query with no args", async () => {
    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/locations")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.locations();

    scope.done();
  });

  it("should warn if combining id with another param", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    const testParams = { id: 5, name: "banana" };

    const params = new URLSearchParams(
      testParams as unknown as Record<string, string>
    );

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/locations")
      .query(params)
      .reply(200, {});

    await client.locations(testParams);

    scope.done();

    expect(spy).toHaveBeenCalledWith(
      "[RLL Client]: Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if using invalid query params", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    const testParams = { inactive: false };

    const params = new URLSearchParams({});

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/locations")
      .query(params)
      .reply(200, {});

    await client.locations(testParams as RLLQueryConfig.Locations);

    scope.done();

    expect(spy).toHaveBeenCalledWith(
      '[RLL Client]: Parameter "inactive" is not a valid option for the locations endpoint. It will be ignored.'
    );
  });

  it("should throw if passed invalid query params object", () => {
    expect(() =>
      client.locations(5 as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations("5" as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations(null as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations(BigInt(5) as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations(Symbol() as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations([] as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations(false as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.locations((() => 5) as unknown as RLLQueryConfig.Locations)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
  });

  describe("page parameter", () => {
    it("should throw on malformed string page", async () => {
      expect(() =>
        client.locations({
          page: "banana",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed array page", () => {
      expect(() =>
        client.locations({ page: [] } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed object page", () => {
      expect(() =>
        client.locations({ page: {} } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed date page", () => {
      expect(() =>
        client.locations({
          page: new Date(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed boolean page", () => {
      expect(() =>
        client.locations({
          page: false,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed null page", () => {
      expect(() =>
        client.locations({ page: null } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed function page", () => {
      expect(() =>
        client.locations({
          page: () => 5,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed symbol page", () => {
      expect(() =>
        client.locations({
          page: Symbol(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed bigint page", () => {
      expect(() =>
        client.locations({
          page: BigInt(5),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "page": Must be a number.`
      );
    });

    it("should execute corectly with page number", async () => {
      const testParams = { page: 6 };

      const params = new URLSearchParams({ page: 6 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();
    });

    it("should convert string page to number", async () => {
      const testParams = { page: "5" };

      const params = new URLSearchParams({ page: 5 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();
    });

    it("should ignore undefined page", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { page: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should throw on malformed string id", async () => {
      expect(() =>
        client.locations({
          id: "banana",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed array id", () => {
      expect(() =>
        client.locations({ id: [] } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed object id", () => {
      expect(() =>
        client.locations({ id: {} } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed date id", () => {
      expect(() =>
        client.locations({
          id: new Date(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed boolean id", () => {
      expect(() =>
        client.locations({ id: false } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed null id", () => {
      expect(() =>
        client.locations({ id: null } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed function id", () => {
      expect(() =>
        client.locations({
          id: () => 5,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed Symbol id", () => {
      expect(() =>
        client.locations({
          id: Symbol(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed bigint id", () => {
      expect(() =>
        client.locations({
          id: BigInt(5),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "id": Must be a number.`
      );
    });

    it("should execute correctly with id number", async () => {
      const testParams = { id: 6 };

      const params = new URLSearchParams({ id: 6 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();
    });

    it("should convert string id to number", async () => {
      const testParams = { id: "5" };

      const params = new URLSearchParams({ id: 5 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();
    });

    it("should ignore undefined id", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("name parameter", () => {
    it("should throw on malformed empty string name", async () => {
      expect(() =>
        client.locations({ name: "" } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": String must have length greater than 0`
      );
    });

    it("should throw on malformed array name", () => {
      expect(() =>
        client.locations({ name: [] } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed object name", () => {
      expect(() =>
        client.locations({ name: {} } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed date name", () => {
      expect(() =>
        client.locations({
          name: new Date(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed boolean name", () => {
      expect(() =>
        client.locations({
          name: false,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed null name", () => {
      expect(() =>
        client.locations({ name: null } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed function name", () => {
      expect(() =>
        client.locations({
          name: () => "spacex",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed Symbol name", () => {
      expect(() =>
        client.locations({
          name: Symbol(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed function name", () => {
      expect(() =>
        client.locations({
          name: BigInt(5),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "name": Must be a string.`
      );
    });

    it("should excute correctly with name attribute", async () => {
      const testParams = { name: "SpaceX" };

      const params = new URLSearchParams({ name: "SpaceX" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();
    });

    it("should excute correctly with name number", async () => {
      const testParams = { name: 5 };

      const params = new URLSearchParams({ name: "5" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();
    });

    it("should ignore undefined name", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { name: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "name" is undefined and will be ignored.'
      );
    });
  });

  describe("state_abbr parameter", () => {
    it("should throw on malformed number state_abbr", async () => {
      expect(() =>
        client.locations({
          state_abbr: 5,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed empty string state_abbr", async () => {
      expect(() =>
        client.locations({
          state_abbr: "",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should throw on malformed nonexistant state_abbr", async () => {
      expect(() =>
        client.locations({
          state_abbr: "XX",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should throw on malformed array state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: [],
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed object state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: {},
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed date state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: new Date(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed boolean state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: false,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed null state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: null,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed function state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: () => "FL",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed Symbol() state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: Symbol(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed bigint state_abbr", () => {
      expect(() =>
        client.locations({
          state_abbr: BigInt(5),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should execute correctly with good state code", async () => {
      const testParams = { state_abbr: "FL" };

      const params = new URLSearchParams({ state_abbr: "FL" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams as RLLQueryConfig.Locations);

      scope.done();
    });

    it("should ignore undefined state_abbr", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { state_abbr: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "state_abbr" is undefined and will be ignored.'
      );
    });
  });

  describe("country_code parameter", () => {
    it("should throw on malformed number country_code", async () => {
      expect(() =>
        client.locations({
          country_code: 5,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed empty string country_code", async () => {
      expect(() =>
        client.locations({
          country_code: "",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should throw on malformed nonexistant country_code", async () => {
      expect(() =>
        client.locations({
          country_code: "XX",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should throw on malformed array country_code", () => {
      expect(() =>
        client.locations({
          country_code: [],
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed object country_code", () => {
      expect(() =>
        client.locations({
          country_code: {},
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed date country_code", () => {
      expect(() =>
        client.locations({
          country_code: new Date(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed boolean country_code", () => {
      expect(() =>
        client.locations({
          country_code: false,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed null country_code", () => {
      expect(() =>
        client.locations({
          country_code: null,
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed function country_code", () => {
      expect(() =>
        client.locations({
          country_code: () => "US",
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed Symbol country_code", () => {
      expect(() =>
        client.locations({
          country_code: Symbol(),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed bigint country_code", () => {
      expect(() =>
        client.locations({
          country_code: BigInt(5),
        } as unknown as RLLQueryConfig.Locations)
      ).to.throw(
        `Malformed query parameter for resource "locations" and parameter: "country_code": Must be a string.`
      );
    });

    it("should execute correctly with good country code", async () => {
      const testParams = { country_code: "US" };

      const params = new URLSearchParams({ country_code: "US" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams as RLLQueryConfig.Locations);

      scope.done();
    });

    it("should ignore undefined country_code", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { country_code: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/locations")
        .query(params)
        .reply(200, {});

      await client.locations(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "country_code" is undefined and will be ignored.'
      );
    });
  });
});
