import type { NextApiRequest, NextApiResponse } from 'next';
import { processUploadedVideo } from 'video/utils/videoUtils';

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 90071992547409,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed for File Upload',
    });

    return;
  }

  try {
    const id = req.query.id as string;

    await processUploadedVideo({ req, id });

    res.status(200).json({ id });
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}
