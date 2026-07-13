const apiUrl = import.meta.env.VITE_API_URL;


export async function http<T>(path: string, config: RequestInit): Promise<T> {
  const request = new Request(`${apiUrl}${path}`, config);
  const response = await fetch(request);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}