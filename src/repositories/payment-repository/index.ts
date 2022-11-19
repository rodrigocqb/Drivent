import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function findPayment(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function createPayment(data: Omit<Payment, "id" | "createdAt" | "updatedAt">) {
  return prisma.payment.create({
    data,
  });
}

const paymentRepository = { findPayment, createPayment };

export default paymentRepository;
