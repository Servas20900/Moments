import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateExperienceInput {
  titulo: string;
  imagenUrl?: string;
}

export interface UpdateExperienceInput extends Partial<CreateExperienceInput> {}

// Módulo temporalmente deshabilitado - no hay modelo equivalente en el nuevo schema
@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return [];
  }

  async create(body: CreateExperienceInput) {
    throw new NotFoundException('Experiences module is temporarily disabled');
  }

  async update(id: string, body: UpdateExperienceInput) {
    throw new NotFoundException('Experiences module is temporarily disabled');
  }

  async delete(id: string) {
    throw new NotFoundException('Experiences module is temporarily disabled');
  }

  private toResponse(x: any) {
    return {
      id: x.id,
      titulo: x.title,
      imagenUrl: x.imageUrl,
      isActive: x.isActive,
    };
  }
}