import fs from 'node:fs';
import path from 'node:path';
import type { NextApiResponse } from 'next';

export async function exists(path: string) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function readDir(path: string) {
 return await fs.promises.readdir(path);
}

export async function writeJson<T>(path: string, json: T): Promise<void> {
  await fs.promises.writeFile(path, JSON.stringify(json, null, 2));
}

export async function readJson<T>(path: string): Promise<T> {
  const text = await fs.promises.readFile(path, 'utf8');

  return JSON.parse(text);
}

export function getAbsolutePath(toWrite: boolean, ...pathToFile: string[]) {
  return path.join(
    process.env.NODE_ENV === 'production' ? `${process.cwd()}/app` : process.cwd(),
    ...pathToFile,
  );
}

export async function sendFile(
  res: NextApiResponse,
  path: string,
  contentType: string,
) {
  try {
    const stat = await fs.promises.stat(path);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
    });

    const stream = fs.createReadStream(path);

    stream.on('error', (err: Error) => {
      console.log(err);
      res.status(500).end();

      stream.close();
    });

    res.status(200);
    stream.pipe(res);
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
}
