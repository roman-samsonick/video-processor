export async function callApi<TIn, TOut>(path: string, body: TIn): Promise<TOut> {
  const response = await fetch(path, {
    method: 'POST',
    body: body instanceof FormData
      ? body
      : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}
