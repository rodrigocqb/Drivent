import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function getBookingWithRoomByUserId(userId: number) {
  const booking = await bookingRepository.findBookingWithRoomByUserId(userId);

  if (!booking) {
    throw notFoundError();
  }

  return booking;
}

const bookingsService = { getBookingWithRoomByUserId };

export default bookingsService;
