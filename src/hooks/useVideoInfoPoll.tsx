import { IVideoInfo } from 'video/constants';
import { useEffect, useState } from 'react';
import { callApi } from 'video/utils/clientUtils';

export function useVideoInfoPoll(videoInfoInitial: IVideoInfo) {
  const [videoInfo, setVideoInfo] = useState(videoInfoInitial);

  useEffect(() => {
    let info = videoInfo;

    const startPoll = async () => {
      while (true) {
        try {
          const res = await callApi<{}, IVideoInfo>(
            `/api/video/${info.id}/status/${info.version}`,
            {},
          );

          setVideoInfo(res);
          info = res;
        } catch (e) {
          console.log(e);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };

    startPoll();
  }, []);

  return videoInfo;
}
