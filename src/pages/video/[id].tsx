'use client';

import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { EVideoStatus, IVideoInfo } from 'video/constants';
import { VideoEditor } from 'video/components/videoEditor';
import { useVideoInfoPoll } from 'video/hooks/useVideoInfoPoll';
import { readVideoInfo } from 'video/utils/videoInfoUtils';

export const getServerSideProps: GetServerSideProps<{ videoInfo: IVideoInfo }> = async (context) => {
  try {
    const id = context.params!.id as string;

    return {
      props: {
        videoInfo: await readVideoInfo(id),
      },
    };
  } catch (e) {
    console.log(e);

    return {
      notFound: true,
    }
  }
};

export default function VideoByGuid({
  videoInfo: videoInfoInitial,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const videoInfo = useVideoInfoPoll(videoInfoInitial)

  if (videoInfo.status === EVideoStatus.UPLOADING) {
    return <div>Загрузка: {videoInfo.uploadProgress}%</div>;
  }

  if (videoInfo.status === EVideoStatus.PROCESSING) {
    return <div>Обработка видео</div>;
  }

  if (videoInfo.status === EVideoStatus.FAILED_TO_UPLOAD) {
    return <div>Загрузка прервалась, начните с начала</div>;
  }

  return <VideoEditor videoInfo={videoInfo} />;
}
