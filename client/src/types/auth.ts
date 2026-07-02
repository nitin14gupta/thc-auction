export type User = {
  id: string;
  name: string;
  email: string;
};

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export type MessageResponse = {
  message: string;
};

export type VerifyOtpResponse = {
  reset_token: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
