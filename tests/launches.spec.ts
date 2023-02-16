import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import chai from "chai";
import Sinon from "sinon";
import { rllc, RLLClient, RLLQueryConfig } from "../src";
import * as utils from "../src/utils";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("launches method", () => {
  let sandbox: Sinon.SinonSandbox;
  let client: RLLClient;
  let spy: Sinon.SinonSpy;

  before(() => {
    sandbox = Sinon.createSandbox();
  });

  beforeEach(() => {
    client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    sandbox.restore();
  });

  after(() => {
    spy.restore();
  });

  it("should execute a query with no args", async () => {
    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.launches();

    scope.done();
  });

  it("should warn if combining id with another param", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams: RLLQueryConfig.Launches = { id: 5, search: "banana" };

    const params = new URLSearchParams(testParams as Record<string, string>);

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query(params)
      .reply(200, {});

    await client.launches(testParams);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if combining cospar_id with another param", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams: RLLQueryConfig.Launches = {
      cospar_id: "2022-123",
      search: "banana",
    };

    const params = new URLSearchParams(testParams as Record<string, string>);

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query(params)
      .reply(200, {});

    await client.launches(testParams);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if combining slug with another param", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams: RLLQueryConfig.Launches = {
      slug: "ses-12-ses-13",
      search: "banana",
    };

    const params = new URLSearchParams(testParams as Record<string, string>);

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query(params)
      .reply(200, {});

    await client.launches(testParams);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if using invalid query params", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams = { inactive: false };

    const params = new URLSearchParams({});

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query(params)
      .reply(200, {});

    await client.launches(testParams as RLLQueryConfig.Launches);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      'Parameter "inactive" is not a valid option for the launches endpoint. It will be ignored.'
    );
  });

  it("should throw if passed invalid query params object", () => {
    expect(() =>
      client.launches(5 as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches("5" as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches(null as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches(BigInt(5) as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches(Symbol() as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches([] as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches(false as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.launches((() => 5) as unknown as RLLQueryConfig.Launches)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
  });

  describe("page parameter", () => {
    it("should throw on malformed string page", async () => {
      expect(() =>
        client.launches({
          page: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed empty string page", async () => {
      expect(() =>
        client.launches({ page: "" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed array page", () => {
      expect(() =>
        client.launches({ page: [] } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed object page", () => {
      expect(() =>
        client.launches({ page: {} } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed date page", () => {
      expect(() =>
        client.launches({
          page: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed boolean page", () => {
      expect(() =>
        client.launches({ page: false } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed null page", () => {
      expect(() =>
        client.launches({ page: null } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed function page", () => {
      expect(() =>
        client.launches({
          page: () => 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed symbol page", () => {
      expect(() =>
        client.launches({
          page: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed bigint page", () => {
      expect(() =>
        client.launches({
          page: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should execute correctly with page number", async () => {
      const testParams: RLLQueryConfig.Launches = { page: 6 };

      const params = new URLSearchParams({ page: 6 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string page to number", async () => {
      const testParams: RLLQueryConfig.Launches = { page: "5" };

      const params = new URLSearchParams({ page: 5 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined page", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { page: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should throw on malformed string id", async () => {
      expect(() =>
        client.launches({ id: "banana" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed empty string id", async () => {
      expect(() =>
        client.launches({ id: "" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed array id", () => {
      expect(() =>
        client.launches({ id: [] } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed object id", () => {
      expect(() =>
        client.launches({ id: {} } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed date id", () => {
      expect(() =>
        client.launches({
          id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed boolean id", () => {
      expect(() =>
        client.launches({ id: false } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed null id", () => {
      expect(() =>
        client.launches({ id: null } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed function id", () => {
      expect(() =>
        client.launches({ id: () => 5 } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed symbol id", () => {
      expect(() =>
        client.launches({ id: Symbol() } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed bigint id", () => {
      expect(() =>
        client.launches({
          id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should execute correctly with id parameter", async () => {
      const testParams: RLLQueryConfig.Launches = { id: 6 };

      const params = new URLSearchParams({ id: 6 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string id to number", async () => {
      const testParams: RLLQueryConfig.Launches = { id: "5" };

      const params = new URLSearchParams({ id: 5 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("cospar_id parameter", () => {
    it("should throw on malformed number cospar_id", async () => {
      expect(() =>
        client.launches({ cospar_id: 5 } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed empty string cospar_id", async () => {
      expect(() =>
        client.launches({
          cospar_id: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw("Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)");
    });

    it("should throw on malformed string cospar_id", async () => {
      expect(() =>
        client.launches({
          cospar_id: "213-392",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw("Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)");
    });

    it("should throw on malformed array cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed object cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed date cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed boolean cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed null cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed function cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: () => "2022-123",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed symbol cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should throw on malformed bigint cospar_id", () => {
      expect(() =>
        client.launches({
          cospar_id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should execute correctly with cospar_id param", async () => {
      const testParams: RLLQueryConfig.Launches = { cospar_id: "2022-123" };

      const params = new URLSearchParams({ cospar_id: "2022-123" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined cospar_id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { cospar_id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "cospar_id" is undefined and will be ignored.'
      );
    });
  });

  describe("after_date parameter", () => {
    it("should throw on malformed number after_date", async () => {
      expect(() =>
        client.launches({
          after_date: 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed string after_date", async () => {
      expect(() =>
        client.launches({
          after_date: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed string after_date", async () => {
      expect(() =>
        client.launches({
          after_date: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed string after_date", async () => {
      expect(() =>
        client.launches({
          after_date: "22-01-34",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed array after_date", () => {
      expect(() =>
        client.launches({
          after_date: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed object after_date", () => {
      expect(() =>
        client.launches({
          after_date: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed boolean after_date", () => {
      expect(() =>
        client.launches({
          after_date: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed null after_date", () => {
      expect(() =>
        client.launches({
          after_date: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed function after_date", () => {
      expect(() =>
        client.launches({
          after_date: () => new Date("2023-01-02T12:00:00Z"),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed symbol after_date", () => {
      expect(() =>
        client.launches({
          after_date: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed bigint after_date", () => {
      expect(() =>
        client.launches({
          after_date: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should execute correctly with Date after_date", async () => {
      const testParams: RLLQueryConfig.Launches = {
        after_date: new Date("2023-01-02T12:00:00Z"),
      };

      const params = new URLSearchParams({ after_date: "2023-01-02" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with full string after_date", async () => {
      const testParams: RLLQueryConfig.Launches = {
        after_date: "2023-01-02T12:00:00Z",
      };

      const params = new URLSearchParams({ after_date: "2023-01-02" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with partial string after_date", async () => {
      const testParams: RLLQueryConfig.Launches = { after_date: "2023-01-02" };

      const params = new URLSearchParams({ after_date: "2023-01-02" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined after_date", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { after_date: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "after_date" is undefined and will be ignored.'
      );
    });
  });

  describe("before_date parameter", () => {
    it("should throw on malformed number before_date", async () => {
      expect(() =>
        client.launches({
          before_date: 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed string before_date", async () => {
      expect(() =>
        client.launches({
          before_date: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed string before_date", async () => {
      expect(() =>
        client.launches({
          before_date: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed string before_date", async () => {
      expect(() =>
        client.launches({
          before_date: "22-01-34",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed array before_date", () => {
      expect(() =>
        client.launches({
          before_date: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed object before_date", () => {
      expect(() =>
        client.launches({
          before_date: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed boolean before_date", () => {
      expect(() =>
        client.launches({
          before_date: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed null before_date", () => {
      expect(() =>
        client.launches({
          before_date: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed function before_date", () => {
      expect(() =>
        client.launches({
          before_date: () => "2022-123",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed symbol before_date", () => {
      expect(() =>
        client.launches({
          before_date: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed bigint before_date", () => {
      expect(() =>
        client.launches({
          before_date: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should execute correctly with before_date", async () => {
      const testParams: RLLQueryConfig.Launches = {
        before_date: new Date("2023-11-22T12:00:00Z"),
      };

      const params = new URLSearchParams({ before_date: "2023-11-22" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with before_date", async () => {
      const testParams: RLLQueryConfig.Launches = {
        before_date: "2023-11-22T12:00:00Z",
      };

      const params = new URLSearchParams({ before_date: "2023-11-22" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with before_date", async () => {
      const testParams: RLLQueryConfig.Launches = { before_date: "2023-11-22" };

      const params = new URLSearchParams({ before_date: "2023-11-22" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined before_date", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { before_date: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "before_date" is undefined and will be ignored.'
      );
    });
  });

  describe("modified_since parameter", () => {
    it("should throw on malformed number modified_since", async () => {
      expect(() =>
        client.launches({
          modified_since: 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed array modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed string modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed string modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed string modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: "2022-33-33",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be an ISO 8601 Date String`
      );
    });

    it("should throw on malformed object modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed boolean modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed null modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed function modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: () => "2022-123",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed symbol modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should throw on malformed bigint modified_since", () => {
      expect(() =>
        client.launches({
          modified_since: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should execute correctly with modified_since", async () => {
      const testParams: RLLQueryConfig.Launches = {
        modified_since: new Date("2023-11-22T12:00:00Z"),
      };

      const params = new URLSearchParams({
        modified_since: "2023-11-22T12:00:00Z",
      });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with modified_since", async () => {
      const testParams: RLLQueryConfig.Launches = {
        modified_since: "2023-11-22T12:00:00Z",
      };

      const params = new URLSearchParams({
        modified_since: "2023-11-22T12:00:00Z",
      });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with modified_since", async () => {
      const testParams: RLLQueryConfig.Launches = {
        modified_since: "2023-11-22",
      };

      const params = new URLSearchParams({
        modified_since: "2023-11-22T00:00:00Z",
      });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined modified_since", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { modified_since: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "modified_since" is undefined and will be ignored.'
      );
    });
  });

  describe("location_id parameter", () => {
    it("should throw on malformed string location_id", async () => {
      expect(() =>
        client.launches({
          location_id: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed empty string location_id", async () => {
      expect(() =>
        client.launches({
          location_id: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed array location_id", () => {
      expect(() =>
        client.launches({
          location_id: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed object location_id", () => {
      expect(() =>
        client.launches({
          location_id: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed date location_id", () => {
      expect(() =>
        client.launches({
          location_id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed boolean location_id", () => {
      expect(() =>
        client.launches({
          location_id: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed null location_id", () => {
      expect(() =>
        client.launches({
          location_id: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed function location_id", () => {
      expect(() =>
        client.launches({
          location_id: () => 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed symbol location_id", () => {
      expect(() =>
        client.launches({
          location_id: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should throw on malformed bigint location_id", () => {
      expect(() =>
        client.launches({
          location_id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should execute correctly with location_id number", async () => {
      const testParams: RLLQueryConfig.Launches = { location_id: 3 };

      const params = new URLSearchParams({
        location_id: 3,
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string location_id to number", async () => {
      const testParams: RLLQueryConfig.Launches = { location_id: "8" };

      const params = new URLSearchParams({
        location_id: 8,
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined location_id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { location_id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "location_id" is undefined and will be ignored.'
      );
    });
  });

  describe("pad_id parameter", () => {
    it("should throw on malformed string pad_id", async () => {
      expect(() =>
        client.launches({
          pad_id: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed empty string pad_id", async () => {
      expect(() =>
        client.launches({ pad_id: "" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed array pad_id", () => {
      expect(() =>
        client.launches({ pad_id: [] } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed object pad_id", () => {
      expect(() =>
        client.launches({ pad_id: {} } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed date pad_id", () => {
      expect(() =>
        client.launches({
          pad_id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed boolean pad_id", () => {
      expect(() =>
        client.launches({
          pad_id: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed null pad_id", () => {
      expect(() =>
        client.launches({ pad_id: null } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed function pad_id", () => {
      expect(() =>
        client.launches({
          pad_id: () => 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed symbol pad_id", () => {
      expect(() =>
        client.launches({
          pad_id: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should throw on malformed bigint pad_id", () => {
      expect(() =>
        client.launches({
          pad_id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should execute correctly with pad_id number", async () => {
      const testParams: RLLQueryConfig.Launches = { pad_id: 3 };

      const params = new URLSearchParams({ pad_id: 3 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string pad_id to number", async () => {
      const testParams: RLLQueryConfig.Launches = { pad_id: "8" };

      const params = new URLSearchParams({ pad_id: 8 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined pad_id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { pad_id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "pad_id" is undefined and will be ignored.'
      );
    });
  });

  describe("provider_id parameter", () => {
    it("should throw on malformed string provider_id", async () => {
      expect(() =>
        client.launches({
          provider_id: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed empty string provider_id", async () => {
      expect(() =>
        client.launches({
          provider_id: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed array provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed object provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed date provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed boolean provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed null provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed function provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: () => 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed symbol provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should throw on malformed bigint provider_id", () => {
      expect(() =>
        client.launches({
          provider_id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should execute correctly with provider_id number", async () => {
      const testParams: RLLQueryConfig.Launches = { provider_id: 3 };

      const params = new URLSearchParams({
        provider_id: 3,
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string provider_id to number", async () => {
      const testParams: RLLQueryConfig.Launches = { provider_id: "8" };

      const params = new URLSearchParams({
        provider_id: 8,
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined provider_id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { provider_id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "provider_id" is undefined and will be ignored.'
      );
    });
  });

  describe("tag_id parameter", () => {
    it("should throw on malformed string tag_id", async () => {
      expect(() =>
        client.launches({
          tag_id: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed empty string tag_id", async () => {
      expect(() =>
        client.launches({ tag_id: "" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed array tag_id", () => {
      expect(() =>
        client.launches({ tag_id: [] } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed object tag_id", () => {
      expect(() =>
        client.launches({ tag_id: {} } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed date tag_id", () => {
      expect(() =>
        client.launches({
          tag_id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed boolean tag_id", () => {
      expect(() =>
        client.launches({
          tag_id: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed null tag_id", () => {
      expect(() =>
        client.launches({ tag_id: null } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed function tag_id", () => {
      expect(() =>
        client.launches({
          tag_id: () => 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed Symbol tag_id", () => {
      expect(() =>
        client.launches({
          tag_id: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should throw on malformed function tag_id", () => {
      expect(() =>
        client.launches({
          tag_id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should execute correctly with tag_id number", async () => {
      const testParams: RLLQueryConfig.Launches = { tag_id: 3 };

      const params = new URLSearchParams({ tag_id: 3 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string tag_id to number", async () => {
      const testParams: RLLQueryConfig.Launches = { tag_id: "8" };

      const params = new URLSearchParams({ tag_id: 8 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined tag_id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { tag_id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "tag_id" is undefined and will be ignored.'
      );
    });
  });

  describe("vehicle_id parameter", () => {
    it("should throw on malformed string vehicle_id", async () => {
      expect(() =>
        client.launches({
          vehicle_id: "banana",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed empty string vehicle_id", async () => {
      expect(() =>
        client.launches({
          vehicle_id: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed array vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed object vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed date vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed boolean vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed null vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed function vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: () => 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed symbol vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should throw on malformed bigint vehicle_id", () => {
      expect(() =>
        client.launches({
          vehicle_id: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should execute correctly with vehicle_id number", async () => {
      const testParams: RLLQueryConfig.Launches = { vehicle_id: 3 };

      const params = new URLSearchParams({ vehicle_id: 3 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should convert string vehicle_id to number", async () => {
      const testParams: RLLQueryConfig.Launches = { vehicle_id: "8" };

      const params = new URLSearchParams({ vehicle_id: 8 } as unknown as Record<
        string,
        string
      >);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined vehicle_id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { vehicle_id: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "vehicle_id" is undefined and will be ignored.'
      );
    });
  });

  describe("state_abbr parameter", () => {
    it("should throw on malformed number state_abbr", async () => {
      expect(() =>
        client.launches({
          state_abbr: 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed empty string state_abbr", async () => {
      expect(() =>
        client.launches({
          state_abbr: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should throw on malformed nonexistant state_abbr", async () => {
      expect(() =>
        client.launches({
          state_abbr: "XX",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should throw on malformed array state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed object state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed date state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed boolean state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed null state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed function state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: () => "FL",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed symbol state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should throw on malformed bigint state_abbr", () => {
      expect(() =>
        client.launches({
          state_abbr: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should execute correctly with good state code", async () => {
      const testParams: RLLQueryConfig.Launches = { state_abbr: "FL" };

      const params = new URLSearchParams({ state_abbr: "FL" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined state_abbr", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { state_abbr: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "state_abbr" is undefined and will be ignored.'
      );
    });
  });

  describe("country_code parameter", () => {
    it("should throw on malformed number country_code", async () => {
      expect(() =>
        client.launches({
          country_code: 5,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed empty string country_code", async () => {
      expect(() =>
        client.launches({
          country_code: "",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should throw on malformed nonexistant country_code", async () => {
      expect(() =>
        client.launches({
          country_code: "XX",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should throw on malformed array country_code", () => {
      expect(() =>
        client.launches({
          country_code: [],
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed object country_code", () => {
      expect(() =>
        client.launches({
          country_code: {},
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed date country_code", () => {
      expect(() =>
        client.launches({
          country_code: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed boolean country_code", () => {
      expect(() =>
        client.launches({
          country_code: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed null country_code", () => {
      expect(() =>
        client.launches({
          country_code: null,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed function country_code", () => {
      expect(() =>
        client.launches({
          country_code: () => "US",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed symbol country_code", () => {
      expect(() =>
        client.launches({
          country_code: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed bigint country_code", () => {
      expect(() =>
        client.launches({
          country_code: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should execute correctly with good country code", async () => {
      const testParams: RLLQueryConfig.Launches = { country_code: "US" };

      const params = new URLSearchParams({ country_code: "US" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

      scope.done();
    });

    it("should ignore undefined country_code", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { country_code: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "country_code" is undefined and will be ignored.'
      );
    });
  });

  describe("search parameter", () => {
    it("should throw on malformed empty string search", async () => {
      expect(() =>
        client.launches({ search: "" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": String must have length greater than 0`
      );
    });

    it("should throw on malformed array search", () => {
      expect(() =>
        client.launches({ search: [] } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed object search", () => {
      expect(() =>
        client.launches({ search: {} } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed date search", () => {
      expect(() =>
        client.launches({
          search: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed boolean search", () => {
      expect(() =>
        client.launches({
          search: false,
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed null search", () => {
      expect(() =>
        client.launches({ search: null } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed function search", () => {
      expect(() =>
        client.launches({
          search: () => "spacex",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed Symbol search", () => {
      expect(() =>
        client.launches({
          search: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should throw on malformed bigint search", () => {
      expect(() =>
        client.launches({
          search: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should execute correctly with good string", async () => {
      const testParams: RLLQueryConfig.Launches = { search: "mars" };

      const params = new URLSearchParams({ search: "mars" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with good number", async () => {
      const testParams: RLLQueryConfig.Launches = { search: 2020 };

      const params = new URLSearchParams({ search: "2020" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined search", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { search: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "search" is undefined and will be ignored.'
      );
    });
  });

  describe("slug parameter", () => {
    it("should throw on malformed empty string slug", async () => {
      expect(() =>
        client.launches({ slug: "" } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": String must have length greater than 0`
      );
    });

    it("should throw on malformed array slug", () => {
      expect(() =>
        client.launches({ slug: [] } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed object slug", () => {
      expect(() =>
        client.launches({ slug: {} } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed date slug", () => {
      expect(() =>
        client.launches({
          slug: new Date(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed boolean slug", () => {
      expect(() =>
        client.launches({ slug: false } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed null slug", () => {
      expect(() =>
        client.launches({ slug: null } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed function slug", () => {
      expect(() =>
        client.launches({
          slug: () => "spacex",
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed symbol slug", () => {
      expect(() =>
        client.launches({
          slug: Symbol(),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should throw on malformed bigint slug", () => {
      expect(() =>
        client.launches({
          slug: BigInt(5),
        } as unknown as RLLQueryConfig.Launches)
      ).to.throw(
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should execute correctly with a good string", async () => {
      const testParams: RLLQueryConfig.Launches = { slug: "ses-12-ses-13" };

      const params = new URLSearchParams({ slug: "ses-12-ses-13" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should execute correctly with a good number", async () => {
      const testParams: RLLQueryConfig.Launches = { slug: 13 };

      const params = new URLSearchParams({ slug: "13" });

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined slug", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams: RLLQueryConfig.Launches = { slug: undefined };

      const params = new URLSearchParams({});

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "slug" is undefined and will be ignored.'
      );
    });
  });
});
