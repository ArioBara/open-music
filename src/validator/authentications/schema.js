const Joi = require('joi')

const postAuthenticationsPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

const putAuthenticationsPayloadSchema = Joi.object({
  refreshToken: Joi.string().required()
})

const deleteAuthenticationsPayloadSchema = Joi.object({
  refreshToken: Joi.string().required()
})

module.exports = {
  postAuthenticationsPayloadSchema,
  putAuthenticationsPayloadSchema,
  deleteAuthenticationsPayloadSchema
}
