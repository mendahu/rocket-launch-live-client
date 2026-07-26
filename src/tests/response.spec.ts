import nock from "nock";
import { rllc } from "../index.js";
import { RLLEntity, RLLResponse } from "../types/application.js";
import { describe, it, expect } from "vitest";
import { launches1 } from "./fixtures/launches.js";
import { companies1 } from "./fixtures/companies.js";

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false;

type Expect<T extends true> = T;

describe("RLLResponse limit property", () => {
  it("requires limit on all endpoint responses", () => {
    type _LaunchesLimit = Expect<
      Equal<RLLResponse<RLLEntity.Launch[]>["limit"], number>
    >;
    type _CompaniesLimit = Expect<
      Equal<RLLResponse<RLLEntity.Company[]>["limit"], number>
    >;
    type _LocationsLimit = Expect<
      Equal<RLLResponse<RLLEntity.Location[]>["limit"], number>
    >;
    type _MissionsLimit = Expect<
      Equal<RLLResponse<RLLEntity.Mission[]>["limit"], number>
    >;
    type _PadsLimit = Expect<
      Equal<RLLResponse<RLLEntity.Pad[]>["limit"], number>
    >;
    type _TagsLimit = Expect<
      Equal<RLLResponse<RLLEntity.Tag[]>["limit"], number>
    >;
    type _VehiclesLimit = Expect<
      Equal<RLLResponse<RLLEntity.Vehicle[]>["limit"], number>
    >;

    const response: RLLResponse<RLLEntity.Company[]> = {
      valid_auth: true,
      count: 25,
      limit: 25,
      total: 91,
      last_page: 4,
      result: companies1,
    };

    expect(response.limit).toBe(25);
  });

  it("rejects a response that omits limit", () => {
    // @ts-expect-error limit is required on all responses
    const response: RLLResponse<RLLEntity.Company[]> = {
      valid_auth: true,
      count: 25,
      total: 91,
      last_page: 4,
      result: companies1,
    };

    expect(response.result).toBe(companies1);
  });

  it("exposes limit on client methods", async () => {
    const launchesScope = nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .reply(200, {
        valid_auth: true,
        count: 25,
        limit: 25,
        total: 51,
        last_page: 3,
        result: launches1,
      });

    const companiesScope = nock("https://fdo.rocketlaunch.live")
      .get("/json/companies")
      .reply(200, {
        valid_auth: true,
        count: 25,
        limit: 25,
        total: 91,
        last_page: 4,
        result: companies1,
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");

    const launches = await client.launches();
    const launchesLimit: number = launches.limit;
    expect(launchesLimit).toBe(25);

    const companies = await client.companies();
    const companiesLimit: number = companies.limit;
    expect(companiesLimit).toBe(25);

    launchesScope.done();
    companiesScope.done();
  });
});
