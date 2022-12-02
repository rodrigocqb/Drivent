import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createUser,
  createTicketType,
  createTicket,
  createEnrollmentWithAddress,
  createHotel,
  createRoom,
  createBooking,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user does not have a booking yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking({ user, room });

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when roomId is not present in body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when user does not have an enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const roomId = faker.datatype.number({ min: 1 });

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user does not have a ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const roomId = faker.datatype.number({ min: 1 });

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when ticket is not paid yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.RESERVED);

      const roomId = faker.datatype.number({ min: 1 });

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket type is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = true;
      const ticketType = await createTicketType(isRemote);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const roomId = faker.datatype.number({ min: 1 });

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket type does not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = false;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const roomId = faker.datatype.number({ min: 1 });

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    describe("when user has a paid ticket with the correct type", () => {
      it("should respond with status 403 when user already has a booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        await createBooking({ user, room });

        const response = await server
          .post("/booking")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 400 when roomId is invalid - invalid partition", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

        const roomId = 0;

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 404 when given room does not exist - valid partition", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

        const roomId = faker.datatype.number({ min: 1 });

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId });

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 403 when given room is already full - valid partition", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);

        const otherUser = await createUser();
        const otherUserEnrollment = await createEnrollmentWithAddress(otherUser);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
        await createTicket(otherUserEnrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();

        const capacity = 1;
        const room = await createRoom(hotel.id, capacity);
        await createBooking({ user: otherUser, room });

        const response = await server
          .post("/booking")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 200 and with booking data when everything is ok - valid partition", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);

        const response = await server
          .post("/booking")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: expect.any(Number),
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        });
      });

      it("should insert a new booking in the database when everything is ok - valid partition", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const userEnrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);

        const beforeCount = await prisma.booking.count();

        await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

        const afterCount = await prisma.booking.count();

        expect(beforeCount).toEqual(0);
        expect(afterCount).toEqual(1);
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if bookingId param is not a number", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put("/booking/a").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when roomId is not present in body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when booking id is invalid - invalid partition (bookingId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const roomId = faker.datatype.number({ min: 1 });

      const bookingId = 0;

      const response = await server
        .put(`/booking/${bookingId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when given booking does not exist - valid partition (bookingId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const roomId = faker.datatype.number({ min: 1 });

      const bookingId = faker.datatype.number({ min: 1 });

      const response = await server
        .put(`/booking/${bookingId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 user doesn't own given booking - valid partition (bookingId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const otherUser = await createUser();
      const otherUserEnrollment = await createEnrollmentWithAddress(otherUser);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      await createTicket(otherUserEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const capacity = 1;
      const room = await createRoom(hotel.id, capacity);
      const booking = await createBooking({ user: otherUser, room });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 400 when roomId is invalid - invalid partition (roomId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const roomId = 0;

      const booking = await createBooking({ user });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when given room does not exist - valid partition (roomId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);

      const roomId = faker.datatype.number({ min: 1 });

      const booking = await createBooking({ user });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when given room is already booked by the user - valid partition (roomId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const room = await createRoom(hotel.id);
      const booking = await createBooking({ user, room });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when given room is already full - valid partition (roomId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const otherUser = await createUser();
      const otherUserEnrollment = await createEnrollmentWithAddress(otherUser);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      await createTicket(otherUserEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const capacity = 1;
      const room = await createRoom(hotel.id, capacity);
      await createBooking({ user: otherUser, room });

      const booking = await createBooking({ user });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and with updated booking data when everything is ok - valid partition (roomId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const booking = await createBooking({ user });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });

    it("should update booking in the database when everything is ok - valid partition (roomId)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const userEnrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(userEnrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);

      const booking = await createBooking({ user });

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id });

      const updatedBooking = await prisma.booking.findFirst({ where: { roomId: room.id } });

      expect(response.body.id).toBe(updatedBooking.id);
    });
  });
});
