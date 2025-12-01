import { injectable } from 'tsyringe';
import { LessThan, Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { InvitationToken } from '../models/InvitationToken';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import { IInvitationTokenService } from '../interfaces/services/IInvitationTokenService';
import {
  InvitationCreateResponseDto,
  InvitationDetailsResponseDto,
  InvitationAcceptResponseDto,
  InvitationListResponseDto,
} from '../dtos/invitation';

@injectable()
export class InvitationTokenService implements IInvitationTokenService {
  private readonly invitationTokenRepository: Repository<InvitationToken>;
  private readonly userRepository: Repository<User>;

  constructor() {
    this.invitationTokenRepository = AppDataSource.getRepository(InvitationToken);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createTokenForUser(
    userId: string,
    roles: string[],
    expiresInHours: number,
  ): Promise<InvitationCreateResponseDto> {
    if (!userId) {
      throw { status: 401, message: 'Unauthorized' };
    }

    if (!roles?.includes('ADMIN')) {
      throw { status: 403, message: 'Forbidden' };
    }

    const user = await this.userRepository.findOne({ where: { pid: userId } });
    if (!user) {
      throw { status: 401, message: 'Unauthorized' };
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invitationToken = this.invitationTokenRepository.create({
      token,
      createdBy: user,
      expiresAt,
      used: false,
      usedBy: null,
    });

    const savedToken = await this.invitationTokenRepository.save(invitationToken);

    return InvitationCreateResponseDto.fromEntity(savedToken);
  }

  async validateToken(token: string): Promise<InvitationDetailsResponseDto | null> {
    const invitation = await this.invitationTokenRepository.findOne({
      where: { token, used: false },
      relations: ['createdBy', 'usedBy'],
    });

    if (!invitation) {
      return null;
    }

    if (invitation.expiresAt < new Date()) {
      return null;
    }

    return InvitationDetailsResponseDto.fromEntity(invitation);
  }

  async useToken(token: string, usedBy: User): Promise<InvitationAcceptResponseDto | null> {
    const invitation = await this.invitationTokenRepository.findOne({
      where: { token, used: false },
      relations: ['createdBy', 'usedBy'],
    });

    if (!invitation) {
      return null;
    }

    if (invitation.expiresAt < new Date()) {
      return null;
    }

    invitation.used = true;
    invitation.usedBy = usedBy;
    await this.invitationTokenRepository.save(invitation);

    return InvitationAcceptResponseDto.fromEntity(invitation, usedBy);
  }

  async listTokensForAdmin(roles: string[]): Promise<InvitationListResponseDto[]> {
    if (!roles?.includes('ADMIN')) {
      throw { status: 403, message: 'Forbidden' };
    }

    const tokens = await this.invitationTokenRepository.find({
      relations: ['createdBy', 'usedBy'],
    });

    return InvitationListResponseDto.fromEntities(tokens);
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.invitationTokenRepository.delete({
      expiresAt: LessThan(now),
    });
  }
}
