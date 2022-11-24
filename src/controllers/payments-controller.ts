import { requestError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares";
import { PaymentBody } from "@/protocols";
import enrollmentsService from "@/services/enrollments-service";
import paymentsService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId } = req.query;

  try {
    if (!ticketId) {
      throw requestError(httpStatus.BAD_REQUEST, "BadRequestError");
    }

    const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId);
    const payment = await paymentsService.getPaymentByTicketId(enrollment.id, Number(ticketId));

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

export async function postCreatePayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId, cardData } = req.body as PaymentBody;

  try {
    const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId);
    const payment = await paymentsService.createPaymentWithTicketIdAndCardData(enrollment.id, ticketId, cardData);

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}
