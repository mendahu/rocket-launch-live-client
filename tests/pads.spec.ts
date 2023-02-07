import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import chai from "chai";
import Sinon from "sinon";
import * as utils from "../src/utils";
import { rllc, RLLClient, RLLQueryConfig } from "../src";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("pads method", () => {
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
      .get("/json/pads")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.pads();

    scope.done();
  });

  it("should warn if combining id with another param", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams = { id: 5, name: "banana" };

    const params = new URLSearchParams(
      testParams as unknown as Record<string, string>
    );

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/pads")
      .query(params)
      .reply(200, {});

    await client.pads(testParams);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if using invalid query params", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams = { inactive: false };

    const params = new URLSearchParams({} as unknown as Record<string, string>);

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/pads")
      .query(params)
      .reply(200, {});

    await client.pads(testParams as RLLQueryConfig.Pads);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      'Parameter "inactive" is not a valid option for the pads endpoint. It will be ignored.'
    );
  });

  it("should throw if passed invalid query params object", () => {
    expect(() => client.pads(5 as unknown as RLLQueryConfig.Pads)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.pads("5" as unknown as RLLQueryConfig.Pads)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.pads(null as unknown as RLLQueryConfig.Pads)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.pads(5n as unknown as RLLQueryConfig.Pads)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.pads(Symbol() as unknown as RLLQueryConfig.Pads)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.pads([] as unknown as RLLQueryConfig.Pads)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() => client.pads(false as unknown as RLLQueryConfig.Pads)).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.pads((() => 5) as unknown as RLLQueryConfig.Pads)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
  });

  describe("page parameter", () => {
    it("should reject on malformed string page", async () => {
      return assert.isRejected(
        client.pads({ page: "banana" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed array page", () => {
      return assert.isRejected(
        client.pads({ page: [] } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed object page", () => {
      return assert.isRejected(
        client.pads({ page: {} } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed date page", () => {
      return assert.isRejected(
        client.pads({ page: new Date() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed boolean page", () => {
      return assert.isRejected(
        client.pads({ page: false } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed null page", () => {
      return assert.isRejected(
        client.pads({ page: null } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed function page", () => {
      return assert.isRejected(
        client.pads({ page: () => 5 } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed Symbol page", () => {
      return assert.isRejected(
        client.pads({ page: Symbol() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed bigint page", () => {
      return assert.isRejected(
        client.pads({ page: 5n } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "page": Must be a number.`
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
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

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
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();
    });

    it("should ignore undefined page", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { page: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should reject on malformed string id", async () => {
      return assert.isRejected(
        client.pads({ id: "banana" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed array id", () => {
      return assert.isRejected(
        client.pads({ id: [] } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed object id", () => {
      return assert.isRejected(
        client.pads({ id: {} } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed date id", () => {
      return assert.isRejected(
        client.pads({ id: new Date() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed boolean id", () => {
      return assert.isRejected(
        client.pads({ id: false } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed null id", () => {
      return assert.isRejected(
        client.pads({ id: null } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed function id", () => {
      return assert.isRejected(
        client.pads({ id: () => 5 } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed Symbol() id", () => {
      return assert.isRejected(
        client.pads({ id: Symbol() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed bigint id", () => {
      return assert.isRejected(
        client.pads({ id: 5n } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "id": Must be a number.`
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
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

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
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();
    });

    it("should ignore undefined id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { id: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("name parameter", () => {
    it("should reject on malformed empty string name", async () => {
      return assert.isRejected(
        client.pads({ name: "" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": String must have length greater than 0`
      );
    });

    it("should reject on malformed array name", () => {
      return assert.isRejected(
        client.pads({ name: [] } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed object name", () => {
      return assert.isRejected(
        client.pads({ name: {} } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed date name", () => {
      return assert.isRejected(
        client.pads({ name: new Date() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed boolean name", () => {
      return assert.isRejected(
        client.pads({ name: false } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed null name", () => {
      return assert.isRejected(
        client.pads({ name: null } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed function name", () => {
      return assert.isRejected(
        client.pads({ name: () => "spacex" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed symbol name", () => {
      return assert.isRejected(
        client.pads({ name: Symbol() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed bigint name", () => {
      return assert.isRejected(
        client.pads({ name: 5n } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "name": Must be a string.`
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
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

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
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();
    });

    it("should ignore undefined name", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { name: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "name" is undefined and will be ignored.'
      );
    });
  });

  describe("state_abbr parameter", () => {
    it("should reject on malformed number state_abbr", async () => {
      return assert.isRejected(
        client.pads({ state_abbr: 5 } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed empty string state_abbr", async () => {
      return assert.isRejected(
        client.pads({ state_abbr: "" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should reject on malformed nonexistant state_abbr", async () => {
      return assert.isRejected(
        client.pads({ state_abbr: "XX" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should reject on malformed array state_abbr", () => {
      return assert.isRejected(
        client.pads({ state_abbr: [] } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed object state_abbr", () => {
      return assert.isRejected(
        client.pads({ state_abbr: {} } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed date state_abbr", () => {
      return assert.isRejected(
        client.pads({
          state_abbr: new Date(),
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed boolean state_abbr", () => {
      return assert.isRejected(
        client.pads({ state_abbr: false } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed null state_abbr", () => {
      return assert.isRejected(
        client.pads({ state_abbr: null } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed function state_abbr", () => {
      return assert.isRejected(
        client.pads({
          state_abbr: () => "FL",
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed symbol state_abbr", () => {
      return assert.isRejected(
        client.pads({ state_abbr: Symbol() } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed bigint state_abbr", () => {
      return assert.isRejected(
        client.pads({
          state_abbr: 5n,
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should execute correctly with good state code", async () => {
      const testParams: RLLQueryConfig.Pads = { state_abbr: "FL" };

      const params = new URLSearchParams({
        state_abbr: "FL",
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();
    });

    it("should ignore undefined state_abbr", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { state_abbr: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "state_abbr" is undefined and will be ignored.'
      );
    });
  });

  describe("country_code parameter", () => {
    it("should reject on malformed number country_code", async () => {
      return assert.isRejected(
        client.pads({ country_code: 5 } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed empty string country_code", async () => {
      return assert.isRejected(
        client.pads({ country_code: "" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should reject on malformed nonexistant country_code", async () => {
      return assert.isRejected(
        client.pads({ country_code: "XX" } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should reject on malformed array country_code", () => {
      return assert.isRejected(
        client.pads({ country_code: [] } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed object country_code", () => {
      return assert.isRejected(
        client.pads({ country_code: {} } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed date country_code", () => {
      return assert.isRejected(
        client.pads({
          country_code: new Date(),
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed boolean country_code", () => {
      return assert.isRejected(
        client.pads({ country_code: false } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed null country_code", () => {
      return assert.isRejected(
        client.pads({ country_code: null } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed function country_code", () => {
      return assert.isRejected(
        client.pads({
          country_code: () => "US",
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed Symbol() country_code", () => {
      return assert.isRejected(
        client.pads({
          country_code: Symbol(),
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed bigint country_code", () => {
      return assert.isRejected(
        client.pads({
          country_code: 5n,
        } as unknown as RLLQueryConfig.Pads),
        `Malformed query parameter for resource "pads" and parameter: "country_code": Must be a string.`
      );
    });

    it("should execute correctly with good country code", async () => {
      const testParams: RLLQueryConfig.Pads = { country_code: "US" };

      const params = new URLSearchParams({
        country_code: "US",
      } as unknown as Record<string, string>);

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();
    });

    it("should ignore undefined country_code", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { country_code: undefined };

      const params = new URLSearchParams(
        {} as unknown as Record<string, string>
      );

      const scope = nock("https://fdo.rocketlaunch.live", {
        reqheaders: {
          authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
        },
      })
        .get("/json/pads")
        .query(params)
        .reply(200, {});

      await client.pads(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "country_code" is undefined and will be ignored.'
      );
    });
  });
});
