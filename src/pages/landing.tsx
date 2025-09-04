import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectLogo } from '@/components/auth/ProjectLogo';
import { useUserStore } from '@/stores/userStore';

function Landing() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const playerRef = useRef(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    audioRef.current = new Audio('/audios/background-music.webm');
    audioRef.current.loop = true;
    audioRef.current.muted = true;
    audioRef.current.load();

    audioRef.current.addEventListener('canplaythrough', () => {
      setAudioReady(true);
      const playPromise = audioRef.current?.play();
      if (playPromise) playPromise.catch(e => console.log("Autoplay initial empêché:", e));
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPaused) {
      audio.pause();
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Lecture audio empêchée:", error);
        });
      }
    }
  }, [isPaused]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;
  }, [isMuted]);

  const syncAudioWithVideo = () => {
    if (playerRef.current && audioRef.current) {
      const videoTime = (playerRef.current as any).getCurrentTime(); 
      if (Math.abs(audioRef.current.currentTime - videoTime) > 0.3) {
        audioRef.current.currentTime = videoTime;
      }
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current && !isPaused && audioReady) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.play().catch(e => console.log("Lecture empêchée:", e));
      } else {
        audioRef.current.muted = true;
      }
    }
    setIsMuted(!isMuted);
  };

  const handlePlayPauseToggle = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-yellow-500/20 z-0"></div>

      <div className="absolute inset-0 bg-black/60 z-[1]"></div>

      <div className="absolute inset-0 z-[-2]">
        <ReactPlayer
          ref={playerRef}
          url={[
            '/videos/background.webm',
            '/videos/background.mp4'
          ]}
          playing={!isPaused}
          loop={true}
          muted={true}
          width="100%"
          height="100%"
          playsinline={true}
          onProgress={syncAudioWithVideo}
          config={{
            file: {
              attributes: {
                style: {
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }
              }
            }
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between p-8">

        <div className="flex items-start justify-between">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-2">
            <ProjectLogo />
          </div>

          <div className="flex gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                className="w-32 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white"
              >
                Connexion
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                variant="ghost"
                className="w-32 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white"
              >
                Inscription
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center text-center -mt-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            Luxentis <span className="text-yellow-400">1.21.4</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mb-12">
            Rejoignez notre serveur Minecraft et plongez dans une expérience économique immersive.
            Construisez votre empire financier et imposez-vous comme le capitaliste ultime.
          </p>

          <Link to="/signup">
            <Button 
              className="px-12 py-7 text-2xl rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-all duration-300 
                     hover:shadow-[0_0_15px_rgba(250,204,21,0.7)] transform hover:scale-105 shiny-button"
            >
              Commencer
            </Button>
          </Link>

          <div className="flex mt-8 gap-4">
            <a href="https://discord.gg/" target="_blank" rel="noreferrer"
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg 
                         flex items-center justify-center transition-all duration-300">
              <svg width="24" height="24" viewBox="0 -28.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
                <g>
                  <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#5865F2" fill-rule="nonzero">
                  </path>
                </g>
              </svg>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noreferrer"
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg 
                         flex items-center justify-center transition-all duration-300">
              <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799"><path fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z" /></svg>
            </a>
            <a href="https://youtube.com/" target="_blank" rel="noreferrer"
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg 
                         flex items-center justify-center transition-all duration-300">
              <svg height="24" width="24" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 461.001 461.001" xmlBase="preserve">
                <g>
                  <path fill="#F61C0D" d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728
		c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137
		C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607
		c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/>
                </g>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="text-white/70 text-sm">
            © 2025 Luxentis - Tous droits réservés
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="w-12 h-12 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md p-0"
              onClick={handleMuteToggle}
            >
              {isMuted ?
                <VolumeX className="w-5 h-5 text-white" /> :
                <Volume2 className="w-5 h-5 text-white" />
              }
            </Button>

            <Button
              variant="ghost"
              className="w-12 h-12 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md p-0"
              onClick={handlePlayPauseToggle}
            >
              {isPaused ?
                <Play className="w-5 h-5 text-white" /> :
                <Pause className="w-5 h-5 text-white" />
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing; 