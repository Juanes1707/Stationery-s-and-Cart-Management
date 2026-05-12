'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const db = require('./models');

const migrationsPath = path.join(__dirname, 'migrations');

async function ensureMetaTable(queryInterface) {
  await queryInterface.createTable('SequelizeMeta', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
  });
}

async function getAppliedMigrations(sequelize, queryInterface) {
  try {
    await ensureMetaTable(queryInterface);
  } catch (error) {
    if (!/already exists/i.test(error.message)) throw error;
  }

  const rows = await sequelize.query('SELECT name FROM SequelizeMeta', {
    type: Sequelize.QueryTypes.SELECT,
  });

  return new Set(rows.map((row) => row.name));
}

async function runMigrations() {
  const { sequelize } = db;
  const queryInterface = sequelize.getQueryInterface();
  const applied = await getAppliedMigrations(sequelize, queryInterface);
  const migrationFiles = fs
    .readdirSync(migrationsPath)
    .filter((file) => file.endsWith('.js'))
    .sort();

  for (const file of migrationFiles) {
    if (applied.has(file)) continue;

    const migration = require(path.join(migrationsPath, file));
    await migration.up(queryInterface, Sequelize);
    await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
      replacements: [file],
    });
    console.log(`Migracion aplicada: ${file}`);
  }
}

module.exports = { runMigrations };
