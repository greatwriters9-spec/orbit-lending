import { isUsCityInState } from "@/lib/auth/us-cities";
import { US_STATES } from "@/lib/auth/us-states";

function getStateName(stateCode: string) {
  return US_STATES.find((state) => state.code === stateCode)?.name ?? stateCode;
}

export function validateCityForState(
  stateCode: string,
  cityName: string,
): string | null {
  if (!isUsCityInState(stateCode, cityName)) {
    return `Enter a valid city in ${getStateName(stateCode)} or choose one from the suggestions.`;
  }

  return null;
}
