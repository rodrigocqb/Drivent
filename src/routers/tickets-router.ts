import { Router } from "express";
import { getTicketByUser, getTicketTypes } from "@/controllers";
import { authenticateToken } from "@/middlewares";

const ticketsRouter = Router();

ticketsRouter.all("/*", authenticateToken).get("/types", getTicketTypes).get("/", getTicketByUser);

export { ticketsRouter };
