import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import chai from "chai";
import Sinon from "sinon";
import * as utils from "../src/utils";
import { rllc, RLLClient, RLLQueryConfig } from "../src";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("vehicles method", () => {
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
      .get("/json/vehicles")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.vehicles();

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
      .get("/json/vehicles")
      .query(params)
      .reply(200, {});

    await client.vehicles(testParams);

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
      .get("/json/vehicles")
      .query(params)
      .reply(200, {});

    await client.vehicles(testParams as RLLQueryConfig.Vehicles);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      'Parameter "inactive" is not a valid option for the vehicles endpoint. It will be ignored.'
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
    it("should reject on malformed string page", async () => {
      return assert.isRejected(
        client.vehicles({
          page: "banana",
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed array page", () => {
      return assert.isRejected(
        client.vehicles({ page: [] } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed object page", () => {
      return assert.isRejected(
        client.vehicles({ page: {} } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed date page", () => {
      return assert.isRejected(
        client.vehicles({
          page: new Date(),
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed boolean page", () => {
      return assert.isRejected(
        client.vehicles({ page: false } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed null page", () => {
      return assert.isRejected(
        client.vehicles({ page: null } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed function page", () => {
      return assert.isRejected(
        client.vehicles({
          page: () => 5,
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed symbol page", () => {
      return assert.isRejected(
        client.vehicles({
          page: Symbol(),
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed bigint page", () => {
      return assert.isRejected(
        client.vehicles({
          page: BigInt(5),
        } as unknown as RLLQueryConfig.Vehicles),
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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should reject on malformed string id", async () => {
      return assert.isRejected(
        client.vehicles({ id: "banana" } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed array id", () => {
      return assert.isRejected(
        client.vehicles({ id: [] } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed object id", () => {
      return assert.isRejected(
        client.vehicles({ id: {} } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed date id", () => {
      return assert.isRejected(
        client.vehicles({
          id: new Date(),
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed boolean id", () => {
      return assert.isRejected(
        client.vehicles({ id: false } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed null id", () => {
      return assert.isRejected(
        client.vehicles({ id: null } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed function id", () => {
      return assert.isRejected(
        client.vehicles({ id: () => 5 } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed symbol id", () => {
      return assert.isRejected(
        client.vehicles({ id: Symbol() } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed bigint id", () => {
      return assert.isRejected(
        client.vehicles({
          id: BigInt(5),
        } as unknown as RLLQueryConfig.Vehicles),
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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("name parameter", () => {
    it("should reject on malformed empty string name", async () => {
      return assert.isRejected(
        client.vehicles({ name: "" } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": String must have length greater than 0`
      );
    });

    it("should reject on malformed array name", () => {
      return assert.isRejected(
        client.vehicles({ name: [] } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed object name", () => {
      return assert.isRejected(
        client.vehicles({ name: {} } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed date name", () => {
      return assert.isRejected(
        client.vehicles({
          name: new Date(),
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed boolean name", () => {
      return assert.isRejected(
        client.vehicles({ name: false } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed null name", () => {
      return assert.isRejected(
        client.vehicles({ name: null } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed function name", () => {
      return assert.isRejected(
        client.vehicles({
          name: () => "spacex",
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed symbol name", () => {
      return assert.isRejected(
        client.vehicles({
          name: Symbol(),
        } as unknown as RLLQueryConfig.Vehicles),
        `Malformed query parameter for resource "vehicles" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed bigint name", () => {
      return assert.isRejected(
        client.vehicles({
          name: BigInt(5),
        } as unknown as RLLQueryConfig.Vehicles),
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
        .get("/json/vehicles")
        .query(params)
        .reply(200, {});

      await client.vehicles(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "name" is undefined and will be ignored.'
      );
    });
  });
});
