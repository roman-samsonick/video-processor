import type { NextApiRequest, NextApiResponse } from 'next';
import { createVideoWorkingDirectory } from 'video/utils/videoUtils';
import { createVideoInfo } from 'video/utils/videoInfoUtils';

export const config = {
  maxDuration: 90071992547409,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = crypto.randomUUID();

  await createVideoWorkingDirectory(id);
  await createVideoInfo(id);

  res.status(200).json({ id });
}
