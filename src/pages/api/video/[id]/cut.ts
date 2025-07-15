import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs';
import { pathToCutVideo } from 'video/constants';
import { getAbsolutePath } from 'video/utils/serverUtils';

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

  const stream = fs.createReadStream(getAbsolutePath(false, pathToCutVideo(id)))

  res.setHeader('Content-Disposition', 'attachment; filename=cut.mp4');
  res.status(200);
  stream.pipe(res);
}
