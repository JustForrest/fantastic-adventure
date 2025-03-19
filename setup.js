#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default config
const defaultConfig = {
  POSTGRES_USER: 'postgres',
  POSTGRES_PASSWORD: generateRandomString(16),
  POSTGRES_DB: 'fantastic_adventure',
  POSTGRES_PORT: '5432',
  TYPESENSE_API_KEY: generateRandomString(24),
  JWT_SECRET: generateRandomString(32),
  NEXTAUTH_SECRET: generateRandomString(32),
  API_PORT: '3001',
  NODE_ENV: 'development',
  REDIS_PORT: '6379',
};

function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Check for required prerequisites
function checkPrerequisites() {
  console.log('\n🔍 Checking prerequisites...');
  
  try {
    // Check for Node.js version
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`✅ Node.js ${nodeVersion} installed`);
    
    // Check for Docker
    try {
      const dockerVersion = execSync('docker --version').toString().trim();
      console.log(`✅ ${dockerVersion} installed`);
    } catch (error) {
      console.warn('⚠️ Docker not found. Docker-based development will not be available.');
    }
    
    // Check for Docker Compose
    try {
      const composeVersion = execSync('docker compose version || docker-compose --version').toString().trim();
      console.log(`✅ ${composeVersion} installed`);
    } catch (error) {
      console.warn('⚠️ Docker Compose not found. Docker-based development will not be available.');
    }
    
    // Check for PostgreSQL client
    try {
      const psqlVersion = execSync('psql --version').toString().trim();
      console.log(`✅ ${psqlVersion} installed`);
    } catch (error) {
      console.warn('⚠️ PostgreSQL client (psql) not found. Some database operations may be limited.');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking prerequisites:', error);
    return false;
  }
}

// Helper function to configure Docker settings
async function configureDocker(config) {
  const useDocker = (await prompt('Do you want to use Docker for development? (Y/n): ')).toLowerCase() !== 'n';
  
  if (useDocker) {
    console.log('\n🐳 Setting up Docker configuration...');
    
    // Ask if user wants to customize Docker ports
    const customPorts = (await prompt('Do you want to customize Docker service ports? (y/N): ')).toLowerCase() === 'y';
    
    if (customPorts) {
      config.POSTGRES_PORT = await prompt(`PostgreSQL port (default: ${config.POSTGRES_PORT}): `) || config.POSTGRES_PORT;
      config.REDIS_PORT = await prompt(`Redis port (default: ${config.REDIS_PORT}): `) || config.REDIS_PORT;
      config.TYPESENSE_PORT = await prompt(`Typesense port (default: ${config.TYPESENSE_PORT}): `) || config.TYPESENSE_PORT;
      config.API_PORT = await prompt(`API port (default: ${config.API_PORT}): `) || config.API_PORT;
      const webPort = await prompt('Web port (default: 3000): ') || '3000';
      
      if (webPort !== '3000') {
        console.log(`\nNote: To use port ${webPort} for web service, you'll need to update the ports in docker-compose files.`);
      }
    }
    
    // Make sure DATABASE_URL_DOCKER is properly set for Docker
    config.DATABASE_URL_DOCKER = `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@postgres:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`;
    
    console.log('\n🐳 Docker configuration complete!');
    console.log('You can start services with: docker-compose -f docker-compose.yml -f docker-compose.dev.yml up');
    return true;
  }
  return false;
}

async function setupProject() {
  console.log('\n🚀 Welcome to Fantastic Adventure Setup\n');
  console.log('This script will help you set up your project.\n');

  // Check prerequisites first
  checkPrerequisites();

  // Ask for database credentials
  const useDefaultCredentials = (await prompt('Use default database credentials? (Y/n): ')).toLowerCase() !== 'n';
  
  const config = { ...defaultConfig };
  
  if (!useDefaultCredentials) {
    config.POSTGRES_USER = await prompt('Enter PostgreSQL username: ') || defaultConfig.POSTGRES_USER;
    config.POSTGRES_PASSWORD = await prompt('Enter PostgreSQL password: ') || defaultConfig.POSTGRES_PASSWORD;
    config.POSTGRES_DB = await prompt('Enter PostgreSQL database name: ') || defaultConfig.POSTGRES_DB;
  }

  // Configure Docker if needed
  const usingDocker = await configureDocker(config);
  
  // Build the DATABASE_URL for local development
  if (!usingDocker) {
    const db_host = await prompt('Enter database host (default: localhost): ') || 'localhost';
    const db_port = await prompt(`Enter database port (default: ${config.POSTGRES_PORT}): `) || config.POSTGRES_PORT;
    config.DATABASE_URL = `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@${db_host}:${db_port}/${config.POSTGRES_DB}`;
  } else {
    // For Docker development, still set DATABASE_URL to localhost for local tools
    config.DATABASE_URL = `postgresql://${config.POSTGRES_USER}:${config.POSTGRES_PASSWORD}@localhost:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`;
  }
  
  // Set up Typesense config
  config.TYPESENSE_HOST = await prompt('Enter Typesense host (default: localhost): ') || 'localhost';
  config.TYPESENSE_PORT = await prompt(`Enter Typesense port (default: ${config.TYPESENSE_PORT}): `) || config.TYPESENSE_PORT;
  
  // Set up web frontend config
  const api_host = await prompt('Enter API service host (default: localhost): ') || 'localhost';
  config.NEXT_PUBLIC_API_URL = `http://${api_host}:${config.API_PORT}`;
  config.NEXT_PUBLIC_TYPESENSE_HOST = config.TYPESENSE_HOST;
  config.NEXT_PUBLIC_TYPESENSE_PORT = config.TYPESENSE_PORT;
  config.NEXT_PUBLIC_TYPESENSE_PROTOCOL = 'http';
  config.NEXT_PUBLIC_TYPESENSE_API_KEY = config.TYPESENSE_API_KEY;
  
  // Set up NextAuth
  const host = await prompt('Enter web app host (default: localhost): ') || 'localhost';
  config.NEXTAUTH_URL = `http://${host}:3000`;

  // Create .env file
  let envContent = '';
  Object.keys(config).forEach(key => {
    envContent += `${key}=${config[key]}\n`;
  });

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Created .env file successfully');
  console.log('⚠️ Note: This .env file contains sensitive information and should not be committed to version control.');

  // Ask if the user wants to install dependencies
  const installDeps = (await prompt('Do you want to install dependencies now? (Y/n): ')).toLowerCase() !== 'n';
  
  if (installDeps) {
    console.log('\n📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  }

  // Ask if the user wants to run database migrations
  const runMigrations = (await prompt('Do you want to run database migrations and seed data? (Y/n): ')).toLowerCase() !== 'n';
  
  if (runMigrations) {
    console.log('\n🗃️ Running database migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully');
    
    console.log('\n🌱 Seeding database with initial data...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  }

  // Add Pagila sample database option
  const installPagila = (await prompt('Do you want to install the Pagila sample database? (Y/n): ')).toLowerCase() !== 'n';
  
  if (installPagila && runMigrations) {
    console.log('\n📊 Importing Pagila sample database...');
    execSync(`./import_pagila.sh ${config.POSTGRES_DB}`, { stdio: 'inherit' });
    console.log('✅ Pagila database imported successfully');
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\nYou can now start the development server with:');
  console.log('npm run dev');
  console.log('\nDefault admin credentials:');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');

  rl.close();
}

setupProject().catch(err => {
  console.error('Error during setup:', err);
  process.exit(1);
}); 