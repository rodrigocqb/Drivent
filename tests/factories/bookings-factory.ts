import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Room, User } from "@prisma/client";
import { createUser } from "./users-factory";
import { createRoom } from "./hotels-factory";

export async function createBooking(user?: User, room?: Room) {
  const incomingUser = user || (await createUser());
  const incomingRoom = room || (await createRoom());

  return prisma.booking.create({
    data: {
      userId: incomingUser.id,
      roomId: incomingRoom.id,
    },
  });
}
