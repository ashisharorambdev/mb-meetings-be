const Joi = require("joi");

const validateRoom = (room) => {
  const schema = Joi.object({
    roomName: Joi.string().required(),
    roomId: Joi.number().required(),
    addedBy: Joi.number().required().unsafe(),
    roomImage: Joi.string().allow(""),
  });
  return schema.validate(room);
};

module.exports = validateRoom;
