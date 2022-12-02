import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Room, User } from "@prisma/client";
import { createUser } from "./users-factory";
import { createRoom } from "./hotels-factory";

export async function createBooking({ user, room }: BookingParams) {
  const incomingUser = user || (await createUser());
  const incomingRoom = room || (await createRoom());

  return prisma.booking.create({
    data: {
      userId: incomingUser.id,
      roomId: incomingRoom.id,
    },
  });
}

type BookingParams = {
  user?: User;
  room?: Room;
};
