import type { NextApiRequest, NextApiResponse } from 'next';
import { EVideoStatus, pathToVideoFolder, STUB_GUID } from 'video/constants';
import { exists, getAbsolutePath } from 'video/utils/serverUtils';
import { createVideoInfo, readVideoInfo, updateVideoInfo, waitForVideoInfoChange } from 'video/utils/videoInfoUtils';
import { createVideoWorkingDirectory } from 'video/utils/videoUtils';

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


    if (req.query.id === 'undefined' || req.query.version === 'undefined' || !req.query.id || !req.query.version) {
      id = STUB_GUID;
      version = 0;

      if (!await exists(getAbsolutePath(false, pathToVideoFolder(id)))) {
        await createVideoWorkingDirectory(id);
        await createVideoInfo(id);
        await updateVideoInfo(id, v => ({
          ...v,
          status: EVideoStatus.FAILED_TO_UPLOAD,
        }));
      }
    }

    const result = await readVideoInfo(id);

    if (result.version > version) {
      res.status(200).send(result);
    } else {
      await waitForVideoInfoChange(id);

      res.status(200).send(await readVideoInfo(id));
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
}
