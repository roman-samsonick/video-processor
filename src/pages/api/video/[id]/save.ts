import type { NextApiRequest, NextApiResponse } from 'next';
import { getAbsolutePath } from 'video/utils/serverUtils';
import { ECutStatus, pathToCutVideo, pathToOriginalVideo } from 'video/constants';
import { cutVideo } from 'video/utils/videoUtils';
import { updateVideoInfo } from 'video/utils/videoInfoUtils';

export const config = {
  maxDuration: 90071992547409,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({});

  try {
    const info = await updateVideoInfo(req.query.id as string, v => ({
      ...v,
      cutStatus: ECutStatus.IN_PROGRESS,
    }));

    await cutVideo({
      start: info.cutStart,
      end: info.cutEnd,
      source: getAbsolutePath(false, pathToOriginalVideo(info.id)),
      output: getAbsolutePath(false, pathToCutVideo(info.id)),
    });

    await updateVideoInfo(req.query.id as string, v => ({
      ...v,
      cutStatus: ECutStatus.PERFORMED,
    }));
  } catch (e) {
    console.log(e);

    await updateVideoInfo(req.query.id as string, v => ({
      ...v,
      cutStatus: ECutStatus.FAILED,
    }));
  }
}
