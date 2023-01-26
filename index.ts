import Client from "./src/Client";

const clientGenerator = (apiKey: string) => {
  return new Client(apiKey);
};

export default clientGenerator;
