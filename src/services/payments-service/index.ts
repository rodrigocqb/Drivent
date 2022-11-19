import { notFoundError } from "@/errors";
import paymentRepository from "@/repositories/payment-repository";
import { Payment } from "@prisma/client";

async function getPaymentByTicketId(ticketId: number): Promise<Payment> {
  const payment = await paymentRepository.findPayment(ticketId);

  if (!payment) {
    throw notFoundError();
  }

  return payment;
}

const paymentsService = { getPaymentByTicketId };

export default paymentsService;
