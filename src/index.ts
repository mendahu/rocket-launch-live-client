import RLLClient from "./Client";
import { RLLClientOptions } from "./types/application";

const clientGenerator = (
  apiKey: string,
  options?: RLLClientOptions
): RLLClient => {
  return new RLLClient(apiKey, options);
};

export default clientGenerator;
