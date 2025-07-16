import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IVideoInfo } from 'video/constants';
import { callApi } from 'video/utils/clientUtils';

export function useVideoInfoPoll(videoInfoInitial: IVideoInfo) {
  const [videoInfo, setVideoInfo] = useState(videoInfoInitial);
  const router = useRouter()

  useEffect(() => {
    let info = videoInfo;

    const startPoll = async () => {
      while (true) {
        try {
          const res = await callApi<{}, IVideoInfo>(
            `/api/video/${info.id}/status/${info.version}`,
            {},
          );

          if (res && res.id === info.id) {
            setVideoInfo(res);
            info = res;
          }
        } catch (e) {
          console.log(e);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return;
        }
      }
    };

    startPoll();
  }, []);

  return videoInfo;
}
