import type { NextApiRequest, NextApiResponse } from 'next';
import { pathToFrame } from 'video/constants';
import { getAbsolutePath, sendFile } from 'video/utils/serverUtils';

export const config = {
  maxDuration: 90071992547409,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id! as string;
  const index = req.query.index! as string;
  const parsedIndex = parseInt(index);
  const path = `${getAbsolutePath(false, pathToFrame(id, parsedIndex))}.jpeg`;

  await sendFile(res, path, 'image/jpeg');
}

