import nock from "nock";
import { describe, it, vi, expect, beforeEach } from "vitest";
import { rllc, RLLClient, RLLQueryConfig } from "../index.js";

describe("tags method", () => {
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
      .get("/json/tags")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.tags();

    scope.done();
  });

  it("should warn if combining id with another param", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    const testParams = { id: 5, text: "banana" };

    const params = new URLSearchParams(
      testParams as unknown as Record<string, string>
    );

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/tags")
      .query(params)
      .reply(200, {});

    await client.tags(testParams);

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
      .get("/json/tags")
      .query(params)
      .reply(200, {});

    await client.tags(testParams as RLLQueryConfig.Tags);

    scope.done();

    expect(spy).toHaveBeenCalledWith(
      '[RLL Client]: Parameter "inactive" is not a valid option for the tags endpoint. It will be ignored.'
    );
  });

  it("should throw if passed invalid query params object", () => {
    expect(() => client.tags(5 as unknown as RLLQueryConfig.Tags)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.tags("5" as unknown as RLLQueryConfig.Tags)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.tags(null as unknown as RLLQueryConfig.Tags)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.tags(BigInt(5) as unknown as RLLQueryConfig.Tags)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.tags(Symbol() as unknown as RLLQueryConfig.Tags)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.tags([] as unknown as RLLQueryConfig.Tags)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.tags(false as unknown as RLLQueryConfig.Tags)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.tags((() => 5) as unknown as RLLQueryConfig.Tags)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
  });

  describe("page parameter", () => {
    it("should throw on malformed string page", async () => {
      expect(() =>
        client.tags({ page: "banana" } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed array page", () => {
      expect(() =>
        client.tags({ page: [] } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed object page", () => {
      expect(() =>
        client.tags({ page: {} } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed date page", () => {
      expect(() =>
        client.tags({ page: new Date() } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed boolean page", () => {
      expect(() =>
        client.tags({ page: false } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed null page", () => {
      expect(() =>
        client.tags({ page: null } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed function page", () => {
      expect(() =>
        client.tags({ page: () => 5 } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed symbol page", () => {
      expect(() =>
        client.tags({ page: Symbol() } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed bigint page", () => {
      expect(() =>
        client.tags({ page: BigInt(5) } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "page": Must be a number.`
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
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

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
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

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
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should throw on malformed string id", async () => {
      expect(() =>
        client.tags({ id: "banana" } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed array id", () => {
      expect(() =>
        client.tags({ id: [] } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed object id", () => {
      expect(() =>
        client.tags({ id: {} } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed date id", () => {
      expect(() =>
        client.tags({ id: new Date() } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed boolean id", () => {
      expect(() =>
        client.tags({ id: false } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed null id", () => {
      expect(() =>
        client.tags({ id: null } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed function id", () => {
      expect(() =>
        client.tags({ id: () => 5 } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed symbol id", () => {
      expect(() =>
        client.tags({ id: Symbol() } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed bigint id", () => {
      expect(() =>
        client.tags({ id: BigInt(5) } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "id": Must be a number.`
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
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

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
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

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
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("text parameter", () => {
    it("should throw on malformed empty string text", async () => {
      expect(() =>
        client.tags({ text: "" } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": String must have length greater than 0`
      );
    });

    it("should throw on malformed array text", () => {
      expect(() =>
        client.tags({ text: [] } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed object text", () => {
      expect(() =>
        client.tags({ text: {} } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed date text", () => {
      expect(() =>
        client.tags({ text: new Date() } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed boolean text", () => {
      expect(() =>
        client.tags({ text: false } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed null text", () => {
      expect(() =>
        client.tags({ text: null } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed function text", () => {
      expect(() =>
        client.tags({ text: () => "spacex" } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed symbol text", () => {
      expect(() =>
        client.tags({ text: Symbol() } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should throw on malformed bigint text", () => {
      expect(() =>
        client.tags({ text: BigInt(5) } as unknown as RLLQueryConfig.Tags)
      ).to.throw(
        `Malformed query parameter for resource "tags" and parameter: "text": Must be a string.`
      );
    });

    it("should excute correctly with text attribute", async () => {
      const testParams = { text: "SpaceX" };

      const params = new URLSearchParams({
        text: "SpaceX",
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

      scope.done();
    });

    it("should excute correctly with text number", async () => {
      const testParams = { text: 5 };

      const params = new URLSearchParams({ text: "5" } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

      scope.done();
    });

    it("should ignore undefined text", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

      const testParams = { text: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/tags")
        .query(params)
        .reply(200, {});

      await client.tags(testParams);

      scope.done();

      expect(spy).toHaveBeenCalledWith(
        '[RLL Client]: Parameter "text" is undefined and will be ignored.'
      );
    });
  });
});
