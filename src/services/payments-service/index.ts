import { notFoundError, unauthorizedError } from "@/errors";
import { CardData } from "@/protocols";
import paymentRepository from "@/repositories/payment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Payment, Ticket, TicketType } from "@prisma/client";

async function checkTicketOwnership(
  enrollmentId: number,
  ticketId: number,
): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  const ticket = await ticketRepository.findTicketById(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.enrollmentId !== enrollmentId) {
    throw unauthorizedError();
  }

  return ticket;
}

async function getPaymentByTicketId(enrollmentId: number, ticketId: number): Promise<Payment> {
  await checkTicketOwnership(enrollmentId, ticketId);

  const payment = await paymentRepository.findPayment(ticketId);

  if (!payment) {
    throw notFoundError();
  }

  return payment;
}

async function createPaymentWithTicketIdAndCardData(
  enrollmentId: number,
  ticketId: number,
  cardData: CardData,
): Promise<Payment> {
  const ticket = await checkTicketOwnership(enrollmentId, ticketId);

  const data = {
    ticketId,
    value: ticket.TicketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: String(cardData.number).slice(-4),
  };

  const payment = await paymentRepository.createPayment(data);
  await ticketRepository.updateTicketStatus(ticketId);

  return payment;
}

const paymentsService = { getPaymentByTicketId, createPaymentWithTicketIdAndCardData };

export default paymentsService;
