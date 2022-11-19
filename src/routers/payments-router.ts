import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getPaymentByTicketId, postCreatePayment } from "@/controllers";

const paymentsRouter = Router();

paymentsRouter.all("/*", authenticateToken).get("/", getPaymentByTicketId).post("/process", postCreatePayment);

export { paymentsRouter };
