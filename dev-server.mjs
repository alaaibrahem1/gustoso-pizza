import { spawn } from 'child_process';

const NEON_PG_URL = 'postgresql://neondb_owner:npg_si5V7jepwkCq@ep-winter-rain-aye7uala-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const dbUrl = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'))
  ? process.env.DATABASE_URL
  : NEON_PG_URL;

// Ensure Next.js binds strictly to port 3000 and 0.0.0.0
// Cloud Run sets PORT=8080 (used by Nginx proxy), so Next.js must be forced to 3000
const env = {
  ...process.env,
  PORT: '3000',
  DATABASE_URL: dbUrl,
};

const child = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
