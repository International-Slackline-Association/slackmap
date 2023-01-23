export interface OrganizationMembersResponse {
  userId: string;
  name: string;
  surname: string;
  email: string;
  isPendingApproval: boolean;
  joinedAt: string;
  profilePictureUrl: string;
}
