export const apiKeyValidator = (apiKey: string) => {
  if (apiKey === undefined) {
    throw new Error("RLL Client requires API Key");
  }

  if (typeof apiKey !== "string") {
    throw new Error("RLL Client API Key must be a string");
  }

  if (apiKey === "") {
    throw new Error("RLL Client API Key cannot be an empty string");
  }

  const validator = apiKey.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );

  if (validator === null) {
    throw new Error(
      "RLL Client API Key appears malformed. RLL Client API Keys are in UUID format."
    );
  }
};
