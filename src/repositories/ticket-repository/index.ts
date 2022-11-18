import { prisma } from "@/config";
import { TicketType } from "@prisma/client";

async function findTicketTypes(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

const ticketRepository = { findTicketTypes };

export default ticketRepository;
