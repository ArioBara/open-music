class UsersHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator
  }

  async postUserHandler (request, h) {
    this._validator.validateUsersPayload(request.payload)
    const { username, password, fullname } = request.payload
    const userId = await this._service.addUser({ username, password, fullname })

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan user',
      data: {
        userId
      }
    })
    response.code(201)
    return response
  }

  async getUserByIdHandler (request) {
    const { id } = request.params

    const user = await this._service.getUserById(id)
    return {
      status: 'success',
      message: 'User telah ditemukan',
      data: {
        user
      }
    }
  }
}
module.exports = UsersHandler
