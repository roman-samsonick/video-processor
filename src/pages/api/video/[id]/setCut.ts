import type { NextApiRequest, NextApiResponse } from 'next';
import { ECutStatus } from 'video/constants';

import { updateVideoInfo } from 'video/utils/videoInfoUtils';

export const config = {
  maxDuration: 90071992547409,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const parsedBody = JSON.parse(req.body)

  const info = await updateVideoInfo(req.query.id as string, v => ({
    ...v,
    cutStart: parsedBody.cutStart,
    cutEnd: parsedBody.cutEnd,
    cutStatus: ECutStatus.IDLE,
  }));

  res.status(200).json(info);
}
