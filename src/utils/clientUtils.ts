export async function callApi<TIn, TOut>(path: string, body: TIn): Promise<TOut> {
  const response = await fetch(path, {
    method: 'POST',
    body: body instanceof FormData
      ? body
      : JSON.stringify(body),
  });

  return await response.json();
}
