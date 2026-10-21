// Cliente HTTP base (Fetch API) com tempo limite e tratamento de erros.
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export async function request<T>(url: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const { timeoutMs = 10000, headers, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...rest,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(`O servidor respondeu com erro ${response.status}.`, response.status);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as Error)?.name === 'AbortError') throw new ApiError('Tempo de conexão esgotado. Verifique sua internet.');
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet.');
  } finally {
    clearTimeout(timer);
  }
}
