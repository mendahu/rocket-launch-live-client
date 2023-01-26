import { RLLClient, RLLEntities } from "./types";

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

  public companies(): Promise<RLLEntities.Company[] | RLLEntities.Company> {
    return Promise.resolve([]);
  }
  public launches(): Promise<RLLEntities.Launch[] | RLLEntities.Launch> {
    return Promise.resolve([]);
  }
  public locations(): Promise<RLLEntities.Location[] | RLLEntities.Location> {
    return Promise.resolve([]);
  }
  public missions(): Promise<RLLEntities.Mission[] | RLLEntities.Mission> {
    return Promise.resolve([]);
  }
  public pads(): Promise<RLLEntities.Pad[] | RLLEntities.Pad> {
    return Promise.resolve([]);
  }
  public tags(): Promise<RLLEntities.Tag[] | RLLEntities.Tag> {
    return Promise.resolve([]);
  }
  public vehicles(): Promise<RLLEntities.Vehicle[] | RLLEntities.Vehicle> {
    return Promise.resolve([]);
  }
}

export default Client;
