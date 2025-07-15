import type { NextApiRequest, NextApiResponse } from 'next';
import { pathToOriginalVideo } from 'video/constants';
import { getAbsolutePath, sendFile } from 'video/utils/serverUtils';

export const config = {
  api: {
    responseLimit: false,
  },
  maxDuration: 90071992547409,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id! as string;
  const path = getAbsolutePath(false, pathToOriginalVideo(id));

  await sendFile(res, path, 'video/mp4');
}
