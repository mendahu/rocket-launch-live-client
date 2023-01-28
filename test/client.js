const { expect } = require("chai");
const sinon = require("sinon");
const https = require("node:https");

const rllc = require("../dist/index");
const clientGen = rllc.default;

describe("rllc Client", () => {
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    sandbox.restore();
  });

  it("should throw error with no API key", () => {
    expect(clientGen).to.throw("[RLL Client]: RLL Client requires API Key");
  });

  it("should throw error with a non-string API Key", () => {
    expect(() => clientGen(5)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => clientGen(true)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => clientGen(null)).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => clientGen(["api key"])).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
    expect(() => clientGen({ key: "api" })).to.throw(
      "[RLL Client]: RLL Client API Key must be a string"
    );
  });

  it("should throw error with a non-uuid string", () => {
    expect(() => clientGen("")).to.throw(
      "[RLL Client]: RLL Client API Key cannot be an empty string"
    );
    expect(() => clientGen("sdf-sdf-2424-dfs-34243")).to.throw(
      "[RLL Client]: RLL Client API Key appears malformed. RLL Client API Keys are in UUID format."
    );
    expect(() => clientGen("sdsdf-123-sdfsdfsdf-sdfsdfsd-fsdfsdf")).to.throw(
      "[RLL Client]: RLL Client API Key appears malformed. RLL Client API Keys are in UUID format."
    );
  });

  it("should not throw with properly formed uuid", () => {
    clientGen("aac004f6-07ab-4f82-bff2-71d977072c56");
  });

  it("should not throw with random options, but should warn", () => {
    const consoleMock = sandbox.mock(console);

    clientGen("aac004f6-07ab-4f82-bff2-71d977072c56", { banana: true });

    consoleMock
      .expects("warn")
      .once()
      .withArgs(
        '[RLL Client]: RLL Client options do not accept a "banana" property. This property will be ignored.'
      );
  });

  it("should throw if keyInQueryParams is not a boolean", () => {
    expect(() =>
      clientGen("aac004f6-07ab-4f82-bff2-71d977072c56", {
        keyInQueryParams: "banana",
      })
    ).to.throw(
      "[RLL Client]: RLL Client configuration option 'keyInQueryParams' must be a boolean."
    );
  });
});
