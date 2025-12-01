export class InvitationListResponseDto {
  id: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  usedBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  static fromEntity(invitation: any): InvitationListResponseDto {
    return {
      id: invitation.id,
      status: invitation.used ? 'used' : invitation.expiresAt < new Date() ? 'expired' : 'active',
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      createdBy: {
        id: invitation.createdBy.id,
        email: invitation.createdBy.email,
        firstName: invitation.createdBy.firstName,
        lastName: invitation.createdBy.lastName,
      },
      usedBy: invitation.usedBy
        ? {
            id: invitation.usedBy.id,
            email: invitation.usedBy.email,
            firstName: invitation.usedBy.firstName,
            lastName: invitation.usedBy.lastName,
          }
        : undefined,
    };
  }

  static fromEntities(invitations: any[]): InvitationListResponseDto[] {
    return invitations.map((invitation) => InvitationListResponseDto.fromEntity(invitation));
  }
}
