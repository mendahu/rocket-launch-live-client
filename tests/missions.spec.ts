import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import chai from "chai";
import Sinon from "sinon";
import RLLClient from "../src/Client";
import rllc from "../src/index";
import { RLLQueryConfig } from "../src/types/application";
import * as utils from "../src/utils";

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe("missions method", () => {
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
      .get("/json/missions")
      .query((actualQueryObject) => {
        return Object.keys(actualQueryObject).length === 0;
      })
      .reply(200, {});

    await client.missions();

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
      .get("/json/missions")
      .query(params)
      .reply(200, {});

    await client.missions(testParams);

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
      .get("/json/missions")
      .query(params)
      .reply(200, {});

    await client.missions(testParams as RLLQueryConfig.Missions);

    scope.done();

    expect(spy.getCall(0).args[0]).to.equal(
      'Parameter "inactive" is not a valid option for the missions endpoint. It will be ignored.'
    );
  });

  describe("page parameter", () => {
    it("should reject on malformed string page", async () => {
      return assert.isRejected(
        client.missions({
          page: "banana",
        } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed array page", () => {
      return assert.isRejected(
        client.missions({ page: [] } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed object page", () => {
      return assert.isRejected(
        client.missions({ page: {} } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed date page", () => {
      return assert.isRejected(
        client.missions({
          page: new Date(),
        } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed boolean page", () => {
      return assert.isRejected(
        client.missions({ page: false } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed null page", () => {
      return assert.isRejected(
        client.missions({ page: null } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed function page", () => {
      return assert.isRejected(
        client.missions({
          page: () => 5,
        } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "page": Must be a number.`
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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should reject on malformed string id", async () => {
      return assert.isRejected(
        client.missions({ id: "banana" } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed array id", () => {
      return assert.isRejected(
        client.missions({ id: [] } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed object id", () => {
      return assert.isRejected(
        client.missions({ id: {} } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed date id", () => {
      return assert.isRejected(
        client.missions({
          id: new Date(),
        } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed boolean id", () => {
      return assert.isRejected(
        client.missions({ id: false } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed null id", () => {
      return assert.isRejected(
        client.missions({ id: null } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed function id", () => {
      return assert.isRejected(
        client.missions({ id: () => 5 } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "id": Must be a number.`
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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("name parameter", () => {
    it("should reject on malformed empty string name", async () => {
      return assert.isRejected(
        client.missions({ name: "" } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": String must have length greater than 0`
      );
    });

    it("should reject on malformed array name", () => {
      return assert.isRejected(
        client.missions({ name: [] } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed object name", () => {
      return assert.isRejected(
        client.missions({ name: {} } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed date name", () => {
      return assert.isRejected(
        client.missions({
          name: new Date(),
        } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed boolean name", () => {
      return assert.isRejected(
        client.missions({ name: false } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed null name", () => {
      return assert.isRejected(
        client.missions({ name: null } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": Must be a string.`
      );
    });

    it("should reject on malformed function name", () => {
      return assert.isRejected(
        client.missions({
          name: () => "spacex",
        } as unknown as RLLQueryConfig.Missions),
        `Malformed query parameter for resource "missions" and parameter: "name": Must be a string.`
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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

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
        .get("/json/missions")
        .query(params)
        .reply(200, {});

      await client.missions(testParams);

      scope.done();

      expect(spy.getCall(0).args[0]).to.equal(
        'Parameter "name" is undefined and will be ignored.'
      );
    });
  });
});
