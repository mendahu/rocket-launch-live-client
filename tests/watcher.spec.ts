import { expect } from "chai";
import Sinon from "sinon";
import nock from "nock";
import { rllc } from "../src/index";
import { RLLClientOptions, RLLQueryConfig } from "../src/types/application";
import * as utils from "../src/utils";
import "mocha";
import "sinon";

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

    expect(() => client.watch(18n as unknown as number)).to.throw(
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
    // Adding just this one test to ensure the error is thrown through

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    expect(() => client.watch(10, [] as RLLQueryConfig.Launches)).to.throw(
      "Invalid type for query options. Must be an object."
    );
  });
});
