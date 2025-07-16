import { FileJSON } from 'formidable';

export enum EVideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  UPLOADED = 'uploaded',
  FAILED_TO_UPLOAD = 'failed_to_upload',
}

export enum ECutStatus {
  IDLE = 'idle',
  IN_PROGRESS = 'in_progress',
  PERFORMED = 'performed',
  FAILED = 'failed',
}

export interface IVideoFormat {
  pix_fmt: string;
  r_frame_rate: string;
  start_pts: number;
  duration_ts: number;
  duration: string;
  bit_rate: string;
  sample_aspect_ratio: string;
  is_avc: string;
  codec_tag_string: string;
  avg_frame_rate: string;
  nb_frames: string;
  codec_long_name: string;
  height: number;
  nal_length_size: string;
  chroma_location: string;
  time_base: string;
  coded_height: number;
  level: number;
  profile: string;
  bits_per_raw_sample: string;
  index: number;
  codec_name: string;
  tags: { handler_name: string; language: string };
  start_time: string;
  disposition: {
    dub: number;
    karaoke: number;
    default: number;
    original: number;
    visual_impaired: number;
    forced: number;
    attached_pic: number;
    comment: number;
    hearing_impaired: number;
    lyrics: number;
    clean_effects: number
  };
  codec_tag: string;
  has_b_frames: number;
  refs: number;
  codec_time_base: string;
  width: number;
  display_aspect_ratio: string;
  coded_width: number;
  codec_type: string
}

export interface IVideoInfo {
  readonly id: string;
  readonly status: string;
  readonly original: FileJSON;
  readonly uploadProgress: number;
  readonly format: IVideoFormat;
  readonly cutStart: number;
  readonly cutEnd: number;
  readonly cutStatus: ECutStatus;
  readonly version: number;
}

export function pathToVideoFolder(guid: string) {
  return `video/${guid}`;
}

export function pathToVideoInfo(guid: string) {
  return `${pathToVideoFolder(guid)}/info.json`;
}

export function pathToOriginalVideo(guid: string) {
  return `${pathToVideoFolder(guid)}/original`;
}

export function pathToCutVideo(guid: string) {
  return `${pathToVideoFolder(guid)}/cut`;
}

export function pathToFrames(guid: string) {
  return `${pathToVideoFolder(guid)}/frames`;
}

export function pathToFrame(guid: string, index: number) {
  return `${pathToFrames(guid)}/${index}`;
}

export const MAX_FRAMES = 50;
export const STUB_GUID = '2701aea8-ab8e-43e1-891d-d687157773ef';
