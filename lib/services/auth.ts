import api from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expires_in_minutes: number;
}

export interface VerifyResetCodeResponse {
  valid: boolean;
  message: string;
}

export const authService = {
  // Login
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/login", data);
    return response.data;
  },

  // Register
  async register(data: RegisterRequest): Promise<any> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<any> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
    return response.data;
  },

  // Verify reset code
  async verifyResetCode(
    data: VerifyResetCodeRequest
  ): Promise<VerifyResetCodeResponse> {
    const response = await api.post<VerifyResetCodeResponse>(
      "/auth/verify-reset-code",
      data
    );
    return response.data;
  },

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<any> {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};

