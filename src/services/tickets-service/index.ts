import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketType, Ticket } from "@prisma/client";

async function getTicketTypes(): Promise<TicketType[]> {
  const ticketTypes = await ticketRepository.findTicketTypes();

  return ticketTypes;
}

async function getTicketByEnrollment(enrollmentId: number): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollmentId);

  if (!ticket) {
    throw notFoundError();
  }

  return ticket;
}

async function createTicketWithEnrollmentAndTicketType(
  enrollmentId: number,
  ticketTypeId: number,
): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  const ticket = await ticketRepository.createTicket(enrollmentId, ticketTypeId);

  return ticket;
}

const ticketsService = { getTicketTypes, getTicketByEnrollment, createTicketWithEnrollmentAndTicketType };

export default ticketsService;
