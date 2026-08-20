import { QuizQuestion, ApiResponse } from './types/api';

export async function fetchQuizData(): Promise<QuizQuestion[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const projectId = import.meta.env.VITE_PROJECT_ID;

  if (!baseUrl || !projectId) {
    throw new Error('Missing API environment variables (VITE_API_BASE_URL or VITE_PROJECT_ID)');
  }

  const response = await fetch(`${baseUrl}/projects/${projectId}/quiz`);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`Server returned status ${response.status} without JSON body`);
    }

    throw new Error(errorData.error || errorData.message || 'Unknown API Error');
  }

  const json: ApiResponse<QuizQuestion[]> = await response.json();

  if (!json.success) {
    throw new Error(json.message || 'API request was not successful');
  }

  return json.data;
}
