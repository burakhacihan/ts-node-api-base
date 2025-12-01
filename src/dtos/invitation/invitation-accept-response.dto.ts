export class InvitationAcceptResponseDto {
  id: string;
  status: string;
  acceptedAt: Date;
  acceptedBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  static fromEntity(invitation: any, acceptedBy: any): InvitationAcceptResponseDto {
    return {
      id: invitation.id,
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedBy: {
        id: acceptedBy.id,
        email: acceptedBy.email,
        firstName: acceptedBy.firstName,
        lastName: acceptedBy.lastName,
      },
    };
  }
}
