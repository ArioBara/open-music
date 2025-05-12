const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/invariantError')
const AuthorizationError = require('../../exception/authorizationsError')
const NotFoundError = require('../../exception/notFoundError')

class PlaylistsService {
  constructor (collaborationsService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
  }

  async addPlaylist ({ name, credentialId: owner }) {
    const id = `playlist-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: 'SELECT playlists.id,playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id  WHERE collaborations.user_id = $1 OR users.id = $1',
      values: [owner]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new InvariantError('tidak mendapatkan lagu')
    }
    return result.rows
  }

  async getPlaylistById (id) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1 ',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ada')
    }

    return result.rows[0]
  }

  async deletePlaylistById (playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dihapus, Id tidak ditemukan')
    }
  }

  // Verify data
  async verifyPlaylistOwner (playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki akses untuk resource ini')
    }
  }

  async verifyAccessUser (userId, playlistId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }

  // adding song to playlist

  async addPlaylistSong (playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist song gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylistSongs (playlistId) {
    const query = {
      text: 'SELECT song.song_id, song.title, song.performer FROM song LEFT JOIN playlist_songs ON song.song_id = playlist_songs.song_id  WHERE playlist_songs.playlist_id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist song tidak ditemukan')
    }

    return result.rows
  }

  async getSongsByPlaylistId (playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows[0]
  }

  async deletePlaylistSong (playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist song gagal dihapus')
    }
  }

  // adding playlist activities
  // async addPlaylistActivities(playlistId, songId, userId, Action) {
  //     const id = `Activities-${nanoid(16)}`;
  //     const time = new Date().toISOString();
  //     const query = {
  //         Text: 'INSERT INTO playlist_activities VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
  //         values: [id, playlistId, songId, userId, Action, time],
  //     };
  //     const result = await this._pool.query(query);

  //     if (!result.rows[0].id) {
  //         throw new InvariantError('Gagal menyimpan activity');
  //     }

  //     return result.rows[0].id;
  // }

  // async getPlaylistActivities(playlistId, owner) {
  //     const query = {
  //         text: 'SELECT users.username, song.title, playlist_activities.action, playlist_activities.time FROM playlist_activities JOIN playlists ON playlist_activities.playlist_id = playlists.id JOIN song ON playlist_activities.song_id = song.song_id JOIN users ON users.id = playlist_activities.user_id LEFT JOIN collaborations ON collaborations.playlist_id = playlist_activities.id WHERE playlists.id = $1 AND playlists.owner = $2 OR collaborations.user_id = $2 ORDER BY playlist_activities.time ASC',
  //         values: [playlistId, owner]
  //     }
  //     const result = await this._pool.query(query)
  //     if (!result.rowCount) {
  //         throw new NotFoundError('Playlist tidak ada');
  //     }
  //     return result.rows;
  // }
}

module.exports = PlaylistsService
