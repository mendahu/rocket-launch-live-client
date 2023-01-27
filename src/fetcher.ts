export const BASE_URL = "https://fdo.rocketlaunch.live";

export const fetcher = <T>(
  apiKey: string,
  endpoint: string,
  params: URLSearchParams,
  keyInQueryParams: boolean
): Promise<T> => {
  const url = new URL("json/" + endpoint, BASE_URL);
  let headers: HeadersInit | undefined;

  if (keyInQueryParams) {
    params.set("key", apiKey);
  } else {
    headers = { authorization: `Bearer ${apiKey}` };
  }

  params.forEach((v, k) => url.searchParams.set(k, v));

  return fetch(url.href, { headers }).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw res;
    }
  });
};
