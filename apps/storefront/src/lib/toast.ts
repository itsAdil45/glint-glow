import toast from "react-hot-toast";
import { ApiError } from "./api";

/**
 * Single place every page calls on a failed request — extracts the real
 * message from an ApiError (now correctly unwrapped in apiFetch itself,
 * see extractErrorMessage there) and shows it as a toast, falling back to
 * a generic message for anything that isn't an ApiError (a network
 * failure, for instance).
 */
export function showApiError(err: unknown, fallback = "Something went wrong. Please try again.") {
  const message = err instanceof ApiError ? err.message : fallback;
  toast.error(message);
  return message;
}

export function showSuccess(message: string) {
  toast.success(message);
}
