const { expect } = require("chai");
const sinon = require("sinon");

const rllc = require("../dist/index");
const clientGen = rllc.default;

describe("companies method", () => {
  let client;

  beforeEach(() => {
    client = clientGen("aac004f6-07ab-4f82-bff2-71d977072c56");
  });

  it("should execute a query with no args", () => {});
});
