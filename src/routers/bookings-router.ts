import { Router } from "express";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { bookingBodySchema, bookingParamsSchema } from "@/schemas";
import { getBookingWithRoomByUserId, postCreateBooking, putUpdateBooking } from "@/controllers";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookingWithRoomByUserId)
  .post("/", validateBody(bookingBodySchema), postCreateBooking)
  .put("/:bookingId", validateParams(bookingParamsSchema), validateBody(bookingBodySchema), putUpdateBooking);

export { bookingsRouter };
