const nock = require("nock");
const sinon = require("sinon");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const utils = require("../dist/utils");

const { expect, assert } = chai;

const rllc = require("../dist/index");
const clientGen = rllc.default;

describe("launches method", () => {
  let sandbox;
  let client;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    client = clientGen("aac004f6-07ab-4f82-bff2-71d977072c56");
    sandbox.restore();
  });

  after(() => {
    utils.warn.restore();
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
    sandbox.spy(utils, "warn");

    const testParams = { id: 5, search: "banana" };

    const params = new URLSearchParams(testParams);

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

    expect(utils.warn.getCall(0).args[0]).to.equal(
      "Using 'id', 'slug', or 'cospar_id' as query parameters generally returns a single result. Combining it with other parameters may not be achieving the result you expect."
    );
  });

  it("should warn if using invalid query params", async () => {
    sandbox.spy(utils, "warn");

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

    await client.launches(testParams);

    scope.done();

    expect(utils.warn.getCall(0).args[0]).to.equal(
      'Parameter "inactive" is not a valid option for the launches endpoint. It will be ignored.'
    );
  });

  describe("page parameter", () => {
    it("should reject on malformed string page", async () => {
      return assert.isRejected(
        client.launches({ page: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed empty string page", async () => {
      return assert.isRejected(
        client.launches({ page: "" }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed array page", () => {
      return assert.isRejected(
        client.launches({ page: [] }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed object page", () => {
      return assert.isRejected(
        client.launches({ page: {} }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed date page", () => {
      return assert.isRejected(
        client.launches({ page: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed boolean page", () => {
      return assert.isRejected(
        client.launches({ page: false }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed null page", () => {
      return assert.isRejected(
        client.launches({ page: null }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should reject on malformed function page", () => {
      return assert.isRejected(
        client.launches({ page: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "page": Must be a number.`
      );
    });

    it("should execute correctly with page number", async () => {
      const testParams = { page: 6 };

      const params = new URLSearchParams({ page: 6 });

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
      const testParams = { page: "5" };

      const params = new URLSearchParams({ page: 5 });

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
      sandbox.spy(utils, "warn");

      const testParams = { page: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "page" is undefined and will be ignored.'
      );
    });
  });

  describe("id parameter", () => {
    it("should reject on malformed string id", async () => {
      return assert.isRejected(
        client.launches({ id: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed empty string id", async () => {
      return assert.isRejected(
        client.launches({ id: "" }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed array id", () => {
      return assert.isRejected(
        client.launches({ id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed object id", () => {
      return assert.isRejected(
        client.launches({ id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed date id", () => {
      return assert.isRejected(
        client.launches({ id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed boolean id", () => {
      return assert.isRejected(
        client.launches({ id: false }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed null id", () => {
      return assert.isRejected(
        client.launches({ id: null }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should reject on malformed function id", () => {
      return assert.isRejected(
        client.launches({ id: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "id": Must be a number.`
      );
    });

    it("should execute correctly with id parameter", async () => {
      const testParams = { id: 6 };

      const params = new URLSearchParams({ id: 6 });

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
      const testParams = { id: "5" };

      const params = new URLSearchParams({ id: 5 });

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
      sandbox.spy(utils, "warn");

      const testParams = { id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "id" is undefined and will be ignored.'
      );
    });
  });

  describe("cospar_id parameter", () => {
    it("should reject on malformed number cospar_id", async () => {
      return assert.isRejected(
        client.launches({ cospar_id: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should reject on malformed empty string cospar_id", async () => {
      return assert.isRejected(
        client.launches({ cospar_id: "" }),
        "Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)"
      );
    });

    it("should reject on malformed string cospar_id", async () => {
      return assert.isRejected(
        client.launches({ cospar_id: "213-392" }),
        "Cospar IDs must be in the format of YYYY-NNN (eg. 2023-123)"
      );
    });

    it("should reject on malformed array cospar_id", () => {
      return assert.isRejected(
        client.launches({ cospar_id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should reject on malformed object cospar_id", () => {
      return assert.isRejected(
        client.launches({ cospar_id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should reject on malformed date cospar_id", () => {
      return assert.isRejected(
        client.launches({ cospar_id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should reject on malformed boolean cospar_id", () => {
      return assert.isRejected(
        client.launches({ cospar_id: false }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should reject on malformed null cospar_id", () => {
      return assert.isRejected(
        client.launches({ cospar_id: null }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should reject on malformed function cospar_id", () => {
      return assert.isRejected(
        client.launches({ cospar_id: () => "2022-123" }),
        `Malformed query parameter for resource "launches" and parameter: "cospar_id": Must be a string.`
      );
    });

    it("should execute correctly with cospar_id param", async () => {
      const testParams = { cospar_id: "2022-123" };

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
      sandbox.spy(utils, "warn");

      const testParams = { cospar_id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "cospar_id" is undefined and will be ignored.'
      );
    });
  });

  describe("after_date parameter", () => {
    it("should reject on malformed number after_date", async () => {
      return assert.isRejected(
        client.launches({ after_date: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed string after_date", async () => {
      return assert.isRejected(
        client.launches({ after_date: "" }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed string after_date", async () => {
      return assert.isRejected(
        client.launches({ after_date: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed string after_date", async () => {
      return assert.isRejected(
        client.launches({ after_date: "22-01-34" }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed array after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: [] }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed object after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: {} }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed boolean after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: false }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed null after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: null }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed function after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: () => new Date("2023-01-02T12:00:00Z") }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should execute correctly with Date after_date", async () => {
      const testParams = { after_date: new Date("2023-01-02T12:00:00Z") };

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
      const testParams = { after_date: "2023-01-02T12:00:00Z" };

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
      const testParams = { after_date: "2023-01-02" };

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
      sandbox.spy(utils, "warn");

      const testParams = { after_date: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "after_date" is undefined and will be ignored.'
      );
    });
  });

  describe("before_date parameter", () => {
    it("should reject on malformed number before_date", async () => {
      return assert.isRejected(
        client.launches({ before_date: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed string before_date", async () => {
      return assert.isRejected(
        client.launches({ before_date: "" }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed string before_date", async () => {
      return assert.isRejected(
        client.launches({ before_date: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed string before_date", async () => {
      return assert.isRejected(
        client.launches({ before_date: "22-01-34" }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed array before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: [] }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed object before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: {} }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed boolean before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: false }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed null before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: null }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed function before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: () => "2022-123" }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should execute correctly with before_date", async () => {
      const testParams = { before_date: new Date("2023-11-22T12:00:00Z") };

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
      const testParams = { before_date: "2023-11-22T12:00:00Z" };

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
      const testParams = { before_date: "2023-11-22" };

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
      sandbox.spy(utils, "warn");

      const testParams = { before_date: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "before_date" is undefined and will be ignored.'
      );
    });
  });

  describe("modified_since parameter", () => {
    it("should reject on malformed number modified_since", async () => {
      return assert.isRejected(
        client.launches({ modified_since: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed array modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: [] }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed string modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: "" }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed string modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed string modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: "2022-33-33" }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be an ISO 8601 Date String`
      );
    });

    it("should reject on malformed object modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: {} }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed boolean modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: false }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed null modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: null }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should reject on malformed function modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: () => "2022-123" }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object or ISO 8601 Date String`
      );
    });

    it("should execute correctly with modified_since", async () => {
      const testParams = { modified_since: new Date("2023-11-22T12:00:00Z") };

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
      const testParams = { modified_since: "2023-11-22T12:00:00Z" };

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
      const testParams = { modified_since: "2023-11-22" };

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
      sandbox.spy(utils, "warn");

      const testParams = { modified_since: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "modified_since" is undefined and will be ignored.'
      );
    });
  });

  describe("location_id parameter", () => {
    it("should reject on malformed string location_id", async () => {
      return assert.isRejected(
        client.launches({ location_id: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed empty string location_id", async () => {
      return assert.isRejected(
        client.launches({ location_id: "" }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed array location_id", () => {
      return assert.isRejected(
        client.launches({ location_id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed object location_id", () => {
      return assert.isRejected(
        client.launches({ location_id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed date location_id", () => {
      return assert.isRejected(
        client.launches({ location_id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed boolean location_id", () => {
      return assert.isRejected(
        client.launches({ location_id: false }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed null location_id", () => {
      return assert.isRejected(
        client.launches({ location_id: null }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should reject on malformed function location_id", () => {
      return assert.isRejected(
        client.launches({ location_id: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "location_id": Must be a number.`
      );
    });

    it("should execute correctly with location_id number", async () => {
      const testParams = { location_id: 3 };

      const params = new URLSearchParams({ location_id: 3 });

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
      const testParams = { location_id: "8" };

      const params = new URLSearchParams({ location_id: 8 });

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
      sandbox.spy(utils, "warn");

      const testParams = { location_id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "location_id" is undefined and will be ignored.'
      );
    });
  });

  describe("pad_id parameter", () => {
    it("should reject on malformed string pad_id", async () => {
      return assert.isRejected(
        client.launches({ pad_id: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed empty string pad_id", async () => {
      return assert.isRejected(
        client.launches({ pad_id: "" }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed array pad_id", () => {
      return assert.isRejected(
        client.launches({ pad_id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed object pad_id", () => {
      return assert.isRejected(
        client.launches({ pad_id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed date pad_id", () => {
      return assert.isRejected(
        client.launches({ pad_id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed boolean pad_id", () => {
      return assert.isRejected(
        client.launches({ pad_id: false }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed null pad_id", () => {
      return assert.isRejected(
        client.launches({ pad_id: null }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should reject on malformed function pad_id", () => {
      return assert.isRejected(
        client.launches({ pad_id: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "pad_id": Must be a number.`
      );
    });

    it("should execute correctly with pad_id number", async () => {
      const testParams = { pad_id: 3 };

      const params = new URLSearchParams({ pad_id: 3 });

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
      const testParams = { pad_id: "8" };

      const params = new URLSearchParams({ pad_id: 8 });

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
      sandbox.spy(utils, "warn");

      const testParams = { pad_id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "pad_id" is undefined and will be ignored.'
      );
    });
  });

  describe("provider_id parameter", () => {
    it("should reject on malformed string provider_id", async () => {
      return assert.isRejected(
        client.launches({ provider_id: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed empty string provider_id", async () => {
      return assert.isRejected(
        client.launches({ provider_id: "" }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed array provider_id", () => {
      return assert.isRejected(
        client.launches({ provider_id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed object provider_id", () => {
      return assert.isRejected(
        client.launches({ provider_id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed date provider_id", () => {
      return assert.isRejected(
        client.launches({ provider_id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed boolean provider_id", () => {
      return assert.isRejected(
        client.launches({ provider_id: false }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed null provider_id", () => {
      return assert.isRejected(
        client.launches({ provider_id: null }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should reject on malformed function provider_id", () => {
      return assert.isRejected(
        client.launches({ provider_id: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "provider_id": Must be a number.`
      );
    });

    it("should execute correctly with provider_id number", async () => {
      const testParams = { provider_id: 3 };

      const params = new URLSearchParams({ provider_id: 3 });

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
      const testParams = { provider_id: "8" };

      const params = new URLSearchParams({ provider_id: 8 });

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
      sandbox.spy(utils, "warn");

      const testParams = { provider_id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "provider_id" is undefined and will be ignored.'
      );
    });
  });

  describe("tag_id parameter", () => {
    it("should reject on malformed string tag_id", async () => {
      return assert.isRejected(
        client.launches({ tag_id: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed empty string tag_id", async () => {
      return assert.isRejected(
        client.launches({ tag_id: "" }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed array tag_id", () => {
      return assert.isRejected(
        client.launches({ tag_id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed object tag_id", () => {
      return assert.isRejected(
        client.launches({ tag_id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed date tag_id", () => {
      return assert.isRejected(
        client.launches({ tag_id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed boolean tag_id", () => {
      return assert.isRejected(
        client.launches({ tag_id: false }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed null tag_id", () => {
      return assert.isRejected(
        client.launches({ tag_id: null }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should reject on malformed function tag_id", () => {
      return assert.isRejected(
        client.launches({ tag_id: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "tag_id": Must be a number.`
      );
    });

    it("should execute correctly with tag_id number", async () => {
      const testParams = { tag_id: 3 };

      const params = new URLSearchParams({ tag_id: 3 });

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
      const testParams = { tag_id: "8" };

      const params = new URLSearchParams({ tag_id: 8 });

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
      sandbox.spy(utils, "warn");

      const testParams = { tag_id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "tag_id" is undefined and will be ignored.'
      );
    });
  });

  describe("vehicle_id parameter", () => {
    it("should reject on malformed string vehicle_id", async () => {
      return assert.isRejected(
        client.launches({ vehicle_id: "banana" }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed empty string vehicle_id", async () => {
      return assert.isRejected(
        client.launches({ vehicle_id: "" }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed array vehicle_id", () => {
      return assert.isRejected(
        client.launches({ vehicle_id: [] }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed object vehicle_id", () => {
      return assert.isRejected(
        client.launches({ vehicle_id: {} }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed date vehicle_id", () => {
      return assert.isRejected(
        client.launches({ vehicle_id: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed boolean vehicle_id", () => {
      return assert.isRejected(
        client.launches({ vehicle_id: false }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed null vehicle_id", () => {
      return assert.isRejected(
        client.launches({ vehicle_id: null }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should reject on malformed function vehicle_id", () => {
      return assert.isRejected(
        client.launches({ vehicle_id: () => 5 }),
        `Malformed query parameter for resource "launches" and parameter: "vehicle_id": Must be a number.`
      );
    });

    it("should execute correctly with vehicle_id number", async () => {
      const testParams = { vehicle_id: 3 };

      const params = new URLSearchParams({ vehicle_id: 3 });

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
      const testParams = { vehicle_id: "8" };

      const params = new URLSearchParams({ vehicle_id: 8 });

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
      sandbox.spy(utils, "warn");

      const testParams = { vehicle_id: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "vehicle_id" is undefined and will be ignored.'
      );
    });
  });

  describe("state_abbr parameter", () => {
    it("should reject on malformed number state_abbr", async () => {
      return assert.isRejected(
        client.launches({ state_abbr: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed empty string state_abbr", async () => {
      return assert.isRejected(
        client.launches({ state_abbr: "" }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should reject on malformed nonexistant state_abbr", async () => {
      return assert.isRejected(
        client.launches({ state_abbr: "XX" }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Invalid United States State Code. State Codes should follow ISO 3166-2 convention, like 'FL'.`
      );
    });

    it("should reject on malformed array state_abbr", () => {
      return assert.isRejected(
        client.launches({ state_abbr: [] }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed object state_abbr", () => {
      return assert.isRejected(
        client.launches({ state_abbr: {} }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed date state_abbr", () => {
      return assert.isRejected(
        client.launches({ state_abbr: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed boolean state_abbr", () => {
      return assert.isRejected(
        client.launches({ state_abbr: false }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed null state_abbr", () => {
      return assert.isRejected(
        client.launches({ state_abbr: null }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
      );
    });

    it("should reject on malformed function state_abbr", () => {
      return assert.isRejected(
        client.launches({ state_abbr: () => "FL" }),
        `Malformed query parameter for resource "launches" and parameter: "state_abbr": Must be a string.`
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
        .get("/json/launches")
        .query(params)
        .reply(200, {});

      await client.launches(testParams);

      scope.done();
    });

    it("should ignore undefined state_abbr", async () => {
      sandbox.spy(utils, "warn");

      const testParams = { state_abbr: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "state_abbr" is undefined and will be ignored.'
      );
    });
  });

  describe("country_code parameter", () => {
    it("should reject on malformed number country_code", async () => {
      return assert.isRejected(
        client.launches({ country_code: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed empty string country_code", async () => {
      return assert.isRejected(
        client.launches({ country_code: "" }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should reject on malformed nonexistant country_code", async () => {
      return assert.isRejected(
        client.launches({ country_code: "XX" }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention, like 'US'.`
      );
    });

    it("should reject on malformed array country_code", () => {
      return assert.isRejected(
        client.launches({ country_code: [] }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed object country_code", () => {
      return assert.isRejected(
        client.launches({ country_code: {} }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed date country_code", () => {
      return assert.isRejected(
        client.launches({ country_code: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed boolean country_code", () => {
      return assert.isRejected(
        client.launches({ country_code: false }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed null country_code", () => {
      return assert.isRejected(
        client.launches({ country_code: null }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
      );
    });

    it("should reject on malformed function country_code", () => {
      return assert.isRejected(
        client.launches({ country_code: () => "US" }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Must be a string.`
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
        .get("/json/companies")
        .query(params)
        .reply(200, {});

      await client.companies(testParams);

      scope.done();
    });

    it("should ignore undefined country_code", async () => {
      sandbox.spy(utils, "warn");

      const testParams = { country_code: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "country_code" is undefined and will be ignored.'
      );
    });
  });

  describe("search parameter", () => {
    it("should reject on malformed number search", async () => {
      return assert.isRejected(
        client.launches({ search: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should reject on malformed empty string search", async () => {
      return assert.isRejected(
        client.launches({ search: "" }),
        `Malformed query parameter for resource "launches" and parameter: "search": String must have length greater than 0`
      );
    });

    it("should reject on malformed array search", () => {
      return assert.isRejected(
        client.launches({ search: [] }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should reject on malformed object search", () => {
      return assert.isRejected(
        client.launches({ search: {} }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should reject on malformed date search", () => {
      return assert.isRejected(
        client.launches({ search: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should reject on malformed boolean search", () => {
      return assert.isRejected(
        client.launches({ search: false }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should reject on malformed null search", () => {
      return assert.isRejected(
        client.launches({ search: null }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should reject on malformed function search", () => {
      return assert.isRejected(
        client.launches({ search: () => "spacex" }),
        `Malformed query parameter for resource "launches" and parameter: "search": Must be a string.`
      );
    });

    it("should execute correctly with good string", async () => {
      const testParams = { search: "mars" };

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

    it("should ignore undefined search", async () => {
      sandbox.spy(utils, "warn");

      const testParams = { search: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "search" is undefined and will be ignored.'
      );
    });
  });

  describe("slug parameter", () => {
    it("should reject on malformed number slug", async () => {
      return assert.isRejected(
        client.launches({ slug: 5 }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should reject on malformed empty string slug", async () => {
      return assert.isRejected(
        client.launches({ slug: "" }),
        `Malformed query parameter for resource "launches" and parameter: "slug": String must have length greater than 0`
      );
    });

    it("should reject on malformed array slug", () => {
      return assert.isRejected(
        client.launches({ slug: [] }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should reject on malformed object slug", () => {
      return assert.isRejected(
        client.launches({ slug: {} }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should reject on malformed date slug", () => {
      return assert.isRejected(
        client.launches({ slug: new Date() }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should reject on malformed boolean slug", () => {
      return assert.isRejected(
        client.launches({ slug: false }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should reject on malformed null slug", () => {
      return assert.isRejected(
        client.launches({ slug: null }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should reject on malformed function slug", () => {
      return assert.isRejected(
        client.launches({ slug: () => "spacex" }),
        `Malformed query parameter for resource "launches" and parameter: "slug": Must be a string.`
      );
    });

    it("should execute correctly with a good string", async () => {
      const testParams = { slug: "ses-12-ses-13" };

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
    it("should ignore undefined slug", async () => {
      sandbox.spy(utils, "warn");

      const testParams = { slug: undefined };

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

      expect(utils.warn.getCall(0).args[0]).to.equal(
        'Parameter "slug" is undefined and will be ignored.'
      );
    });
  });
});
