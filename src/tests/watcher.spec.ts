import nock from "nock";
import { rllc } from "../index.js";
import {
  RLLEntity,
  RLLQueryConfig,
  RLLResponse,
} from "../types/application.js";
import { launches1, launches2, launches3 } from "./fixtures/launches.js";
import { describe, it, vi, expect, assert } from "vitest";
import Sinon from "sinon";

const wait = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

describe("rllc Watcher", () => {
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
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    client.watch(0.5);

    expect(spy).toHaveBeenCalledWith(
      "[RLL Client]: RLLWatcher does not accept intervals less than 1. Your watcher will default to 5 minute intervals unless corrected."
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

  it("should recursively query the API to fetch all results for initial cache, then send a request every interval", async () => {
    const clock = Sinon.useFakeTimers({ toFake: ["setInterval"] });
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
    const response4: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 1,
      total: 1,
      last_page: 1,
      result: [
        {
          ...launches3[0],
          mission_description: "This mission description has changed",
        },
      ],
    };
    const response5: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 1,
      total: 1,
      last_page: 1,
      result: [launches3[1]],
    };
    const response6: RLLResponse<RLLEntity.Launch[]> = {
      errors: ["Server Error"],
      valid_auth: true,
      count: 1,
      limit: 1,
      total: 1,
      last_page: 1,
      result: [],
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
      .reply(200, response3)
      .get("/json/launches")
      .query((queryObj) => {
        return !!queryObj.modified_since;
      })
      .reply(200, response4)
      .get("/json/launches")
      .query((queryObj) => {
        return !!queryObj.modified_since;
      })
      .reply(200, response5)
      .get("/json/launches")
      .query((queryObj) => {
        return !!queryObj.modified_since;
      })
      .reply(500, response6);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = client.watch(1);

    const readyFake = Sinon.fake();

    watcher.on("ready", (launches) => {
      expect(launches).to.have.length(51);
      readyFake();
    });

    const initErrorFake = Sinon.fake();

    watcher.on("init_error", (err) => {
      initErrorFake();
    });

    const changeFake = Sinon.fake();

    watcher.on("change", (oldLaunch, newLaunch) => {
      assert.isNull(oldLaunch.mission_description);
      assert.isTrue(
        newLaunch.mission_description === "This mission description has changed"
      );
      changeFake();
    });

    const newFake = Sinon.fake();

    watcher.on("new", (launch) => {
      expect(launch).to.deep.equal(launches3[1]);
      newFake();
    });

    const errorFake = Sinon.fake();

    watcher.on("error", (err) => {
      expect(err).to.deep.equal({
        error: "API Call Failed",
        statusCode: 500,
        message:
          "RLLC recieved a response from the server but it did not complete as expected.",
        server_response: response6,
      });
      errorFake();
    });

    const callFake = Sinon.fake();

    watcher.on("call", (err) => {
      callFake();
    });

    watcher.start();

    // events inside the watcher happen asynchronously but are not accessible via a promise, so artificial waits are included in these tests
    await wait(100);

    assert.isTrue(readyFake.calledOnce);
    assert.isFalse(initErrorFake.called);
    assert.isFalse(changeFake.called);
    assert.isFalse(newFake.called);
    assert.isFalse(watcher.launches.has(266));
    assert.isTrue(watcher.launches.has(3203));
    assert.isTrue(watcher.launches.has(529));
    assert.isTrue(watcher.launches.has(3284));

    clock.tick(60000);
    await wait(100);

    assert.isTrue(changeFake.calledOnce);
    assert.isFalse(newFake.called);

    clock.tick(60000);
    await wait(100);

    assert.isTrue(newFake.calledOnce);

    clock.tick(60000);
    await wait(100);

    assert.isTrue(errorFake.calledOnce);
    expect(callFake.getCalls()).to.have.length(6);

    scope.done();

    clock.restore();
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

      watcher.on("ready", (launches) => {
        scope.done();
        reject("error");
      });

      watcher.on("init_error", (err) => {
        try {
          resolve("success");
        } catch (err) {
          reject(err);
        }
      });
    });

    return expect(promise).resolves;
  });
});
