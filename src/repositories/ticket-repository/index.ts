import { prisma } from "@/config";
import { TicketStatus, TicketType } from "@prisma/client";

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

const ticketRepository = { findTicketTypes, findTicketByEnrollmentId, createTicket };

export default ticketRepository;
