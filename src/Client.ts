import { RLLClient, RLLEntity, RLLQueryConfig } from "./application_types";

class Client {
  private apiKey: string;
  private config = {
    clientSide: false,
  };

  constructor(apiKey: string, options: RLLClient.Options) {
    this.apiKey = apiKey;
    if (options.clientSide) {
      this.config.clientSide = options.clientSide;
    }
  }

  public companies(
    options?: RLLQueryConfig.Companies
  ): Promise<RLLEntity.Company[] | RLLEntity.Company> {
    return Promise.resolve([]);
  }
  public launches(
    options?: RLLQueryConfig.Launches
  ): Promise<RLLEntity.Launch[] | RLLEntity.Launch> {
    return Promise.resolve([]);
  }
  public locations(
    options?: RLLQueryConfig.Locations
  ): Promise<RLLEntity.Location[] | RLLEntity.Location> {
    return Promise.resolve([]);
  }
  public missions(
    options?: RLLQueryConfig.Missions
  ): Promise<RLLEntity.Mission[] | RLLEntity.Mission> {
    return Promise.resolve([]);
  }
  public pads(
    options?: RLLQueryConfig.Pads
  ): Promise<RLLEntity.Pad[] | RLLEntity.Pad> {
    return Promise.resolve([]);
  }
  public tags(
    options?: RLLQueryConfig.Tags
  ): Promise<RLLEntity.Tag[] | RLLEntity.Tag> {
    return Promise.resolve([]);
  }
  public vehicles(
    options?: RLLQueryConfig.Vehicles
  ): Promise<RLLEntity.Vehicle[] | RLLEntity.Vehicle> {
    return Promise.resolve([]);
  }
}

export default Client;
