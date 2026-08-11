import type { AIRequestState } from '../types';

export interface RequestStateStatus {
  state: AIRequestState;
  userFacingText: string;
  isBusy: boolean;
}

export function getRequestStateStatus(state: AIRequestState): RequestStateStatus {
  switch (state) {
    case 'thinking':
      return { state, userFacingText: 'Ciel is analyzing context...', isBusy: true };
    case 'generating':
      return { state, userFacingText: 'Ciel is formulating response...', isBusy: true };
    case 'repairing':
      return { state, userFacingText: 'Ciel is refining response format...', isBusy: true };
    case 'fallback':
      return { state, userFacingText: 'Executing local Ciel standby engine...', isBusy: true };
    case 'completed':
      return { state, userFacingText: 'State synchronized.', isBusy: false };
    case 'error':
      return { state, userFacingText: 'Connection issue. Preserving DB state.', isBusy: false };
    case 'idle':
    default:
      return { state: 'idle', userFacingText: '', isBusy: false };
  }
}
