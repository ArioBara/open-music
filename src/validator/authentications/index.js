const {
  postAuthenticationsPayloadSchema,
  putAuthenticationsPayloadSchema,
  deleteAuthenticationsPayloadSchema
} = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = postAuthenticationsPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = putAuthenticationsPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = deleteAuthenticationsPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AuthenticationsValidator
