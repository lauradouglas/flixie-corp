import { useEffect, useState } from "react";
import { ApiError, SessionChanged } from "./api";
export function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : error instanceof Error &&
        error.message &&
        !/prisma|sql|fetch|network|token/i.test(error.message)
      ? error.message
      : "Flixie could not load this. Please try again.";
}
export function useLoad<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
) {
  const [attempt, setAttempt] = useState(0),
    [state, setState] = useState<{
      key: string;
      data?: T;
      error: string;
      loading: boolean;
    }>({ key: "", error: "", loading: true });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ key, error: "", loading: true });
    void load(controller.signal)
      .then((data) => {
        if (active) setState({ key, data, error: "", loading: false });
      })
      .catch((error) => {
        if (
          active &&
          !controller.signal.aborted &&
          !(error instanceof SessionChanged)
        )
          setState({ key, error: errorMessage(error), loading: false });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [key, attempt]);
  return {
    ...(state.key === key
      ? state
      : { key, error: "", loading: true, data: undefined }),
    retry: () => setAttempt((n) => n + 1),
  };
}
