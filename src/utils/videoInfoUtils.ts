import { getAbsolutePath, readJson, writeJson } from 'video/utils/serverUtils';
import { ECutStatus, EVideoStatus, IVideoInfo, pathToVideoInfo } from 'video/constants';
import chokidar from 'chokidar';

export async function createVideoInfo(id: string) {
  await writeJson<IVideoInfo>(getAbsolutePath(true, pathToVideoInfo(id)), {
    id: id,
    status: EVideoStatus.UPLOADING,
    uploadProgress: 0,
    cutStart: 0,
    cutEnd: 0,
    cutStatus: ECutStatus.IDLE,
    version: 0,
    format: undefined!,
    original: undefined!,
  });
}

export async function readVideoInfo(guid: string) {
  return await readJson<IVideoInfo>(getAbsolutePath(false, pathToVideoInfo(guid)));
}

export async function updateVideoInfo(
  guid: string,
  change: (video: IVideoInfo) => IVideoInfo,
): Promise<IVideoInfo> {
  const prev = await readVideoInfo(guid);
  const next = change(prev);

  await writeJson<IVideoInfo>(getAbsolutePath(true, pathToVideoInfo(guid)), {
    ...next,
    version: prev.version + 1,
  });

  return next;
}

export async function waitForVideoInfoChange(guid: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chokidar.watch(getAbsolutePath(false, pathToVideoInfo(guid)))
      .once('change', () => resolve())
      .once('error', reject);
  });
}
