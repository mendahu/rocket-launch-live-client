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
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed array after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: [] }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed string after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: "2022-10-10T00:30:30Z" }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed object after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: {} }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed boolean after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: false }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed null after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: null }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed function after_date", () => {
      return assert.isRejected(
        client.launches({ after_date: () => "2022-123" }),
        `Malformed query parameter for resource "launches" and parameter: "after_date": Must be a JavaScript Date Object.`
      );
    });

    it("should execute correctly with after_date", async () => {
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
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed array before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: [] }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed string before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: "2022-10-10T00:30:30Z" }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed object before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: {} }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed boolean before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: false }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed null before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: null }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed function before_date", () => {
      return assert.isRejected(
        client.launches({ before_date: () => "2022-123" }),
        `Malformed query parameter for resource "launches" and parameter: "before_date": Must be a JavaScript Date Object.`
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
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed array modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: [] }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed string modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: "2022-10-10T00:30:30Z" }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed object modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: {} }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed boolean modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: false }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed null modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: null }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
      );
    });

    it("should reject on malformed function modified_since", () => {
      return assert.isRejected(
        client.launches({ modified_since: () => "2022-123" }),
        `Malformed query parameter for resource "launches" and parameter: "modified_since": Must be a JavaScript Date Object.`
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
        `Malformed query parameter for resource "launches" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention.`
      );
    });

    it("should reject on malformed nonexistant country_code", async () => {
      return assert.isRejected(
        client.launches({ country_code: "XX" }),
        `Malformed query parameter for resource "launches" and parameter: "country_code": Invalid country code. Country codes should follow ISO 3166-1 A2 convention.`
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
});
