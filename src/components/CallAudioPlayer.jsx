import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw, Check, Sparkles, Headphones } from 'lucide-react';

export default function CallAudioPlayer({ 
  audioUrl, 
  conversation, 
  compact = false,
  autoPlay = false 
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(conversation?.duration_seconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Original raw recording URL
  const rawUrl = audioUrl || conversation?.recording_url;

  // Resolve audio URL: proxy media.vobiz.ai URLs through authenticated server proxy
  const resolvedUrl = React.useMemo(() => {
    if (!rawUrl) return '/recordings/telugu_coaching_intro.mp3';
    if (rawUrl.startsWith('https://media.vobiz.ai') || rawUrl.includes('vobiz.ai/v1/Account/')) {
      return `/api/vobiz/recording?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  }, [rawUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio autoplay blocked or failed:", err);
      });
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = parseFloat(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    audio.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      // If VoBiz recording, append download=true so proxy returns attachment headers
      const downloadTargetUrl = resolvedUrl.includes('/api/vobiz/recording')
        ? `${resolvedUrl}&download=true`
        : resolvedUrl;

      const response = await fetch(downloadTargetUrl);
      if (!response.ok) {
        throw new Error(`Download HTTP error ${response.status}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json') || contentType.includes('text/html')) {
        throw new Error(`Invalid audio response content-type: ${contentType}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const cleanPhone = (conversation?.contact_phone || 'lead').replace(/[^0-9+]/g, '');
      const idPrefix = conversation?.id ? conversation.id.slice(0, 8) : 'original_call';
      const ext = blob.type.includes('webm') ? 'webm' : 'mp3';
      a.download = `call_recording_${cleanPhone}_${idPrefix}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Audio download error, fallback to direct open:", err);
      const a = document.createElement('a');
      a.href = resolvedUrl.includes('/api/vobiz/recording') ? `${resolvedUrl}&download=true` : resolvedUrl;
      a.download = `call_recording.mp3`;
      a.click();
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Waveform heights pattern (simulation of voice audio energy)
  const waveHeights = [25, 60, 40, 85, 95, 45, 75, 100, 70, 90, 50, 80, 65, 30, 70, 45];

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <audio ref={audioRef} src={resolvedUrl} preload="metadata" />
        <button
          onClick={togglePlay}
          className="btn btn-sm"
          style={{
            background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
            color: isPlaying ? '#f87171' : '#a5b4fc',
            border: isPlaying ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
            padding: '4px 10px',
            fontSize: '0.74rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5
          }}
          title={isPlaying ? 'Pause Audio' : 'Listen / Preview Audio'}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'Pause' : 'Listen'}</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 8px', fontSize: '0.74rem' }}
          title="Download MP3 Audio"
        >
          {downloadSuccess ? <Check size={12} color="#34d399" /> : <Download size={12} />}
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.09) 0%, rgba(168, 85, 247, 0.06) 50%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.28)',
        borderRadius: 12,
        padding: '12px 16px',
        marginTop: 12,
        marginBottom: 14,
        position: 'relative',
        boxShadow: isPlaying ? '0 0 20px rgba(99, 102, 241, 0.15)' : 'none',
        transition: 'all 0.25s ease'
      }}
    >
      <audio ref={audioRef} src={resolvedUrl} preload="metadata" />

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: isPlaying ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: isPlaying ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none'
          }}>
            <Headphones size={15} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Audio Call Recording</span>
              {isPlaying && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  fontSize: '0.68rem', 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  color: '#f87171', 
                  padding: '1px 6px', 
                  borderRadius: 10,
                  fontWeight: 600
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite' }} />
                  PLAYING
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Studio MP3 • {conversation?.employee_name || 'AI Voice'} &amp; Callee
            </div>
          </div>
        </div>

        {/* Action button - Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={cycleSpeed}
            className="btn btn-secondary btn-sm"
            style={{ 
              fontSize: '0.7rem', 
              padding: '3px 8px', 
              borderRadius: 6, 
              background: 'rgba(255,255,255,0.06)', 
              borderColor: 'rgba(255,255,255,0.12)',
              color: playbackRate > 1 ? '#a5b4fc' : 'var(--text-secondary)'
            }}
            title="Adjust Playback Speed"
          >
            {playbackRate}x
          </button>

          <button
            onClick={toggleMute}
            className="btn btn-secondary btn-sm"
            style={{ 
              fontSize: '0.7rem', 
              padding: '3px 8px', 
              borderRadius: 6, 
              background: 'rgba(255,255,255,0.06)', 
              borderColor: 'rgba(255,255,255,0.12)',
              color: isMuted ? '#f87171' : 'var(--text-secondary)'
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-sm"
            style={{
              fontSize: '0.74rem',
              padding: '4px 12px',
              borderRadius: 7,
              background: downloadSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              border: downloadSuccess ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(99, 102, 241, 0.5)',
              color: downloadSuccess ? '#34d399' : '#c7d2fe',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
            title="Download Audio File (.mp3)"
          >
            {downloadSuccess ? (
              <>
                <Check size={13} />
                <span>Saved!</span>
              </>
            ) : isDownloading ? (
              <span>Downloading...</span>
            ) : (
              <>
                <Download size={13} />
                <span>Download Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main player controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: isPlaying ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isPlaying ? '0 0 16px rgba(239, 68, 68, 0.45)' : '0 0 16px rgba(99, 102, 241, 0.45)',
            transition: 'all 0.2s ease'
          }}
          title={isPlaying ? 'Pause' : 'Play / Listen Audio'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>

        {/* Audio Waveform visualization */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3, 
          height: 28, 
          padding: '0 4px',
          flexShrink: 0
        }}>
          {waveHeights.map((h, i) => {
            const isPassed = (i / waveHeights.length) <= (progressPercent / 100);
            return (
              <div
                key={i}
                style={{
                  width: 3,
                  height: isPlaying ? `${Math.max(15, (h * (0.4 + Math.sin((currentTime * 4) + i) * 0.6)))}%` : `${h * 0.7}%`,
                  borderRadius: 2,
                  background: isPassed 
                    ? 'linear-gradient(180deg, #a855f7, #6366f1)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  transition: 'height 0.15s ease, background 0.2s ease'
                }}
              />
            );
          })}
        </div>

        {/* Scrubbable Seekbar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: '100%',
              accentColor: '#818cf8',
              cursor: 'pointer',
              height: 5,
              background: `linear-gradient(to right, #818cf8 0%, #818cf8 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
              borderRadius: 4
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
