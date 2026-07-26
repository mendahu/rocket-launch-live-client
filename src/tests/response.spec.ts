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

type HasLimit<T> = "limit" extends keyof RLLResponse<T> ? true : false;

describe("RLLResponse limit property", () => {
  it("requires limit on launches responses", () => {
    type _LaunchesHaveLimit = Expect<Equal<HasLimit<RLLEntity.Launch[]>, true>>;
    type _LimitIsRequiredNumber = Expect<
      Equal<RLLResponse<RLLEntity.Launch[]>["limit"], number>
    >;

    const response: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 25,
      limit: 25,
      total: 51,
      last_page: 3,
      result: launches1,
    };

    expect(response.limit).toBe(25);
  });

  it("omits limit from all other endpoint responses", () => {
    type _CompaniesHaveNoLimit = Expect<
      Equal<HasLimit<RLLEntity.Company[]>, false>
    >;
    type _LocationsHaveNoLimit = Expect<
      Equal<HasLimit<RLLEntity.Location[]>, false>
    >;
    type _MissionsHaveNoLimit = Expect<
      Equal<HasLimit<RLLEntity.Mission[]>, false>
    >;
    type _PadsHaveNoLimit = Expect<Equal<HasLimit<RLLEntity.Pad[]>, false>>;
    type _TagsHaveNoLimit = Expect<Equal<HasLimit<RLLEntity.Tag[]>, false>>;
    type _VehiclesHaveNoLimit = Expect<
      Equal<HasLimit<RLLEntity.Vehicle[]>, false>
    >;

    const response: RLLResponse<RLLEntity.Company[]> = {
      valid_auth: true,
      count: 25,
      total: 91,
      last_page: 4,
      result: companies1,
    };

    expect(response).not.toHaveProperty("limit");
  });

  it("rejects a launches response that omits limit", () => {
    // @ts-expect-error limit is required on launches responses
    const response: RLLResponse<RLLEntity.Launch[]> = {
      valid_auth: true,
      count: 25,
      total: 51,
      last_page: 3,
      result: launches1,
    };

    expect(response.result).toBe(launches1);
  });

  it("rejects a limit on non-launches responses", () => {
    const response: RLLResponse<RLLEntity.Company[]> = {
      valid_auth: true,
      count: 25,
      // @ts-expect-error limit is only present on launches responses
      limit: 25,
      total: 91,
      last_page: 4,
      result: companies1,
    };

    expect(response.result).toBe(companies1);
  });

  it("exposes limit on the launches client method", async () => {
    const scope = nock("https://fdo.rocketlaunch.live")
      .get("/json/launches")
      .reply(200, {
        valid_auth: true,
        count: 25,
        limit: 25,
        total: 51,
        last_page: 3,
        result: launches1,
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const response = await client.launches();

    const limit: number = response.limit;
    expect(limit).toBe(25);

    scope.done();
  });

  it("does not expose limit on other client methods", async () => {
    const scope = nock("https://fdo.rocketlaunch.live")
      .get("/json/companies")
      .reply(200, {
        valid_auth: true,
        count: 25,
        total: 91,
        last_page: 4,
        result: companies1,
      });

    const client = rllc("aac004f6-07ab-4f82-bff2-71d977072c56");
    const response = await client.companies();

    // @ts-expect-error limit is not available on companies responses
    const limit = response.limit;
    expect(limit).toBeUndefined();

    scope.done();
  });
});
