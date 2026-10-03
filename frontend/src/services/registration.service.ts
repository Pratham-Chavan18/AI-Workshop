import { api } from '@/lib/api';
import { College, RegistrationInput, RegistrationSuccess } from '@/types/registration';

export async function searchColleges(query: string): Promise<College[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }
  const res = await api.get<{ items: College[] }>(`/colleges?search=${encodeURIComponent(trimmed)}`);
  return res.data.items || [];
}

export async function registerStudent(input: RegistrationInput): Promise<{ user: RegistrationSuccess }> {
  const res = await api.post<{ success: boolean; user: RegistrationSuccess }>('/registrations', input);
  return res.data;
}
