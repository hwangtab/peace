export async function fetchLocalData<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`Failed to fetch ${path}: ${response.status}`);
      return [];
    }
    const text = await response.text();
    try {
      return JSON.parse(text) as T[];
    } catch (parseError) {
      console.error(`JSON parse error for ${path}:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return [];
  }
}
