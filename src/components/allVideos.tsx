import Link from 'next/link';
import { IVideoInfo, pathToFrame, STUB_GUID } from 'video/constants';

export function AllVideos({ allVideos }: { allVideos: IVideoInfo[] }) {
  return <div className="videos">
    {allVideos.filter(v => v.id !== STUB_GUID).map((videoInfo) => {
      return <Link shallow
                   href={'/video/' + videoInfo.id}
                   key={videoInfo.id}
                   className="video-preview">
        <img src={`/api/${pathToFrame(videoInfo.id, 1)}`}
             className="video-preview_image"
             alt={videoInfo.original.originalFilename || 'video preview'} />

        <div className="video-preview_info">
          <div className="info_filename">
            <p className="filename_start">{videoInfo.original.originalFilename?.slice(0, -10)}</p>
            <p className="filename_end">{videoInfo.original.originalFilename?.slice(-10)}</p>
          </div>

          {!!videoInfo.format?.duration && <p>
            {Math.round(Number.parseFloat(videoInfo.format.duration))} сек.
          </p>}

        </div>
      </Link>;
    })}
  </div>;
}
