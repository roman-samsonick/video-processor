import {
  EVideoStatus,
  IVideoFormat,
  MAX_FRAMES,
  pathToFrames,
  pathToOriginalVideo,
  pathToVideoFolder,
} from 'video/constants';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import fs from 'node:fs';
import { exists, getAbsolutePath } from 'video/utils/serverUtils';
import path from 'node:path';
import type { NextApiRequest } from 'next';
import { updateVideoInfo } from 'video/utils/videoInfoUtils';
import { File, IncomingForm } from 'formidable';

// import { throttle } from 'throttle-debounce';

export async function getVideoFormat(source: string): Promise<IVideoFormat> {
  const probe = await ffprobe(source, { path: ffprobeStatic.path });

  return probe.streams[0] as any;
}

export async function dropExtraFrames(guid: string): Promise<void> {
  const frames = await fs.promises.readdir(getAbsolutePath(false, pathToFrames(guid)));
  const framesFolder = getAbsolutePath(true, pathToFrames(guid));

  frames.sort((a, b) => parseInt(a) - parseInt(b));

  if (frames.length <= 2) {
    return;
  }

  const first = frames.shift()!;
  const last = frames.pop()!;
  await fs.promises.unlink(path.join(framesFolder, first));
  await fs.promises.unlink(path.join(framesFolder, last));

  for (let frame of frames) {
    await fs.promises.rename(
      path.join(framesFolder, frame),
      path.join(framesFolder, `${parseInt(frame) - 1}.jpeg`),
    );
  }
}

export function splitVideoIntoFrames(
  source: string,
  output: string,
  durationInSeconds: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    console.log(`[FRAMES GENERATION START]`);
    console.log(`[DURATION] ${durationInSeconds}s `);
    console.log(`[SOURCE] ${source}`);
    console.log(`[OUTPUT] ${output}`);

    const framesPerSecond = (MAX_FRAMES / durationInSeconds).toFixed(3);

    console.log(`[FRAMES_PER_SECOND] ${framesPerSecond}`);

    ffmpeg(source)
      .setFfmpegPath(ffmpegPath)
      .outputOption(durationInSeconds > MAX_FRAMES ? `-r ${framesPerSecond}` : '-r 1')
      .outputOption('-vf scale=120:-1')
      .output(output)
      .on('end', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
      .run();
  });
}

export async function cutVideo({
  end,
  start,
  source,
  output,
}: {
  source: string;
  output: string;
  start?: number;
  end?: number;
}): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    console.log('[VIDEO CUT START]');
    console.log(`[SOURCE] ${source}`);
    console.log(`[OUTPUT] ${output}`);
    console.log(`[CUT_START] ${start}`);
    console.log(`[CUT_END] ${end}`);

    const converter = ffmpeg(source)
      .setFfmpegPath(ffmpegPath)
      .addOption('-f mp4')
      .output(output)
      .on('end', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

    if (start) {
      converter.addOption(`-ss ${start}`);
    }

    if (end) {
      converter.addOption(`-to ${end}`);
    }

    converter.run();
  });
}

export async function parseVideoFromRequest(req: NextApiRequest, guid: string): Promise<File> {
  return await new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: getAbsolutePath(true, pathToVideoFolder(guid)),
      maxFileSize: Number.MAX_SAFE_INTEGER,
    });

    // form.on('progress', throttle(1000, (bytesReceived, bytesExpected) => {
    //   const progress = (bytesReceived / bytesExpected) * 100;
    //
    //   updateVideoInfo(guid, v => ({ ...v, uploadProgress: progress }));
    // }));

    form.parse(req, (err: any, _: any, files: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(files['file'][0]);
      }
    });
  });
}

export async function processUploadedVideo({ req, id }: { id: string, req: NextApiRequest }) {
  try {
    const file = await parseVideoFromRequest(req, id);

    await updateVideoInfo(id, info => ({
      ...info,
      status: EVideoStatus.PROCESSING,
      original: file.toJSON(),
    }));

    await cutVideo({
      output: getAbsolutePath(true, pathToOriginalVideo(id)),
      source: file.filepath,
      start: 0,
    });

    await fs.promises.unlink(file.filepath);

    const source = getAbsolutePath(false, pathToOriginalVideo(id));

    const output = getAbsolutePath(
      true,
      pathToFrames(id),
      '%d.jpeg',
    );

    const format = await getVideoFormat(source);

    await updateVideoInfo(id, info => ({
      ...info,
      format,
      cutEnd: parseInt(format.duration),
    }));

    await splitVideoIntoFrames(source, output, parseFloat(format.duration));
    await dropExtraFrames(id);

    await updateVideoInfo(id, info => ({
      ...info,
      status: EVideoStatus.UPLOADED,
    }));
  } catch (err) {
    console.log(err);

    await updateVideoInfo(id, info => ({
      ...info,
      status: EVideoStatus.FAILED_TO_UPLOAD,
    }));
  }
}

export async function createVideoWorkingDirectory(id: string) {
  const path = getAbsolutePath(true, pathToFrames(id));

  if (!await exists(path)) {
    await fs.promises.mkdir(path, { recursive: true });
  }
}

