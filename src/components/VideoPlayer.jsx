"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { joinClasses } from "./SliceSection";
import "plyr/dist/plyr.css";
import "@/styles/components/video-player.scss";

const PLYR_CONTROLS = [
  "play",
  "progress",
  "current-time",
  "mute",
  "volume",
  "fullscreen",
];

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Muted looping preview. The play control starts playback with sound and Plyr UI.
 * `src` is a hosted video URL from a Prismic Link (`--allow web`) field.
 *
 * @param {{
 *   src: string,
 *   poster?: string,
 *   label?: string,
 *   className?: string,
 * }} props
 */
export default function VideoPlayer({
  src,
  poster,
  label = "Lire la vidéo",
  className,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const previewRef = useRef(true);
  const [isPreview, setIsPreview] = useState(true);

  useLayoutEffect(() => {
    if (reducedMotion()) videoRef.current?.pause();
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    /** @type {import("plyr").default | undefined} */
    let player;
    let cancelled = false;

    import("plyr").then(({ default: Plyr }) => {
      if (cancelled || !videoRef.current) return;

      const motionReduced = reducedMotion();
      player = new Plyr(videoRef.current, {
        autoplay: !motionReduced,
        muted: true,
        loop: { active: true },
        clickToPlay: false,
        hideControls: false,
        storage: { enabled: false },
        controls: PLYR_CONTROLS,
        fullscreen: { iosNative: true },
      });
      playerRef.current = player;

      if (motionReduced) player.pause();

      player.on("ended", () => {
        previewRef.current = true;
        setIsPreview(true);
        player.muted = true;
        player.loop = true;
        if (!reducedMotion()) player.play();
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
      playerRef.current = null;
    };
  }, [src]);

  const enterPlayback = async () => {
    if (!previewRef.current) return;

    const player = playerRef.current;
    const video = videoRef.current;
    if (!player && !video) return;

    previewRef.current = false;
    setIsPreview(false);

    const media = player ?? video;

    try {
      media.muted = false;
      media.loop = false;
      media.currentTime = 0;
      await media.play();
      window.setTimeout(() => {
        player?.elements?.buttons?.play?.[0]?.focus?.();
      }, 0);
    } catch {
      previewRef.current = true;
      setIsPreview(true);
      if (player) {
        player.muted = true;
        player.loop = true;
      }
    }
  };

  return (
    <div
      className={joinClasses(
        "video-player",
        !isPreview && "video-player--playing",
        className,
      )}
    >
      <video
        ref={videoRef}
        className="video-player__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      />
      {isPreview && (
        <button type="button" className="video-player__play" onClick={enterPlayback}>
          <span className="video-player__play-icon" aria-hidden="true" />
          <span className="u-visually-hidden">{label}</span>
        </button>
      )}
    </div>
  );
}
