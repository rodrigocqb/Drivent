import { prisma } from "@/config";

async function findPayment(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

const paymentRepository = { findPayment };

export default paymentRepository;
