export class InvitationCreateResponseDto {
  id: string;
  expiresAt: Date;
  createdAt: Date;
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  static fromEntity(invitation: any): InvitationCreateResponseDto {
    return {
      id: invitation.id,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      createdBy: {
        id: invitation.createdBy.id,
        email: invitation.createdBy.email,
        firstName: invitation.createdBy.firstName,
        lastName: invitation.createdBy.lastName,
      },
    };
  }
}
