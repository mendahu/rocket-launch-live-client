import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import Sinon from "sinon";
import chai from "chai";
import nock from "nock";
import { rllc, RLLWatcherEvent } from "../src/index";
import {
  RLLEntity,
  RLLQueryConfig,
  RLLResponse,
} from "../src/types/application";
import * as utils from "../src/utils";
import "mocha";
import "sinon";
import { launches1, launches2, launches3 } from "./fixtures/launches";

chai.use(chaiAsPromised);
const { assert } = chai;

describe("rllc Watcher", () => {
  let sandbox: Sinon.SinonSandbox;
  let spy: Sinon.SinonSpy;

  before(() => {
    sandbox = Sinon.createSandbox();
  });

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    spy.restore();
  });

  it("should throw if interval is not a number", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => client.watch("banana" as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => client.watch([] as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => client.watch({} as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => client.watch((() => 5) as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => client.watch(false as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => client.watch(BigInt(5) as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => client.watch(Symbol() as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );
  });

  it("should not throw if interval is a number or parseable number", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    client.watch("5");
    client.watch(5);
    client.watch(5.5);
  });

  it("should warn if interval is a number less than 1", () => {
    spy = sandbox.spy(utils, "warn");

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    client.watch(0.5);

    expect(spy.getCall(0).args[0]).to.equal(
      "RLLWatcher does not accept intervals less than 1. Your watcher will default to 5 minute intervals unless corrected."
    );
  });

  it("should throw if interval is 0", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => client.watch(0)).to.throw(
      "RLLWatcher interval cannot be a negative number or zero. Watcher intervals should be greater than or equal to 1 minute."
    );
  });

  it("should throw if interval is a negative number", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => client.watch(-1)).to.throw(
      "RLLWatcher interval cannot be a negative number or zero. Watcher intervals should be greater than or equal to 1 minute."
    );
  });

  it("should throw if malformed search params are submitted", () => {
    // Not testing every possible parameter input here as it is well covered in the launches endpoint
    // This uses the same validator function under the hood
    // Adding just this one test to ensure the error is thrown through

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => client.watch(10, [] as RLLQueryConfig.Launches)).to.throw(
      "Invalid type for query options. Must be an object."
    );
  });

  it("should recursively query the API to fetch all results for initial cache", async () => {
    const response1: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 25,
      limit: 25,
      total: 51,
      last_page: 3,
      result: launches1,
    };
    const response2: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 25,
      limit: 25,
      total: 51,
      last_page: 3,
      result: launches2,
    };
    const response3: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 51,
      last_page: 3,
      result: [launches3[0]],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .reply(200, response1)
      .get("/json/launches")
      .query(new URLSearchParams({ page: "2" }))
      .reply(200, response2)
      .get("/json/launches")
      .query(new URLSearchParams({ page: "3" }))
      .reply(200, response3);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = client.watch();

    const promise = new Promise((resolve, reject) => {
      watcher.start();

      watcher.on(RLLWatcherEvent.READY, (launches) => {
        expect(launches).to.have.length(51);
        try {
          scope.done();
          resolve("Success");
        } catch (err) {
          reject("error");
        }
      });

      watcher.on(RLLWatcherEvent.INITIALIZATION_ERROR, (err) => {
        reject(err);
      });
    });

    return assert.isFulfilled(promise);
  });

  it("should emit an initialization error on setup if API calls fail", async () => {
    const response1: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 25,
      limit: 25,
      total: 51,
      last_page: 3,
      result: launches1,
    };
    const response2: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 25,
      limit: 25,
      total: 51,
      last_page: 3,
      result: launches2,
    };
    const response3: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 51,
      last_page: 3,
      result: [launches3[0]],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .reply(200, response1)
      .get("/json/launches")
      .query(new URLSearchParams({ page: "2" }))
      .reply(500, response2);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = client.watch();

    const promise = new Promise((resolve, reject) => {
      watcher.start();

      watcher.on(RLLWatcherEvent.READY, (launches) => {
        watcher.stop();
        reject("error");
      });

      watcher.on(RLLWatcherEvent.INITIALIZATION_ERROR, (err) => {
        try {
          scope.done();
          watcher.stop();
          resolve("success");
        } catch (err) {
          watcher.stop();
          reject(err);
        }
      });
    });

    return assert.isFulfilled(promise);
  });
});
