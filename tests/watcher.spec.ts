import { expect } from "chai";
import Sinon from "sinon";
import nock from "nock";
import { rllc } from "../src/index";
import { RLLClientOptions } from "../src/types/application";
import * as utils from "../src/utils";
import "mocha";
import "sinon";

describe("rllc Watcher", () => {
  // let sandbox: Sinon.SinonSandbox;
  // let spy: Sinon.SinonSpy;

  before(() => {
    // sandbox = Sinon.createSandbox();
  });

  beforeEach(() => {
    // sandbox.restore();
  });

  after(() => {
    // spy.restore();
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
});
