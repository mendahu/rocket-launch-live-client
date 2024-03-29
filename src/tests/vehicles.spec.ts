import nock from "nock";
import { describe, it, vi, expect, beforeEach } from "vitest";
import { rllc, RLLClient, RLLQueryConfig } from "../index.js";

describe("vehicles method", () => {
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
      .get("/json/vehicles")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.vehicles();

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
      .get("/json/vehicles")
      .query(params)
      .reply(200, {});

    await client.vehicles(testParams);

    scope.done();

    expect(spy).toHaveBeenCalledWith(
      "[RLL Client]: Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if using invalid query params", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    const testParams = { inactive: false };

    const params = new URLSearchParams({} as unknown as Record<string, string>);

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/vehicles")
      .query(params)
      .reply(200, {});

    await client.vehicles(testParams as RLLQueryConfig.Vehicles);

    scope.done();

    expect(spy).toHaveBeenCalledWith(
      '[RLL Client]: Parameter "inactive" is not a valid option for the vehicles endpoint. It will be ignored.'
    );
  });

  it("should throw if passed invalid query params object", () => {
    expect(() =>
      client.vehicles(5 as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles("5" as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles(null as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles(BigInt(5) as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles(Symbol() as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles([] as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles(false as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.vehicles((() => 5) as unknown as RLLQueryConfig.Vehicles)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
  });

  describe("page parameter", () => {
    it("should throw on malformed string page", async () => {
      expect(() =>
        client.vehicles({
          page: "banana",
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed array page", () => {
      expect(() =>
        client.vehicles({ page: [] } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed object page", () => {
      expect(() =>
        client.vehicles({ page: {} } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed date page", () => {
      expect(() =>
        client.vehicles({
          page: new Date(),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed boolean page", () => {
      expect(() =>
        client.vehicles({ page: false } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed null page", () => {
      expect(() =>
        client.vehicles({ page: null } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed function page", () => {
      expect(() =>
        client.vehicles({
          page: () => 5,
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed symbol page", () => {
      expect(() =>
        client.vehicles({
          page: Symbol(),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed bigint page", () => {
      expect(() =>
        client.vehicles({
          page: BigInt(5),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();
    });

    it("should ignore undefined page", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { page: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should throw on malformed string id", async () => {
      expect(() =>
        client.vehicles({ id: "banana" } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed array id", () => {
      expect(() =>
        client.vehicles({ id: [] } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed object id", () => {
      expect(() =>
        client.vehicles({ id: {} } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed date id", () => {
      expect(() =>
        client.vehicles({
          id: new Date(),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed boolean id", () => {
      expect(() =>
        client.vehicles({ id: false } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed null id", () => {
      expect(() =>
        client.vehicles({ id: null } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed function id", () => {
      expect(() =>
        client.vehicles({ id: () => 5 } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed symbol id", () => {
      expect(() =>
        client.vehicles({ id: Symbol() } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed bigint id", () => {
      expect(() =>
        client.vehicles({
          id: BigInt(5),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();
    });

    it("should ignore undefined id", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { id: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("name parameter", () => {
    it("should throw on malformed empty string name", async () => {
      expect(() =>
        client.vehicles({ name: "" } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": String must have length greater than 0`
      );
    });

    it("should throw on malformed array name", () => {
      expect(() =>
        client.vehicles({ name: [] } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed object name", () => {
      expect(() =>
        client.vehicles({ name: {} } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed date name", () => {
      expect(() =>
        client.vehicles({
          name: new Date(),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed boolean name", () => {
      expect(() =>
        client.vehicles({ name: false } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed null name", () => {
      expect(() =>
        client.vehicles({ name: null } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed function name", () => {
      expect(() =>
        client.vehicles({
          name: () => "spacex",
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed symbol name", () => {
      expect(() =>
        client.vehicles({
          name: Symbol(),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed bigint name", () => {
      expect(() =>
        client.vehicles({
          name: BigInt(5),
        } as unknown as RLLQueryConfig.Vehicles)
      ).to.throw(
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should excute correctly with name attribute", async () => {
      const testParams = { name: "SpaceX" };

      const params = new URLSearchParams({
        name: "SpaceX",
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();
    });

    it("should excute correctly with name number", async () => {
      const testParams = { name: 5 };

      const params = new URLSearchParams({ name: "5" } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();
    });

    it("should ignore undefined name", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { name: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "name" is undefined and will be ignored.'
      );
    });
  });
});
