import { prisma } from "@/config";

async function findBookingWithRoomByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    select: { id: true, Room: true },
  });
}

const bookingRepository = { findBookingWithRoomByUserId };

export default bookingRepository;
