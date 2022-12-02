import { prisma } from "@/config";

async function findBookingWithRoomByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    select: { id: true, Room: true },
  });
}

async function findRoomWithBookingsById(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId },
    include: {
      Booking: true,
    },
  });
}

async function createBookingWithUserIdAndRoomId(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

const bookingRepository = { findBookingWithRoomByUserId, findRoomWithBookingsById, createBookingWithUserIdAndRoomId };

export default bookingRepository;
