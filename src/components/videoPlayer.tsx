import { RefObject, useEffect, useState } from 'react';

export function VideoPlayer({
  originalSrc,
  onProgress,
  ref,
  onLoad,
}: {
  originalSrc: string,
  ref: RefObject<HTMLVideoElement | null>
  onProgress?: (seconds: number) => void;
  onLoad?: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(originalSrc);

      const buf = await res.arrayBuffer();
      const file = new File([buf], 'video.mp4');

      setSrc(URL.createObjectURL(file));
    };

    load();

    const checkPropgress = () => {
      onProgress?.(ref.current!.currentTime);
    };

    const notifyLoad = () => {
      onLoad?.();
    };

    ref.current!.addEventListener('timeupdate', checkPropgress);
    ref.current!.addEventListener('loadeddata', notifyLoad);

    return () => {
      ref.current?.removeEventListener('timeupdate', checkPropgress);
      ref.current?.removeEventListener('loadeddata', notifyLoad);
    };
  }, []);

  return <video ref={ref}
                src={src!}
                className="player"
                controls={true} />;
}
