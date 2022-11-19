import { requestError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares";
import enrollmentsService from "@/services/enrollments-service";
import paymentsService from "@/services/payments-service";
import ticketsService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId } = req.query;

  try {
    if (!ticketId) {
      throw requestError(400, "BadRequestError");
    }

    const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId);
    await ticketsService.checkTicketOwnership(enrollment.id, Number(ticketId));
    const payment = await paymentsService.getPaymentByTicketId(Number(ticketId));

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
