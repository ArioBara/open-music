class AuthenticationsHandler {
  constructor (authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService
    this._usersService = usersService
    this._tokenManager = tokenManager
    this._validator = validator
  }

  async postAuthenticationsHandler (request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload)

    const { username, password } = request.payload
    const id = await this._usersService.verifyUserCredentials(username, password)

    const accessToken = this._tokenManager.generateAccessToken({ id })
    const refreshToken = this._tokenManager.generateRefreshToken({ id })

    await this._authenticationsService.addRefreshToken(refreshToken)

    const response = h.response({
      status: 'success',
      message: 'Token berhasil didapatkan',
      data: {
        accessToken,
        refreshToken
      }
    })
    response.code(201)
    return response
  }

  async putAuthenticationsHandler (request) {
    this._validator.validatePutAuthenticationPayload(request.payload)

    const { refreshToken } = request.payload
    await this._authenticationsService.verifyRefreshToken(refreshToken)
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken)

    const accessToken = this._tokenManager.generateAccessToken({ id })
    return {
      status: 'success',
      message: 'Access Token diperbarui',
      data: {
        accessToken
      }
    }
  }

  async deleteAuthenticationsHandler (request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload)

    const { refreshToken } = request.payload
    await this._authenticationsService.verifyRefreshToken(refreshToken)
    await this._authenticationsService.deleteRefreshToken(refreshToken)

    return {
      status: 'success',
      message: 'Token dihapus'
    }
  }
}
module.exports = AuthenticationsHandler
