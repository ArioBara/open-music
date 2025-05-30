/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INTEGER',
      notNull: true
    },
    performer: {
      type: 'TEXT',
      notNull: true
    },
    genre: {
      type: 'TEXT',
      notNull: false
    },
    duration: {
      type: 'INTEGER',
      notNull: false
    },
    albumId: {
      type: 'VARCHAR(50)'
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('songs')
}
