import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getPaymentByTicketId, postCreatePayment } from "@/controllers";
import { processPaymentSchema } from "@/schemas";

const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getPaymentByTicketId)
  .post("/process", validateBody(processPaymentSchema), postCreatePayment);

export { paymentsRouter };
