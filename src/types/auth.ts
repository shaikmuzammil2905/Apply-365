export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string; // Stored securely
  city?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface CustomerSession {
  token: string;
  customer: CustomerUser;
  expiresAt: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: CustomerUser;
  token?: string;
}
