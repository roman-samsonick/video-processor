import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from 'throttle-debounce';
import { VideoPlayer } from 'video/components/videoPlayer';
import { ECutStatus, IVideoInfo, MAX_FRAMES, pathToCutVideo, pathToFrame } from 'video/constants';
import { callApi } from 'video/utils/clientUtils';

export function VideoEditor({ videoInfo }: { videoInfo: IVideoInfo }) {
  const duration = parseInt(videoInfo.format.duration);
  const [seconds] = useState(() => Array.from({ length: duration > MAX_FRAMES ? MAX_FRAMES : duration }).map((_, i) => i + 1));
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftSliderShadowRef = useRef<HTMLDivElement>(null);
  const rightSliderShadowRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorGrabRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'left' | 'right' | 'cursor' | null>(null);
  const cutStartLabelRef = useRef<HTMLSpanElement>(null);
  const cutEndLabelRef = useRef<HTMLSpanElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const cutStartValueRef = useRef(videoInfo.cutStart);
  const cutEndValueRef = useRef(videoInfo.cutEnd);

  const saveCut = useCallback(debounce(500, () => {
    if (videoInfo.cutStart.toFixed(2) === cutStartValueRef.current.toFixed(2)
      && videoInfo.cutEnd.toFixed(2) === cutEndValueRef.current.toFixed(2)) {
      return;
    }

    callApi(`/api/video/${videoInfo.id}/setCut`, {
      cutStart: cutStartValueRef.current,
      cutEnd: cutEndValueRef.current,
    });
  }), []);

  const performCut = async () => {
    await callApi(`/api/video/${videoInfo.id}/save`, {});
  };

  const getLeftSliderShadow = () => leftSliderShadowRef.current!;
  const setLeftSliderShadowWidth = (width: number) => {
    getLeftSliderShadow().style.width = `${width}px`;
  };

  const getRightSliderShadow = () => rightSliderShadowRef.current!;
  const setRightSliderShadowWidth = (width: number) => {
    getRightSliderShadow().style.width = `${width}px`;
  };

  const getLeftSlider = () => {
    return leftRef.current!;
  };

  const getLeftSliderPosition = () => {
    return parseInt(leftRef.current!.style.left);
  };

  const setLeftSliderPosition = (value: number) => {
    getLeftSlider().style.left = value + 'px';

    cutStartValueRef.current = getTimeFromPositionOnTimeLine(value);
    saveCut();

    cutStartLabelRef.current!.textContent = `${cutStartValueRef.current.toFixed(2)}s`;

    setLeftSliderShadowWidth(value);
  };

  const getRightSlider = () => {
    return rightRef.current!;
  };

  const getRightSliderPosition = () => {
    return parseInt(rightRef.current!.style.left);
  };

  const setRightSliderPosition = (value: number) => {
    getRightSlider().style.left = value + 'px';

    cutEndValueRef.current = getTimeFromPositionOnTimeLine(value);
    saveCut();

    cutEndLabelRef.current!.textContent = `${cutEndValueRef.current.toFixed(2)}s`;

    setRightSliderShadowWidth(getTimelineWidth() - value);
  };

  const getTimelineWidth = () => {
    return timelineRef.current!.clientWidth;
  };

  const getTimeFromPositionOnTimeLine = (position: number) => {
    return duration * (position / getTimelineWidth());
  };

  const getPositionOnTimeLineFromTime = (time: number) => {
    return (time / duration) * getTimelineWidth();
  };

  const getCursorGrab = () => {
    return cursorGrabRef.current!;
  };

  const getVideoElement = () => {
    return videoElementRef.current!;
  };

  const setCursorPosition = (value: number, syncVideo: boolean = true) => {
    value = boundValueBySliders(value);
    const time = getTimeFromPositionOnTimeLine(value);

    cursorRef.current!.style.left = value + 'px';
    cursorLabelRef.current!.textContent = time.toFixed(2) + 's';

    if (syncVideo && time.toFixed(2) !== getVideoElement().currentTime.toFixed(2)) {
      getVideoElement().currentTime = time;

      if (!getVideoElement().paused) {
        getVideoElement()!.pause();
      }
    }
  };

  const getCursorPosition = () => {
    return parseInt(cursorRef.current!.style.left);
  };

  const boundValue = (value: number, left: number, right: number) => {
    return Math.min(
      Math.max(value, left),
      right,
    );
  };

  const boundValueBySliders = (value: number) => {
    return boundValue(
      value,
      getLeftSliderPosition(),
      getRightSliderPosition(),
    );
  };

  const mouseMove = (e: MouseEvent) => {
    if (!draggingRef.current || !timelineRef.current) {
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();
    const offset = rect.left;
    const position = boundValue(
      e.clientX - offset,
      0,
      timelineRef.current.clientWidth,
    );

    switch (draggingRef.current) {
      case 'left':
        setLeftSliderPosition(position);

        if (getRightSliderPosition() < getLeftSliderPosition()) {
          setRightSliderPosition(position);
        }

        if (getCursorPosition() < getLeftSliderPosition()) {
          setCursorPosition(position);
        }
        return;
      case 'right':
        setRightSliderPosition(position);

        if (getLeftSliderPosition() > getRightSliderPosition()) {
          setLeftSliderPosition(position);
        }

        if (getCursorPosition() > getRightSliderPosition()) {
          setCursorPosition(position);
        }
        return;
      case 'cursor':
        setCursorPosition(position);

        return;
    }
  };

  const mouseDown = (e: MouseEvent) => {
    if (e.composedPath().includes(getLeftSlider())) {
      draggingRef.current = 'left';
    }

    if (e.composedPath().includes(getRightSlider())) {
      draggingRef.current = 'right';
    }

    if (e.composedPath().includes(getCursorGrab())) {
      draggingRef.current = 'cursor';
    }
  };

  const mouseUp = () => {
    draggingRef.current = null;
    setTimeout(() => {
      draggingRef.current = null;
    }, 10);
  };

  const moveCursorToClickedFrame = (event: ReactMouseEvent) => {
    const timeline = timelineRef.current!;
    const clientX = event.clientX;
    const rect = timeline.getBoundingClientRect();
    const scrollLeft = timeline.scrollLeft;
    const position = clientX - rect.left + scrollLeft;

    setCursorPosition(position);
  };

  const syncCursorWithPlayedVideo = (time: number) => {
    if (!draggingRef.current) {
      const outOfBound = time > cutEndValueRef.current
        || time < cutStartValueRef.current;

      if (outOfBound) {
        setCursorPosition(
          getPositionOnTimeLineFromTime(time),
          true,
        );
      } else {
        setCursorPosition(
          getPositionOnTimeLineFromTime(time),
          false,
        );
      }
    }
  };

  const mb = (sizeInBytes: number) => {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)}mb`;
  };

  useEffect(() => {
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);

    setLeftSliderPosition(getPositionOnTimeLineFromTime(videoInfo.cutStart));
    setRightSliderPosition(getPositionOnTimeLineFromTime(videoInfo.cutEnd));
    setCursorPosition(getPositionOnTimeLineFromTime(videoInfo.cutStart));

    return () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mousedown', mouseDown);
      document.removeEventListener('mouseup', mouseUp);
    };
  }, []);

  return <div className="editor">
    <div className="actions">
      <a href="/"
         className="back_button">
        На главную
      </a>

      <div>
        <div>
          Оригинал: {videoInfo.original.originalFilename}
        </div>
        <div>
          Размер: {mb(videoInfo.original.size)}
        </div>
        <div>
          Длительность: {parseFloat(videoInfo.format.duration).toFixed(2)}s
        </div>
      </div>

      <div>
        <div>
          Начало: <span ref={cutStartLabelRef}>{cutStartValueRef.current}s</span>
        </div>
        <div>
          Конец: <span ref={cutEndLabelRef}>{cutEndValueRef.current}s</span>
        </div>
        <div>
          Курсор: <span ref={cursorLabelRef}>{cutStartValueRef.current}s</span>
        </div>
      </div>

      {videoInfo.cutStatus === ECutStatus.IDLE &&
        <button onClick={performCut}>
          Обрезать
        </button>
      }

      {videoInfo.cutStatus === ECutStatus.IN_PROGRESS &&
        <button disabled>
          Обрезать (обрабатывается)
        </button>
      }

      {videoInfo.cutStatus === ECutStatus.PERFORMED &&
        <a href={`/api/${pathToCutVideo(videoInfo.id)}`}
           download>
          <button>
            Скачать
          </button>
        </a>
      }
    </div>

    <VideoPlayer
      ref={videoElementRef}
      onProgress={syncCursorWithPlayedVideo}
      originalSrc={`/api/video/${videoInfo.id}`} />

    <div onDragStart={e => e.preventDefault()}
         className="scroll-container"
         ref={scrollRef}>
      <div ref={timelineRef}
           className="seconds-container">
        {seconds.map(i =>
          <div key={i}>
            <img src={`/api/${pathToFrame(videoInfo.id, i)}`}
                 onClick={moveCursorToClickedFrame}
                 style={{
                   userSelect: 'none',
                   width: 100,
                   aspectRatio: videoInfo.format.display_aspect_ratio,
                 }} />
          </div>,
        )}

        <div className="handle left"
             ref={leftRef}>
          <div ref={leftSliderShadowRef}
               className="handle_shadow" />
        </div>
        <div className="handle right"
             ref={rightRef}>
          <div ref={rightSliderShadowRef}
               className="handle_shadow" />
        </div>
        <div ref={cursorRef}
             className="cursor">
          <div className="cursor__bar" />
          <div ref={cursorGrabRef}
               className="cursor__grabber" />
        </div>
      </div>
    </div>
  </div>;
}
