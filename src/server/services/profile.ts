// src/server/services/profile.ts
import 'server-only';
import { authFetchApi } from '@/lib/authFetchApi';
import { PrivacyStatus, UserStatus } from '@/types/User';

export interface ProfileResponseDto {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  privacy: PrivacyStatus;
}
// Projendeki gerçek tipe göre daraltabilirsin.
export type ProfileDto = ProfileResponseDto;

export async function getProfile(): Promise<ProfileDto> {
  return authFetchApi<ProfileDto>('/users/profile', {
    traceName: 'svc:profile.getProfile',
  });
}

export type UpdateProfileInput = Partial<Pick<ProfileDto, 'name' | 'privacy'>> & {
  // backend’in beklediği alanlar varsa ekleyebilirsin (örn. email, status …)
  [k: string]: unknown;
};

export async function updateProfile(payload: UpdateProfileInput): Promise<ProfileDto> {
  return authFetchApi<ProfileDto>('/users/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    traceName: 'svc:profile.updateProfile',
  });
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  newpasswordConfirm: string;
};

export async function changePassword(payload: ChangePasswordInput): Promise<{ ok: true }> {
  await authFetchApi('/users/profile/password', {
    method: 'PATCH', // backend POST istiyorsa route tarafında POST'u da expose ediyoruz
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    traceName: 'svc:profile.changePassword',
  });
  return { ok: true };
}

export async function deleteProfile(): Promise<{ ok: true }> {
  await authFetchApi('/users/profile', {
    method: 'DELETE',
    traceName: 'svc:profile.deleteProfile',
  });
  return { ok: true };
}

