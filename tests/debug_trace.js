import { nodeFileTrace } from '@vercel/nft';
import path from 'path';

const entryPoint = path.resolve('api-test.js');

async function testTrace() {
  const entryPoint = path.resolve('netlify/functions/api.js');
  console.log(`Testing trace on: ${entryPoint}`);

  try {
    const { fileList, warnings } = await nodeFileTrace([entryPoint], {
      base: process.cwd(),
    });
    console.log('Successfully traced files count:', fileList.size);
  } catch (error) {
    console.error('--- TRACE FAILED ---');
    console.error('Syscall:', error.syscall);
    console.error('Failed Path:', error.path);
    console.error('Full Error:', error);
  }
}

testTrace();

