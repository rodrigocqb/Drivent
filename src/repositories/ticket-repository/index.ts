import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

async function findTicketTypes() {
  return prisma.ticketType.findMany();
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
  return prisma.ticket.create({
    data: {
      ticketTypeId,
      enrollmentId,
      status: TicketStatus.RESERVED,
    },
    include: {
      TicketType: true,
    },
  });
}

async function findTicketById(id: number) {
  return prisma.ticket.findFirst({
    where: {
      id,
    },
    include: {
      TicketType: true,
    },
  });
}

async function updateTicketStatus(id: number) {
  return prisma.ticket.update({
    where: {
      id,
    },
    data: {
      status: TicketStatus.PAID,
    },
  });
}

const ticketRepository = {
  findTicketTypes,
  findTicketByEnrollmentId,
  createTicket,
  findTicketById,
  updateTicketStatus,
};

export default ticketRepository;
