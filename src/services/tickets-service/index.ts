import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketType, Ticket } from "@prisma/client";

async function getTicketTypes() {
  const ticketTypes: TicketType[] = await ticketRepository.findTicketTypes();
  return ticketTypes;
}

const ticketsService = { getTicketTypes };

export default ticketsService;
