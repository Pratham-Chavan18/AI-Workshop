import { prisma } from '../lib/prisma';

export interface CollegeResponseItem {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export async function searchColleges(query: string, limit = 20): Promise<CollegeResponseItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }

  // Strip punctuation for normalized comparison
  const sanitized = trimmed.replace(/[^a-z0-9]/g, '');

  const colleges = await prisma.college.findMany({
    where: {
      OR: [
        { nameNormalized: { contains: sanitized } },
        { name: { contains: trimmed, mode: 'insensitive' } },
        { city: { contains: trimmed, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
    },
    orderBy: {
      name: 'asc',
    },
    take: limit,
  });

  return colleges;
}

export async function getCollegeById(id: string): Promise<CollegeResponseItem | null> {
  return prisma.college.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
    },
  });
}
