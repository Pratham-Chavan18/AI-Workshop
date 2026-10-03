export interface College {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
}

export interface RegistrationInput {
  fullName: string;
  email: string;
  phone?: string;
  collegeId: string;
  graduationYear: number;
  referralCode?: string;
  source?: string;
}

export interface RegistrationSuccess {
  id: string;
  fullName: string;
  referralCode: string;
  referralUrl: string;
}
