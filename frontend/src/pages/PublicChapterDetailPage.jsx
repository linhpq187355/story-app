import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { publicStoryService } from '../services/publicStoryService';
import { coinService } from '../services/coinService';
import { userService } from '../services/userService';
import { getErrorMessage, getErrorCode } from '../utils/errorHandler';
import HomeNavbar from '../components/home/HomeNavbar';
import ChapterListModal from '../components/home/ChapterListModal';
import ReadingSettings, { READING_THEMES, FONT_FAMILIES, DEFAULT_SETTINGS } from '../components/home/ReadingSettings';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRedo, FaUndo, FaForward, FaStepForward, FaStepBackward, FaEllipsisV, FaTimes } from 'react-icons/fa';

const LockedContent = ({ accessLevel, storyId, chapterId, onLogin, theme, onPurchasedSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [story, setStory] = useState(null);
  const currentUser = userService.getCurrentUser();

  useEffect(() => {
    if (accessLevel === 'VIP' && storyId) {
      publicStoryService.getStoryById(storyId)
        .then(res => setStory(res.data))
        .catch(err => console.error(err));
    }
  }, [accessLevel, storyId]);

  const handleBuyChapter = async () => {
    if (!currentUser) {
      onLogin();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await coinService.purchaseChapter(chapterId);
      const meRes = await userService.getMe();
      if (meRes?.data) userService.updateCurrentUser(meRes.data);
      if (onPurchasedSuccess) onPurchasedSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể mua chương bằng xu. Vui lòng kiểm tra số dư xu.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBuyStory = async () => {
    if (!currentUser) {
      onLogin();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await coinService.purchaseStory(storyId);
      const meRes = await userService.getMe();
      if (meRes?.data) userService.updateCurrentUser(meRes.data);
      if (onPurchasedSuccess) onPurchasedSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể mua trọn bộ bằng xu. Vui lòng kiểm tra số dư xu.'));
    } finally {
      setLoading(false);
    }
  };

  if (accessLevel === 'MEMBER') {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '0.75rem',
        border: `1px dashed ${theme?.borderColor || '#1e3254'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '3rem' }}>🔒</span>
        <p style={{ color: theme?.subColor || '#a8bcd4', fontSize: '1rem' }}>Vui lòng đăng nhập để đọc chương này.</p>
        <button
          onClick={onLogin}
          className="btn-primary"
          style={{ padding: '0.6rem 1.5rem', borderRadius: '0.6rem', fontSize: '0.9rem' }}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  // VIP Access Level
  return (
    <div style={{
      padding: '2.5rem 2rem',
      background: 'linear-gradient(135deg, rgba(13, 27, 51, 0.95) 0%, rgba(17, 31, 58, 0.95) 100%)',
      borderRadius: '1rem',
      border: '1px solid rgba(167, 139, 250, 0.3)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      maxWidth: 580,
      margin: '2rem auto',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>👑</div>
      <h3 style={{ color: '#a78bfa', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Nội Dung Chương VIP
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Chương này dành riêng cho tài khoản VIP hoặc bạn có thể mở khóa bằng Xu.
      </p>

      {currentUser && (
        <div style={{
          background: 'rgba(10, 20, 36, 0.8)',
          border: '1px solid #1e3254',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#fbbf24',
          fontWeight: 700,
          fontFamily: 'monospace'
        }}>
          <span>🪙 Số dư Xu hiện có:</span>
          <span>{currentUser?.coins?.toLocaleString('vi-VN') || 0} xu</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.6rem 1rem',
          borderRadius: '0.6rem',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <button
          onClick={handleBuyChapter}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.6rem',
            border: '1px solid #8b5cf6',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <span>🪙 Mua đọc lẻ chương này bằng Xu</span>
        </button>

        {story?.coinPrice > 0 && (
          <button
            onClick={handleBuyStory}
            disabled={loading || story?.isPurchased}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.6rem',
              border: '1px solid #f59e0b',
              background: story?.isPurchased ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: story?.isPurchased ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 16px rgba(245,158,11,0.3)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span>🪙 {story?.isPurchased ? 'Đã mua trọn bộ truyện' : `Mua trọn bộ cả truyện (${story.coinPrice} xu)`}</span>
          </button>
        )}

        <button
          onClick={() => navigate('/account-settings?tab=plan')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.6rem',
            border: '1px solid #3b82f6',
            background: '#1d4ed8',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>✨ Nâng cấp Gói VIP Đọc Không Giới Hạn</span>
        </button>

        {!currentUser && (
          <button
            onClick={onLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              textDecoration: 'underline',
            }}
          >
            Hoặc Đăng nhập tài khoản của bạn
          </button>
        )}
      </div>
    </div>
  );
};

const AudioPlayer = ({
  src,
  onEnded,
  autoPlay,
  theme,
  initialTime = 0,
  onProgressUpdate,
  onPrevChapter,
  hasPrevChapter,
  onNextChapter,
  hasNextChapter,
  isContinuousPlay,
  setIsContinuousPlay,
  selectedVoice = 'FEMALE',
  onSelectVoice,
  onClosePlayer,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const hasRestoredTimeRef = useRef(false);
  const lastSavedTimeRef = useRef(0);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    hasRestoredTimeRef.current = false;
    lastSavedTimeRef.current = 0;
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);

      if (!hasRestoredTimeRef.current && initialTime > 0 && initialTime < audio.duration) {
        audio.currentTime = initialTime;
        setCurrentTime(initialTime);
        lastSavedTimeRef.current = Math.floor(initialTime);
        hasRestoredTimeRef.current = true;
      } else {
        setCurrentTime(audio.currentTime);
      }

      if (autoPlay) {
        audio.play().catch((e) => console.error('Autoplay failed:', e));
        setIsPlaying(true);
      }
    };

    const setAudioTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      const sec = Math.floor(time);
      if (Math.abs(sec - lastSavedTimeRef.current) >= 2) {
        lastSavedTimeRef.current = sec;
        if (onProgressUpdate) {
          onProgressUpdate(sec);
        }
      }
    };

    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) {
        onEnded();
      }
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src, autoPlay, initialTime, onEnded, onProgressUpdate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      if (onProgressUpdate) {
        onProgressUpdate(Math.floor(audioRef.current.currentTime));
      }
    } else {
      audioRef.current.play().catch((e) => console.error(e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    setCurrentTime(val);
    if (onProgressUpdate) {
      onProgressUpdate(Math.floor(val));
    }
  };

  const handleSkip = (amount) => {
    if (audioRef.current) {
      const newTime = Math.min(Math.max(audioRef.current.currentTime + amount, 0), duration || 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      if (onProgressUpdate) {
        onProgressUpdate(Math.floor(newTime));
      }
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const handleVolumeSliderChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (audioRef.current.muted && newVolume > 0) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {(showOptionsMenu || showSpeedMenu) && (
        <div
          onClick={() => {
            setShowOptionsMenu(false);
            setShowSpeedMenu(false);
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 199 }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          width: 'calc(100% - 2rem)',
          maxWidth: '680px',
          background: 'rgba(18, 24, 38, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '1.25rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          padding: '0.85rem 1.25rem 0.75rem 1.25rem',
          color: '#e2e8f0',
          fontFamily: 'Inter, system-ui, sans-serif',
          userSelect: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <audio ref={audioRef} src={src}></audio>

        {/* Progress bar line on top of card */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '2px',
            marginBottom: '0.65rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: '2px',
              transition: 'width 0.1s linear',
            }}
          />
          <input
            type="range"
            min="0"
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              position: 'absolute',
              top: '-6px',
              left: 0,
              width: '100%',
              height: '16px',
              opacity: 0,
              cursor: 'pointer',
              margin: 0,
            }}
          />
        </div>

        {/* Main control row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          
          {/* Left: Voice Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
            <button
              onClick={() => {
                setShowVoiceMenu(!showVoiceMenu);
                setShowOptionsMenu(false);
                setShowSpeedMenu(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: showVoiceMenu ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '9999px',
                padding: '0.35rem 0.85rem',
                color: showVoiceMenu ? '#60a5fa' : '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
              title="Chọn giọng đọc AI"
            >
              <span>{selectedVoice === 'MALE' ? 'Nam Minh (nam)' : 'Hoài My (nữ)'}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▾</span>
            </button>

            {showVoiceMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '0.4rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  minWidth: '150px',
                  zIndex: 210,
                }}
              >
                <button
                  onClick={() => {
                    if (onSelectVoice) onSelectVoice('FEMALE');
                    setShowVoiceMenu(false);
                  }}
                  style={{
                    background: selectedVoice === 'FEMALE' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                    color: selectedVoice === 'FEMALE' ? '#60a5fa' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: selectedVoice === 'FEMALE' ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>👩</span> Hoài My (nữ)
                </button>
                <button
                  onClick={() => {
                    if (onSelectVoice) onSelectVoice('MALE');
                    setShowVoiceMenu(false);
                  }}
                  style={{
                    background: selectedVoice === 'MALE' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                    color: selectedVoice === 'MALE' ? '#60a5fa' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: selectedVoice === 'MALE' ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>👨</span> Nam Minh (nam)
                </button>
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Previous Chapter Button */}
            <button
              onClick={onPrevChapter}
              disabled={!hasPrevChapter}
              title={hasPrevChapter ? 'Chương trước' : 'Chương đầu tiên'}
              style={{
                background: 'none',
                border: 'none',
                color: hasPrevChapter ? '#cbd5e1' : '#475569',
                fontSize: '1rem',
                cursor: hasPrevChapter ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem',
                borderRadius: '50%',
                opacity: hasPrevChapter ? 1 : 0.4,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (hasPrevChapter) e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                if (hasPrevChapter) e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <FaStepBackward style={{ fontSize: '0.95rem' }} />
            </button>

            {/* Skip -5s */}
            <button
              onClick={() => handleSkip(-5)}
              title="Tua lùi 5s"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.4rem',
                borderRadius: '50%',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <FaUndo style={{ fontSize: '0.85rem' }} />
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 600 }}>5s</span>
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={togglePlay}
              title={isPlaying ? 'Tạm dừng' : 'Phát audio'}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                border: 'none',
                color: '#ffffff',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                transition: 'transform 0.15s ease, boxShadow 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isPlaying ? <FaPause style={{ marginLeft: 0 }} /> : <FaPlay style={{ marginLeft: '2px' }} />}
            </button>

            {/* Skip +5s */}
            <button
              onClick={() => handleSkip(5)}
              title="Tua tới 5s"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.4rem',
                borderRadius: '50%',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 600 }}>5s</span>
              <FaRedo style={{ fontSize: '0.85rem' }} />
            </button>

            {/* Next Chapter Button */}
            <button
              onClick={onNextChapter}
              disabled={!hasNextChapter}
              title={hasNextChapter ? 'Chương tiếp theo' : 'Hết chương'}
              style={{
                background: 'none',
                border: 'none',
                color: hasNextChapter ? '#cbd5e1' : '#475569',
                fontSize: '1rem',
                cursor: hasNextChapter ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem',
                borderRadius: '50%',
                opacity: hasNextChapter ? 1 : 0.4,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (hasNextChapter) e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                if (hasNextChapter) e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <FaStepForward style={{ fontSize: '0.95rem' }} />
            </button>
          </div>

          {/* Right: Time, Speed, Options, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
            
            {/* Time indicator */}
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#94a3b8',
                marginRight: '0.25rem',
                display: 'inline-block',
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Speed Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowOptionsMenu(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.65rem',
                  color: '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <span>{playbackRate}x</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▾</span>
              </button>

              {showSpeedMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    padding: '0.35rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    minWidth: '70px',
                    zIndex: 210,
                  }}
                >
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      style={{
                        background: playbackRate === rate ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                        color: playbackRate === rate ? '#60a5fa' : '#cbd5e1',
                        border: 'none',
                        borderRadius: '0.4rem',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: playbackRate === rate ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3-Dot Options Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowOptionsMenu(!showOptionsMenu);
                  setShowSpeedMenu(false);
                }}
                title="Tùy chọn khác"
                style={{
                  background: showOptionsMenu ? 'rgba(255, 255, 255, 0.15)' : 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '0.95rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <FaEllipsisV />
              </button>

              {showOptionsMenu && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    padding: '0.85rem 1rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    minWidth: '210px',
                    zIndex: 210,
                  }}
                >
                  {/* Continuous Play Toggle */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FaForward style={{ color: '#60a5fa', fontSize: '0.75rem' }} />
                      Nghe liên tục
                    </span>
                    <input
                      type="checkbox"
                      checked={isContinuousPlay}
                      onChange={(e) => setIsContinuousPlay(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </label>

                  {/* Volume Slider */}
                  <div style={{ borderTop: '1px solid #334155', paddingTop: '0.65rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                      }}
                    >
                      <span>Âm lượng</span>
                      <button
                        onClick={toggleMute}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeSliderChange}
                      style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClosePlayer}
              title="Đóng trình phát audio"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.95rem',
                padding: '0.4rem',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


export default function PublicChapterDetailPage() {
  const { storyId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = userService.getCurrentUser();
  const [chapter, setChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [accessLevel, setAccessLevel] = useState('PUBLIC');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisError, setSynthesisError] = useState('');
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [initialAudioPosition, setInitialAudioPosition] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('FEMALE');

  const [search, setSearch] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  // Reading Settings state (persisted in localStorage)
  const [readingSettings, setReadingSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('reading_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleUpdateReadingSettings = (newSettings) => {
    setReadingSettings(newSettings);
    try {
      localStorage.setItem('reading_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save reading settings', e);
    }
  };

  const currentTheme = READING_THEMES[readingSettings.theme] || READING_THEMES.night;
  const currentFontFamily = FONT_FAMILIES.find((f) => f.id === readingSettings.fontFamily)?.family || 'sans-serif';

  useEffect(() => {
    const handleStorageChange = () => {
        setLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const fetchChapter = async () => {
    setIsLoading(true);
    setError('');
    setIsLocked(false);
    setChapter(null);
    setAutoPlay(location.state?.autoPlay || false);

    try {
      const response = await publicStoryService.getChapterById(storyId, chapterId);
      const fetchedChapter = response.data;
      setChapter(fetchedChapter);

      // Saved position from backend OR user-scoped localStorage
      const userId = currentUser?.id || 'guest';
      const localSaved = parseInt(localStorage.getItem(`audio_progress_${userId}_${chapterId}`) || '0', 10);
      const savedPos = Math.max(fetchedChapter.lastPosition || 0, localSaved || 0);
      setInitialAudioPosition(savedPos);

      if (location.state?.autoPlay && !fetchedChapter.audio) {
          handleSynthesize(true);
      }

      publicStoryService.recordChapterView(chapterId).catch(err => console.error("Failed to record chapter view:", err));
    } catch (err) {
      const errCode = getErrorCode(err);
      if (err.response?.status === 403 || errCode === 'VIP_REQUIRED' || errCode === 'MEMBER_REQUIRED') {
          setIsLocked(true);
          if (errCode === 'VIP_REQUIRED' || err.response?.data?.message?.includes('VIP')) {
              setAccessLevel('VIP');
          } else {
              setAccessLevel('MEMBER');
          }
      } else {
          setError(getErrorMessage(err, 'Không thể tải nội dung chương. Vui lòng thử lại.'));
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapter();
  }, [storyId, chapterId, location.state]);

  const handleNavigate = (newChapterId, options = {}) => {
    if (newChapterId) {
      navigate(`/stories/${storyId}/chapters/${newChapterId}`, options);
    }
  };

  const handleSelectChapter = (selectedChapterId) => {
    setIsModalOpen(false);
    handleNavigate(selectedChapterId);
  };

  const handleSynthesize = async (shouldAutoPlay = false, voiceGender = selectedVoice) => {
    setIsSynthesizing(true);
    setSynthesisError('');
    try {
      const response = await publicStoryService.synthesizeChapter(storyId, chapterId, voiceGender);
      const newFilePath = response.data.filePath;
      const genderKey = response.data.voiceGender || voiceGender;

      setChapter(prevChapter => ({
        ...prevChapter,
        audio: newFilePath,
        audios: {
          ...(prevChapter?.audios || {}),
          [genderKey]: newFilePath,
        }
      }));
      setSelectedVoice(genderKey);
      setShowAudioPlayer(true);
      if (shouldAutoPlay) {
        setAutoPlay(true);
      }
    } catch (err) {
      setSynthesisError(getErrorMessage(err, 'Không thể tạo audio. Vui lòng thử lại.'));
      console.error("Failed to synthesize chapter:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSelectVoice = (gender) => {
    setSelectedVoice(gender);
    const existingAudio = chapter?.audios?.[gender];
    if (existingAudio) {
      setChapter(prev => ({
        ...prev,
        audio: existingAudio
      }));
      setAutoPlay(true);
      setShowAudioPlayer(true);
    } else {
      handleSynthesize(true, gender);
    }
  };

  const handleAudioProgressUpdate = (second) => {
    if (!chapterId || second < 0) return;
    const userId = currentUser?.id || 'guest';
    localStorage.setItem(`audio_progress_${userId}_${chapterId}`, second.toString());
    const hasToken = !!localStorage.getItem('token');
    if (hasToken) {
      publicStoryService.saveChapterProgress(chapterId, second).catch(err => {
        console.error("Failed to save audio progress position:", err);
      });
    }
  };

  const handleAudioEnded = () => {
    const userId = currentUser?.id || 'guest';
    localStorage.removeItem(`audio_progress_${userId}_${chapterId}`);
    const hasToken = !!localStorage.getItem('token');
    if (hasToken) {
      publicStoryService.saveChapterProgress(chapterId, 0).catch(err => console.error(err));
    }
    if (isContinuousPlay && chapter?.nextChapterId) {
        handleNavigate(chapter.nextChapterId, { state: { autoPlay: true } });
    }
  };

  if (isLoading) {
    return (
        <div style={{ background: currentTheme.bg, color: currentTheme.text, minHeight: '100vh', transition: 'all 0.3s ease' }}>
            <HomeNavbar search={search} setSearch={setSearch} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            <div style={{ color: currentTheme.buttonText, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>Đang tải chương...</div>
        </div>
    );
  }

  if (error) {
    return (
        <div style={{ background: currentTheme.bg, color: currentTheme.text, minHeight: '100vh', transition: 'all 0.3s ease' }}>
            <HomeNavbar search={search} setSearch={setSearch} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            <div style={{ color: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>{error}</div>
        </div>
    );
  }

  return (
    <div style={{ background: currentTheme.bg, color: currentTheme.text, minHeight: '100vh', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
        <HomeNavbar
            search={search}
            setSearch={setSearch}
            loggedIn={loggedIn}
            setLoggedIn={(value) => {
                if (!value) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setLoggedIn(false);
                    navigate('/login');
                }
            }}
        />

      {/* Top-Right Customization Button */}
      <ReadingSettings settings={readingSettings} onUpdateSettings={handleUpdateReadingSettings} />

      {/* Top-Right Audio Button (placed directly below Tùy chỉnh button) */}
      {!isLocked && chapter && (
        <button
          onClick={() => {
            if (!chapter.audio) {
              handleSynthesize(true);
            } else {
              setShowAudioPlayer(true);
            }
          }}
          disabled={isSynthesizing}
          title="Nghe audio truyện bằng AI"
          style={{
            position: 'fixed',
            top: '128px',
            right: '24px',
            zIndex: 90,
            background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '2rem',
            padding: '0.55rem 1.1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
            cursor: isSynthesizing ? 'not-allowed' : 'pointer',
            opacity: isSynthesizing ? 0.7 : 1,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isSynthesizing) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            if (!isSynthesizing) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '0.95rem' }}>🎧</span>
          <span>{isSynthesizing ? 'Đang tạo audio...' : 'Nghe truyện'}</span>
        </button>
      )}

      <div style={{ maxWidth: readingSettings.maxWidth, margin: '0 auto', padding: '2.5rem 1.5rem', transition: 'max-width 0.3s ease' }}>
        
        {isLocked ? (
            <LockedContent
              accessLevel={accessLevel}
              storyId={storyId}
              chapterId={chapterId}
              onLogin={() => navigate('/login')}
              theme={currentTheme}
              onPurchasedSuccess={fetchChapter}
            />
        ) : chapter && (
            <>
                <h1
                style={{
                    fontFamily: currentFontFamily,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: currentTheme.titleColor,
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    transition: 'color 0.3s ease',
                }}
                >
                Chương {chapter.chapterNumber}
                </h1>
                <h2
                style={{
                    fontFamily: currentFontFamily,
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    color: currentTheme.subColor,
                    textAlign: 'center',
                    marginBottom: '2.5rem',
                    transition: 'color 0.3s ease',
                }}
                >
                {chapter.title}
                </h2>

                {synthesisError && (
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fecaca' }}>
                    {synthesisError}
                  </div>
                )}

                {chapter.audio && showAudioPlayer && (
                  <AudioPlayer 
                    src={chapter.audio.startsWith('http') ? chapter.audio : `${chapter.audio}`}
                    onEnded={handleAudioEnded}
                    autoPlay={autoPlay}
                    theme={currentTheme}
                    initialTime={initialAudioPosition}
                    onProgressUpdate={handleAudioProgressUpdate}
                    onPrevChapter={() => handleNavigate(chapter?.previousChapterId, { state: { autoPlay: true } })}
                    hasPrevChapter={!!chapter?.previousChapterId}
                    onNextChapter={() => handleNavigate(chapter?.nextChapterId, { state: { autoPlay: true } })}
                    hasNextChapter={!!chapter?.nextChapterId}
                    isContinuousPlay={isContinuousPlay}
                    setIsContinuousPlay={setIsContinuousPlay}
                    selectedVoice={selectedVoice}
                    onSelectVoice={handleSelectVoice}
                    onClosePlayer={() => setShowAudioPlayer(false)}
                  />
                )}

                <div
                  className="read-content"
                  style={{
                    fontSize: `${readingSettings.fontSize}px`,
                    fontFamily: currentFontFamily,
                    lineHeight: readingSettings.lineHeight,
                    color: currentTheme.text,
                    transition: 'all 0.2s ease',
                  }}
                  dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br />') }}
                />
            </>
        )}

        {!isLocked && chapter && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '3.5rem',
              paddingTop: '2rem',
              borderTop: `1px solid ${currentTheme.borderColor}`,
              width: '100%',
            }}
          >
            {/* Left: Previous Chapter */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={() => handleNavigate(chapter.previousChapterId)}
                disabled={!chapter.previousChapterId}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '0.6rem',
                  border: `1px solid ${currentTheme.borderColor}`,
                  background: chapter.previousChapterId ? currentTheme.buttonBg : 'transparent',
                  color: chapter.previousChapterId ? currentTheme.buttonText : currentTheme.subColor,
                  cursor: chapter.previousChapterId ? 'pointer' : 'default',
                  fontSize: '0.88rem',
                  fontFamily: currentFontFamily,
                  opacity: chapter.previousChapterId ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                ← Chương trước
              </button>
            </div>

            {/* Center: Chapter List Modal */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '0.6rem',
                  border: `1px solid ${currentTheme.borderColor}`,
                  background: currentTheme.buttonBg,
                  color: currentTheme.buttonText,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontFamily: currentFontFamily,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                ☰ Danh sách chương
              </button>
            </div>

            {/* Right: Next Chapter */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleNavigate(chapter.nextChapterId)}
                disabled={!chapter.nextChapterId}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '0.6rem',
                  border: `1px solid ${currentTheme.borderColor}`,
                  background: chapter.nextChapterId ? currentTheme.buttonBg : 'transparent',
                  color: chapter.nextChapterId ? currentTheme.buttonText : currentTheme.subColor,
                  cursor: chapter.nextChapterId ? 'pointer' : 'default',
                  fontSize: '0.88rem',
                  fontFamily: currentFontFamily,
                  opacity: chapter.nextChapterId ? 1 : 0.4,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                Chương sau →
              </button>
            </div>
          </div>
        )}
      </div>
      {chapter && <ChapterListModal
        storyId={storyId}
        currentChapterId={chapterId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectChapter={handleSelectChapter}
      />}
    </div>
  );
}