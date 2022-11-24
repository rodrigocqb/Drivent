import { forbiddenError, notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Hotel } from "@prisma/client";

async function getHotels(userId: number): Promise<Hotel[]> {
  const ticket = await ticketRepository.findTicketByUserId(userId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const hotels = await hotelRepository.findHotels();

  return hotels;
}

const hotelsService = { getHotels };

export default hotelsService;
