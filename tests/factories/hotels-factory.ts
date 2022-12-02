import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoom(hotelId?: number, capacity?: number) {
  const incomingHotelId = hotelId || (await createHotel()).id;
  const incomingCapacity = capacity || faker.datatype.number({ min: 0, max: 4 });

  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: incomingCapacity,
      hotelId: incomingHotelId,
    },
  });
}
