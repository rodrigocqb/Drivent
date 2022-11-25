import { Router } from "express";
import { authenticateToken, validateParams } from "@/middlewares";
import { getHotels, getHotelWithRoomsByHotelId } from "@/controllers";
import { hotelIdParamsSchema } from "@/schemas";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", validateParams(hotelIdParamsSchema), getHotelWithRoomsByHotelId);

export { hotelsRouter };
