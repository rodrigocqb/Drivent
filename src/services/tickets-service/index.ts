import { notFoundError, unauthorizedError } from "@/errors";
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

async function checkTicketOwnership(enrollmentId: number, ticketId: number): Promise<Ticket> {
  const ticket = await ticketRepository.findTicketById(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.enrollmentId !== enrollmentId) {
    throw unauthorizedError();
  }

  return ticket;
}

const ticketsService = {
  getTicketTypes,
  getTicketByEnrollment,
  createTicketWithEnrollmentAndTicketType,
  checkTicketOwnership,
};

export default ticketsService;
