import { requestClient } from '#/api/request';

export async function generateChallengeOtpApi(challenge: string) {
  return requestClient.post<{ otp: string }>('/challenge/generate', {
    challenge,
  });
}
