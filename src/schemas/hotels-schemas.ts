import Joi from "joi";

export const hotelIdParamsSchema = Joi.object<{ hotelId: number }>({
  hotelId: Joi.number().integer().required(),
});
