import RLLClient from "./Client";

const clientGenerator = (apiKey: string): RLLClient => {
  return new RLLClient(apiKey);
};

export default clientGenerator;
