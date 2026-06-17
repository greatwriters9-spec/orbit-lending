const STORAGE_PREFIX = "orbitHasSeenQualificationResult";

export function getQualificationResultStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function hasSeenQualificationResult(userId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    localStorage.getItem(getQualificationResultStorageKey(userId)) === "true"
  );
}

export function markQualificationResultSeen(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getQualificationResultStorageKey(userId), "true");
}
