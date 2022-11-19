import { prisma } from "@/config";
import { TicketType } from "@prisma/client";

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

const ticketRepository = { findTicketTypes, findTicketByEnrollmentId };

export default ticketRepository;
