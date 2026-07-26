import nock from "nock";
import { rllc } from "../index.js";
import { watch } from "../watcher/index.js";
import { RLLWatcher } from "../watcher/Watcher.js";
import {
  RLLEntity,
  RLLQueryConfig,
  RLLResponse,
} from "../types/application.js";
import { launches1, launches2, launches3 } from "./fixtures/launches.js";
import { formatToRLLISODate } from "../utils.js";
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

    expect(() => watch(client, "banana" as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => watch(client, [] as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => watch(client, {} as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => watch(client, (() => 5) as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => watch(client, false as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => watch(client, BigInt(5) as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );

    expect(() => watch(client, Symbol() as unknown as number)).to.throw(
      "[RLL Client]: RLLWatcher interval must be a number."
    );
  });

  it("should not throw if interval is a number or parseable number", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    watch(client, "5");
    watch(client, 5);
    watch(client, 5.5);
  });

  it("should warn if interval is a number less than 1", () => {
    const spy = vi.spyOn(console, "warn").mockImplementationOnce(() => {});

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    watch(client, 0.5);

    expect(spy).toHaveBeenCalledWith(
      "[RLL Client]: RLLWatcher does not accept intervals less than 1. Your watcher will default to 5 minute intervals unless corrected."
    );
  });

  it("should throw if interval is 0", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => watch(client, 0)).to.throw(
      "RLLWatcher interval cannot be a negative number or zero. Watcher intervals should be greater than or equal to 1 minute."
    );
  });

  it("should throw if interval is a negative number", () => {
    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => watch(client, -1)).to.throw(
      "RLLWatcher interval cannot be a negative number or zero. Watcher intervals should be greater than or equal to 1 minute."
    );
  });

  it("should throw if malformed search params are submitted", () => {
    // Not testing every possible parameter input here as it is well covered in the launches endpoint
    // This uses the same validator function under the hood
    // Adding just this one test to ensure the error is thrown through

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => watch(client, 10, [] as RLLQueryConfig.Launches)).to.throw(
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
    const watcher = watch(client, 1);

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
    assert.isTrue(watcher.launches.has(launches1[0].id));
    assert.isTrue(watcher.launches.has(529));
    assert.isTrue(watcher.launches.has(launches3[0].id));

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
    const watcher = watch(client);

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

  it("should fetch initial cache pages with bounded concurrency", async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    const pageBody = (
      result: RLLEntity.Launch[],
      last_page: number
    ): RLLResponse<RLLEntity.Launch[]> => ({
      valid_auth: true,
      count: result.length,
      limit: 25,
      total: 51,
      last_page,
      result,
    });

    const fetcher = async (params: URLSearchParams) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await wait(60);
      inFlight -= 1;

      const page = Number(params.get("page") ?? "1");
      if (page === 1) {
        return pageBody(launches1, 3);
      }
      if (page === 2) {
        return pageBody(launches2, 3);
      }
      return pageBody([launches3[0]], 3);
    };

    const watcher = new RLLWatcher(fetcher, 5);

    await new Promise<void>((resolve, reject) => {
      watcher.on("ready", (launches) => {
        try {
          expect(launches).to.have.length(51);
          // After page 1, pages 2 and 3 should overlap under concurrency 3.
          expect(maxInFlight).to.be.at.least(2);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      watcher.on("init_error", reject);
      watcher.start();
    });

    watcher.stop();
  });

  it("should ignore a caller-supplied page option and start the cache at page 1", async () => {
    const readyResponse: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 1,
      last_page: 1,
      result: [launches1[0]],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .query((query) => query.page === undefined)
      .reply(200, readyResponse);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = watch(client, 5, { page: 5 });

    const readyFake = Sinon.fake();
    watcher.on("ready", () => {
      readyFake();
    });

    watcher.start();
    await wait(100);

    assert.isTrue(readyFake.calledOnce);
    watcher.stop();
    scope.done();
  });

  it("should advance modified_since from poll start time, not completion", async () => {
    const clock = Sinon.useFakeTimers({ toFake: ["setInterval"] });

    const readyResponse: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 1,
      last_page: 1,
      result: [launches1[0]],
    };
    const emptyPoll: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 0,
      limit: 25,
      total: 0,
      last_page: 1,
      result: [],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .reply(200, readyResponse)
      .get("/json/launches")
      .query((queryObj) => !!queryObj.modified_since)
      .delay(2100)
      .reply(200, emptyPoll)
      .get("/json/launches")
      .query((queryObj) => !!queryObj.modified_since)
      .reply(200, emptyPoll);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = watch(client, 1);

    const pollModifiedSince: string[] = [];
    let firstPollStartMs: number | undefined;

    watcher.on("call", (params) => {
      const modifiedSince = params.get("modified_since");
      if (!modifiedSince) {
        return;
      }
      if (firstPollStartMs === undefined) {
        firstPollStartMs = Date.now();
      }
      pollModifiedSince.push(modifiedSince);
    });

    watcher.start();
    await wait(100);

    clock.tick(60000);
    await wait(50);
    assert.isDefined(firstPollStartMs);

    const expectedFromStart = formatToRLLISODate(new Date(firstPollStartMs!));
    const completionStamp = formatToRLLISODate(
      new Date(firstPollStartMs! + 2100)
    );
    // Delay spans a second boundary so a completion-based cursor would differ.
    expect(expectedFromStart).to.not.equal(completionStamp);

    await wait(2200);
    clock.tick(60000);
    await wait(100);

    expect(pollModifiedSince).to.have.length(2);
    expect(pollModifiedSince[1]).to.equal(expectedFromStart);

    watcher.stop();
    scope.done();
    clock.restore();
  });

  it("should skip interval ticks while a previous poll is still in flight", async () => {
    const clock = Sinon.useFakeTimers({ toFake: ["setInterval"] });

    const readyResponse: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 1,
      last_page: 1,
      result: [launches1[0]],
    };
    const emptyPoll: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 0,
      limit: 25,
      total: 0,
      last_page: 1,
      result: [],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .reply(200, readyResponse)
      .get("/json/launches")
      .query((queryObj) => !!queryObj.modified_since)
      .delay(300)
      .reply(200, emptyPoll)
      .get("/json/launches")
      .query((queryObj) => !!queryObj.modified_since)
      .reply(200, emptyPoll);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = watch(client, 1);

    const callFake = Sinon.fake();
    watcher.on("call", () => {
      callFake();
    });

    const readyFake = Sinon.fake();
    watcher.on("ready", () => {
      readyFake();
    });

    watcher.start();
    await wait(100);
    assert.isTrue(readyFake.calledOnce);
    expect(callFake.getCalls()).to.have.length(1);

    // First poll starts and stays in flight for 300ms.
    clock.tick(60000);
    await wait(50);
    expect(callFake.getCalls()).to.have.length(2);

    // Another interval elapses before the first poll finishes — must be skipped.
    clock.tick(60000);
    await wait(50);
    expect(callFake.getCalls()).to.have.length(2);

    // Let the in-flight poll complete, then the next tick should run normally.
    await wait(300);
    clock.tick(60000);
    await wait(100);
    expect(callFake.getCalls()).to.have.length(3);

    scope.done();
    clock.restore();
  });

  it("should ignore repeated start() calls while already running", async () => {
    const readyResponse: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 1,
      last_page: 1,
      result: [launches1[0]],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .reply(200, readyResponse);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = watch(client, 1);

    const readyFake = Sinon.fake();
    const callFake = Sinon.fake();
    watcher.on("ready", () => {
      readyFake();
    });
    watcher.on("call", () => {
      callFake();
    });

    watcher.start();
    watcher.start();
    watcher.start();

    await wait(100);

    assert.isTrue(readyFake.calledOnce);
    expect(callFake.getCalls()).to.have.length(1);

    watcher.stop();
    scope.done();
  });

  it("should allow start() again after stop()", async () => {
    const readyResponse: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 1,
      limit: 25,
      total: 1,
      last_page: 1,
      result: [launches1[0]],
    };

    const scope = nock("https://fdo.rocketlaunch.live", {
      reqheaders: {
        authorization: "Bearer aac004f6-07ab-4f82-bff2-71d977072c56",
      },
    })
      .get("/json/launches")
      .times(2)
      .reply(200, readyResponse);

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const watcher = watch(client, 1);

    const readyFake = Sinon.fake();
    watcher.on("ready", () => {
      readyFake();
    });

    watcher.start();
    await wait(100);
    assert.isTrue(readyFake.calledOnce);

    watcher.stop();
    watcher.start();
    await wait(100);
    assert.isTrue(readyFake.calledTwice);

    watcher.stop();
    scope.done();
  });
});
