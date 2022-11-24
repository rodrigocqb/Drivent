import { forbiddenError, notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Hotel, Room, Ticket, TicketType } from "@prisma/client";

async function checkUserTicketData(userId: number): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  const ticket = await ticketRepository.findTicketByUserId(userId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  return ticket;
}

async function getHotels(userId: number): Promise<Hotel[]> {
  await checkUserTicketData(userId);

  const hotels = await hotelRepository.findHotels();

  return hotels;
}

async function getRoomsByHotelId(userId: number, hotelId: number): Promise<Room[]> {
  await checkUserTicketData(userId);

  const hotel = await hotelRepository.findHotelById(hotelId);

  if (!hotel) {
    throw notFoundError();
  }

  const rooms = await hotelRepository.findRoomsByHotelId(hotelId);

  return rooms;
}

const hotelsService = { getHotels, getRoomsByHotelId };

export default hotelsService;
