import { forbiddenError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Address, Enrollment, Hotel, Room, Ticket, TicketType } from "@prisma/client";

async function checkUserTicketData(enrollmentId: number): Promise<
  Ticket & {
    TicketType: TicketType;
  }
> {
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollmentId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  return ticket;
}

async function checkUserEnrollmentData(userId: number): Promise<
  Enrollment & {
    Address: Address[];
  }
> {
  const enrollmentWithAddress = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress) {
    throw notFoundError();
  }

  return enrollmentWithAddress;
}

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollmentWithAddress = await checkUserEnrollmentData(userId);
  await checkUserTicketData(enrollmentWithAddress.id);

  const hotels = await hotelRepository.findHotels();

  return hotels;
}

async function getHotelWithRoomsByHotelId(
  userId: number,
  hotelId: number,
): Promise<
  Hotel & {
    Rooms: Room[];
  }
> {
  const enrollmentWithAddress = await checkUserEnrollmentData(userId);
  await checkUserTicketData(enrollmentWithAddress.id);

  const hotelWithRooms = await hotelRepository.findHotelWithRoomsById(hotelId);

  if (!hotelWithRooms) {
    throw notFoundError();
  }

  return hotelWithRooms;
}

const hotelsService = { getHotels, getHotelWithRoomsByHotelId };

export default hotelsService;
