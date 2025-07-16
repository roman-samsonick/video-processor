import { useRouter } from 'next/router';
import { ChangeEvent, useRef } from 'react';
import { IVideoInfo, STUB_GUID } from 'video/constants';
import { callApi } from 'video/utils/clientUtils';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { exists, getAbsolutePath, readDir } from 'video/utils/serverUtils';
import { readVideoInfo } from 'video/utils/videoInfoUtils';
import { AllVideos } from 'video/components/allVideos';

export const getServerSideProps: GetServerSideProps<{ allVideos: IVideoInfo[] }> = async () => {
  const exist = await exists(getAbsolutePath(false, '/video'));

  if (!exist) {
    return {
      props: {
        allVideos: [],
      },
    };
  }

  const ids = await readDir(getAbsolutePath(false, '/video'));

  return {
    props: {
      allVideos: await Promise.all(
        ids.map(async id => await readVideoInfo(id)),
      ),
    },
  };
};

export default function Home({
  allVideos,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFileFromEvent = async (event: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();

    formData.set('file', event.target.files![0]);

    const { id } = await callApi<{}, { id: string }>('/api/video', {});

    await router.push(`/video/${id}`, undefined, {
      shallow: true,
    });

    await callApi(`/api/video/${id}/upload`, formData);
  };

  return (
    <div className="main">
      <button onClick={() => inputRef.current?.click()}>
        Загрузить файл
      </button>

      <input onChange={uploadFileFromEvent}
             type="file"
             ref={inputRef}
             accept="video/*"
             hidden
             placeholder="video" />

      <a className="download-link"
         download
         href="/test.mp4">
        Скачать тестовое видео для проверки
      </a>

      {!!allVideos.filter(v => v.id !== STUB_GUID).length && (
        <AllVideos allVideos={allVideos} />
      )}
    </div>
  );
}
