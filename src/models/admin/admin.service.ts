import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const allAdmins = await this.prisma.admin.findMany();
      if (!allAdmins) {
        return [];
      }
      return allAdmins;
    } catch (error) {
      console.error('Error finding all admins');
      throw error;
    }
  }
}
