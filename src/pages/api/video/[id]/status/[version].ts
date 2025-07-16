import type { NextApiRequest, NextApiResponse } from 'next';
import { EVideoStatus } from 'video/constants';
import { createVideoInfo, readVideoInfo, updateVideoInfo, waitForVideoInfoChange } from 'video/utils/videoInfoUtils';

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
    let id = req.query.id as string;
    let version = parseInt(req.query.version as string);

    if (req.query.id === 'undefined' || req.query.version === 'undefined') {
      id = crypto.randomUUID();
      version = 0;

      await createVideoInfo(id);
      await updateVideoInfo(id, v => ({
        ...v,
        status: EVideoStatus.FAILED_TO_UPLOAD,
      }));
    }

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
