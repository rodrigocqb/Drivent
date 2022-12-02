import { forbiddenError, notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Booking, Room } from "@prisma/client";

async function getBookingWithRoomByUserId(userId: number): Promise<{
  id: number;
  Room: Room;
}> {
  const bookingWithRoom = await bookingRepository.findBookingWithRoomByUserId(userId);

  if (!bookingWithRoom) {
    throw notFoundError();
  }

  return bookingWithRoom;
}

async function checkRoomData(roomId: number): Promise<
  Room & {
    Booking: Booking[];
  }
> {
  const roomWithBookings = await bookingRepository.findRoomWithBookingsById(roomId);

  if (!roomWithBookings) {
    throw notFoundError();
  }

  if (roomWithBookings.capacity <= roomWithBookings.Booking.length) {
    throw forbiddenError();
  }

  return roomWithBookings;
}

async function createBookingWithUserId(
  userId: number,
  roomId: number,
): Promise<{
  id: number;
  Room: Room;
}> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }
  if (ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  const existingBooking = await bookingRepository.findBookingWithRoomByUserId(userId);
  if (existingBooking) {
    throw forbiddenError();
  }

  await checkRoomData(roomId);

  const booking = await bookingRepository.createBookingWithUserIdAndRoomId(userId, roomId);
  return booking;
}

const bookingsService = { getBookingWithRoomByUserId, createBookingWithUserId };

export default bookingsService;
