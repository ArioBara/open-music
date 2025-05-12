const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthenticationError = require('../../exceptions/AuthenticationsError')

class UsersService {
  constructor () {
    this._pool = new Pool()
  }

  async addUser ({ username, password, fullname }) {
    await this.verifyUsername(username)

    const id = `user-${nanoid(16)}`
    const hashPassword = await bcrypt.hash(password, 10)
    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashPassword, fullname]
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan user')
    }
    return result.rows[0].id
  }

  async verifyUsername (username) {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username]
    }
    const result = await this._pool.query(query)
    if (result.rowCount) {
      throw new InvariantError('Gagal menambahkan user. username sudah tersedia')
    }
  }

  async getUserById (userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId]
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('User tidak tersedia')
    }
    return result.rows[0]
  }

  async verifyUserCredentials (username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }
    const { id, password: hashedPassword } = result.rows[0]
    const match = await bcrypt.compare(password, hashedPassword)
    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }
    return id
  }
}
module.exports = UsersService
