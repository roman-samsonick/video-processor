import type { NextApiRequest, NextApiResponse } from 'next';
import { readVideoInfo, waitForVideoInfoChange } from 'video/utils/videoInfoUtils';

export const config = {
  api: {
  },
  maxDuration: 90071992547409,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const id = req.query.id as string;
    const version = parseInt(req.query.version as string);

    const result = await readVideoInfo(id);

    if (result.version > version) {
      res.status(200).send(result);
    } else {
      await waitForVideoInfoChange(id);

      res.status(200).send(await readVideoInfo(id));
    }
  } catch (error) {
    res.status(400).send({});
  }
}
