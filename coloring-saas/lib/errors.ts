// An error whose message is safe and friendly to show to the user.
export class UserFacingError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "UserFacingError";
    this.code = code;
    this.status = status;
  }
}

export type ApiErrorBody = { error: { code: string; message: string } };

export const GENERIC_ERROR_MESSAGE =
  "Something went wrong on our side. Your credit was not used. Please try again in a minute.";
