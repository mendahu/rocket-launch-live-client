import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import chai from "chai";
import Sinon from "sinon";
import * as utils from "../src/utils";
import { rllc, RLLClient, RLLQueryConfig } from "../src";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("companies method", () => {
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
      .get("/json/companies")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.companies();

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
      .get("/json/companies")
      .query(params)
      .reply(200, {});

    await client.companies(testParams);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if using invalid query params", async () => {
    spy = sandbox.spy(utils, "warn");

    const testParams = { location_id: 5 };

    const params = new URLSearchParams({});

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/companies")
      .query(params)
      .reply(200, {});

    await client.companies(testParams as RLLQueryConfig.Companies);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      'Parameter "location_id" is not a valid option for the companies endpoint. It will be ignored.'
    );
  });

  it("should throw if passed invalid query params object", () => {
    expect(() =>
      client.companies(5 as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies("5" as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies(null as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies(BigInt(5) as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies(Symbol() as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies([] as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies(false as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
    expect(() =>
      client.companies((() => 5) as unknown as RLLQueryConfig.Companies)
    ).to.throw(
      "[RLL Client]: Invalid type for query options. Must be an object."
    );
  });

  describe("page parameter", () => {
    it("should throw on malformed string page", async () => {
      expect(() => client.companies({ page: "banana" })).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed array page", () => {
      expect(() =>
        client.companies({ page: [] } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed object page", () => {
      expect(() =>
        client.companies({ page: {} } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed date page", () => {
      expect(() =>
        client.companies({
          page: new Date(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed boolean page", () => {
      expect(() =>
        client.companies({
          page: false,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed null page", () => {
      expect(() =>
        client.companies({ page: null } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed function page", () => {
      expect(() =>
        client.companies({
          page: () => 5,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should throw on malformed symbol page", () => {
      expect(() =>
        client.companies({
          page: Symbol(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed bigint page", () => {
      expect(() =>
        client.companies({
          page: BigInt(5),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `[RLL Client]: Malformed query parameter for resource "companies" and parameter: "page": Must be a number.`
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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

      scope.done();
    });

    it("should ignore undefined page", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { page: undefined };

      const params = new URLSearchParams({});

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

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should throw on malformed string id", async () => {
      expect(() => client.companies({ id: "banana" })).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed array id", () => {
      expect(() =>
        client.companies({ id: [] } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed object id", () => {
      expect(() =>
        client.companies({ id: {} } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed date id", () => {
      expect(() =>
        client.companies({
          id: new Date(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed boolean id", () => {
      expect(() =>
        client.companies({ id: false } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed null id", () => {
      expect(() =>
        client.companies({ id: null } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed function id", () => {
      expect(() =>
        client.companies({
          id: () => 5,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed Symbol id", () => {
      expect(() =>
        client.companies({
          id: Symbol(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
      );
    });

    it("should throw on malformed bigint id", () => {
      expect(() =>
        client.companies({
          id: BigInt(5),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "id": Must be a number.`
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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

      scope.done();
    });

    it("should ignore undefined id", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { id: undefined };

      const params = new URLSearchParams({});

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

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("name parameter", () => {
    it("should throw on malformed empty string name", async () => {
      expect(() => client.companies({ name: "" })).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": String must have length greater than 0`
      );
    });

    it("should throw on malformed array name", () => {
      expect(() =>
        client.companies({ name: [] } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed object name", () => {
      expect(() =>
        client.companies({ name: {} } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed date name", () => {
      expect(() =>
        client.companies({
          name: new Date(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed boolean name", () => {
      expect(() =>
        client.companies({
          name: false,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed null name", () => {
      expect(() =>
        client.companies({ name: null } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed function name", () => {
      expect(() =>
        client.companies({
          name: () => "spacex",
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed symbol name", () => {
      expect(() =>
        client.companies({
          name: Symbol(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
      );
    });

    it("should throw on malformed bigint name", () => {
      expect(() =>
        client.companies({
          name: BigInt(5),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "name": Must be a string.`
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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

      scope.done();
    });

    it("should ignore undefined name", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { name: undefined };

      const params = new URLSearchParams({});

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

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "name" is undefined and will be ignored.'
      );
    });
  });

  describe("country_code parameter", () => {
    it("should throw on malformed number country_code", async () => {
      expect(
        () =>
          client.companies({
            country_code: 5,
          } as unknown as RLLQueryConfig.Companies),
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed empty string country_code", async () => {
      expect(
        () =>
          client.companies({
            country_code: "",
          } as unknown as RLLQueryConfig.Companies),
        `Malformed query parameter for resource "companies" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should throw on malformed nonexistant country_code", async () => {
      expect(() =>
        client.companies({
          country_code: "XX",
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should throw on malformed array country_code", () => {
      expect(() =>
        client.companies({
          country_code: [],
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed object country_code", () => {
      expect(() =>
        client.companies({
          country_code: {},
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed date country_code", () => {
      expect(() =>
        client.companies({
          country_code: new Date(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed boolean country_code", () => {
      expect(() =>
        client.companies({
          country_code: false,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed null country_code", () => {
      expect(() =>
        client.companies({
          country_code: null,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed function country_code", () => {
      expect(() =>
        client.companies({
          country_code: () => "US",
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed symbol country_code", () => {
      expect(() =>
        client.companies({
          country_code: Symbol(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should throw on malformed bigint country_code", () => {
      expect(() =>
        client.companies({
          country_code: BigInt(5),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "country_code": Must be a string.`
      );
    });

    it("should execute correctly with good country code", async () => {
      const testParams: RLLQueryConfig.Companies = { country_code: "US" };

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

      const testParams = { country_code: undefined };

      const params = new URLSearchParams({});

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

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "country_code" is undefined and will be ignored.'
      );
    });
  });

  describe("inactive parameter", () => {
    it("should throw on malformed number inactive", async () => {
      expect(() =>
        client.companies({
          inactive: 5,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed array inactive", () => {
      expect(() =>
        client.companies({
          inactive: [],
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed object inactive", () => {
      expect(() =>
        client.companies({
          inactive: {},
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed date inactive", () => {
      expect(() =>
        client.companies({
          inactive: new Date(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed string inactive", () => {
      expect(() =>
        client.companies({
          inactive: "true",
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed null inactive", () => {
      expect(() =>
        client.companies({
          inactive: null,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed function inactive", () => {
      expect(() =>
        client.companies({
          inactive: () => true,
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed symbol inactive", () => {
      expect(() =>
        client.companies({
          inactive: Symbol(),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should throw on malformed bigint inactive", () => {
      expect(() =>
        client.companies({
          inactive: BigInt(5),
        } as unknown as RLLQueryConfig.Companies)
      ).to.throw(
        `Malformed query parameter for resource "companies" and parameter: "inactive": Must be a boolean.`
      );
    });

    it("should execute correctly with inactive parameter", async () => {
      const testParams = { inactive: true };

      const params = new URLSearchParams({ inactive: 1 } as unknown as Record<
        string,
        string
      >);

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

    it("should ignore undefined inactive", async () => {
      spy = sandbox.spy(utils, "warn");

      const testParams = { inactive: undefined };

      const params = new URLSearchParams({});

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

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "inactive" is undefined and will be ignored.'
      );
    });
  });
});
