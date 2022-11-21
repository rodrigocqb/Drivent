import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getTicketByUser, getTicketTypes, postCreateTicket } from "@/controllers";
import { createTicketSchema } from "@/schemas";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketTypes)
  .get("/", getTicketByUser)
  .post("/", validateBody(createTicketSchema), postCreateTicket);

export { ticketsRouter };
