import { useCallback, useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { CakeStackCanvas } from './components/CakeStackCanvas';
import { CAKE_FLAVORS, getFlavorForLayer } from './constants/cakes';
import type { GameHudSnapshot, GameState } from './types/game';
import { soundFX } from './utils/sound';

const BEST_SCORE_STORAGE_KEY = 'cake_stack_best_score_v1';
const BEST_LAYERS_STORAGE_KEY = 'cake_stack_best_layers_v1';

function readStoredInt(key: string): number {
  try {
    const val = localStorage.getItem(key);
    const parsed = val ? parseInt(val, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [resetSignal, setResetSignal] = useState(0);
  const [pauseSecondsLeft, setPauseSecondsLeft] = useState<number>(10);
  const [muted, setMuted] = useState<boolean>(() => soundFX.isMuted());
  const [bestScore, setBestScore] = useState<number>(() => readStoredInt(BEST_SCORE_STORAGE_KEY));
  const [bestLayers, setBestLayers] = useState<number>(() => readStoredInt(BEST_LAYERS_STORAGE_KEY));

  const [hud, setHud] = useState<GameHudSnapshot>(() => ({
    score: 0,
    layers: 0,
    bestScore: readStoredInt(BEST_SCORE_STORAGE_KEY),
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    currentWidthPct: 100,
    currentFlavor: getFlavorForLayer(1),
    stackedFlavors: [],
    isNewRecord: false,
  }));

  const handleHudUpdate = useCallback((snapshot: GameHudSnapshot) => {
    setHud(snapshot);
  }, []);

  const handleGameOver = useCallback(
    (finalSnapshot: GameHudSnapshot) => {
      setHud(finalSnapshot);
      soundFX.stopBgm(true);
      if (finalSnapshot.score > bestScore) {
        setBestScore(finalSnapshot.score);
        try {
          localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(finalSnapshot.score));
        } catch {
          // ignore storage failure
        }
      }
      if (finalSnapshot.layers > bestLayers) {
        setBestLayers(finalSnapshot.layers);
        try {
          localStorage.setItem(BEST_LAYERS_STORAGE_KEY, String(finalSnapshot.layers));
        } catch {
          // ignore storage failure
        }
      }
      setGameState('GAME_OVER');
    },
    [bestLayers, bestScore]
  );

  const startNewGame = () => {
    soundFX.unlock();
    setResetSignal((prev) => prev + 1);
    setPauseSecondsLeft(10);
    setGameState('PLAYING');
    soundFX.startBgm(true);
  };

  const enterPause = useCallback(() => {
    setPauseSecondsLeft(10);
    setGameState('PAUSED');
    soundFX.stopBgm(false);
  }, []);

  const resumeFromPause = useCallback(() => {
    setGameState('PLAYING');
    soundFX.resumeBgmIfNeeded();
  }, []);

  const togglePause = () => {
    if (gameState === 'PLAYING') {
      enterPause();
    } else if (gameState === 'PAUSED') {
      resumeFromPause();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.setMuted(next);
    if (!next && gameState === 'PLAYING') {
      soundFX.startBgm(false);
    }
  };

  // 10-second auto-resume countdown while paused
  useEffect(() => {
    if (gameState !== 'PAUSED') return;

    const timer = window.setInterval(() => {
      setPauseSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setGameState('PLAYING');
          soundFX.resumeBgmIfNeeded();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState]);

  // Allow Escape / P to pause or resume during play
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
          enterPause();
        } else if (gameState === 'PAUSED') {
          resumeFromPause();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enterPause, gameState, resumeFromPause]);

  // Cleanup BGM on unmount
  useEffect(() => {
    return () => {
      soundFX.stopBgm(true);
    };
  }, []);

  const recentLayers = [...hud.stackedFlavors].reverse().slice(0, 8);

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#F7EFE5] text-[#2D1E17] flex flex-col lg:flex-row">
      {/* Desktop Left Panel: Brand & Tower Flavor Ledger */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col justify-between px-7 py-8 border-r border-[#E4D6C5] bg-[#FAF4EC]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#2D1E17]">
            層層甜點塔
          </h1>
          <p className="mt-1 text-sm text-[#6E5648]">
            Cake Stack Patisserie
          </p>

          <div className="mt-8 pt-6 border-t border-[#E4D6C5]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-[#2D1E17]">目前疊層紀錄</h2>
              <span className="font-mono-num text-xs text-[#7D6354]">
                {hud.layers} 層
              </span>
            </div>

            {recentLayers.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-[#876E5E]">
                等待第一塊草莓蛋糕落到檯面上建立底座。
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#EAE0D2]">
                {recentLayers.map((item) => (
                  <li
                    key={item.layer}
                    className="py-2.5 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0 border border-[#2D1E17]/15"
                        style={{ backgroundColor: item.flavor.dripColor }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-[#2D1E17]">
                        {item.layer}. {item.flavor.nameZh}
                      </span>
                    </div>
                    <span className="font-mono-num text-xs text-[#6E5648] shrink-0">
                      {item.isPerfect ? '完美' : `${item.widthPct}%`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-[#E4D6C5] text-xs leading-relaxed text-[#7D6354] space-y-1.5">
          <p className="font-semibold text-[#4A3529]">操作說明</p>
          <p>點擊遊戲畫面或按下空白鍵，釋放上方鐘擺繩索上的蛋糕。</p>
          <p>未對齊下方邊緣的部分將會被切掉，完全沒疊到即結束遊戲。</p>
        </div>
      </aside>

      {/* Center Stage: Full-bleed on Mobile, Crisp Studio Column on Desktop */}
      <main className="relative flex-1 h-full flex justify-center bg-[#EFE4D6]">
        <div className="relative w-full lg:max-w-[500px] h-full lg:border-x lg:border-[#DFCBB5] overflow-hidden shadow-none lg:shadow-sm">
          {/* Unobtrusive Top HUD (Compact, ~54px, well below 15% mobile cap) */}
          <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-[max(8px,env(safe-area-inset-top))] pb-2 flex items-center justify-between bg-[#FFFDF9]/85 backdrop-blur-sm border-b border-[#E4D6C5]/80">
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-[11px] font-medium text-[#6E5648] block leading-none">
                  分數 / 層數
                </span>
                <div className="font-mono-num text-xl font-bold text-[#2D1E17] leading-tight mt-0.5">
                  {hud.score}
                  <span className="text-sm font-medium text-[#7D6354] ml-1.5">
                    / {hud.layers}層
                  </span>
                </div>
              </div>
              {hud.combo > 0 && gameState === 'PLAYING' && (
                <span className="text-xs font-bold text-[#B45309] font-mono-num">
                  · 連擊 ×{hud.combo}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <div className="hidden sm:flex lg:hidden items-center gap-1.5 mr-2 text-xs text-[#6E5648] font-mono-num">
                <span>最高 {Math.max(bestScore, hud.score)}</span>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#3D2920] hover:bg-[#EFE4D6]/70 transition-colors focus-visible:outline-2 focus-visible:outline-[#E11D48] cursor-pointer"
                aria-label={muted ? '開啟音效' : '靜音'}
                title={muted ? '開啟音效' : '靜音'}
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                <button
                  type="button"
                  onClick={togglePause}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#3D2920] hover:bg-[#EFE4D6]/70 transition-colors focus-visible:outline-2 focus-visible:outline-[#E11D48] cursor-pointer"
                  aria-label={gameState === 'PAUSED' ? '繼續遊戲' : '暫停遊戲'}
                  title={gameState === 'PAUSED' ? '繼續遊戲' : '暫停遊戲'}
                >
                  {gameState === 'PAUSED' ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    <Pause className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </header>

          {/* Subtle bottom thumb-zone tap prompt before first layer lands */}
          {gameState === 'PLAYING' && hud.layers === 0 && (
            <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center pointer-events-none">
              <p className="text-xs font-medium text-[#5C4438] bg-[#FFFDF9]/80 backdrop-blur-sm px-4 py-1.5 rounded-lg border border-[#2D1E17]/10">
                點擊畫面任意處放下第一層蛋糕
              </p>
            </div>
          )}

          {/* 2D Interactive Canvas */}
          <CakeStackCanvas
            gameState={gameState}
            resetSignal={resetSignal}
            bestScore={bestScore}
            onHudUpdate={handleHudUpdate}
            onGameOver={handleGameOver}
          />

          {/* TITLE MENU OVERLAY */}
          {gameState === 'TITLE_MENU' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#2D1E17]/20 backdrop-blur-[2px]">
              <div className="w-full max-w-sm rounded-2xl bg-[#FFFDF9] p-7 shadow-xl border border-[#E4D6C5]">
                <p className="text-xs font-medium text-[#9F1239]">
                  2D 甜點疊疊樂
                </p>
                <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#2D1E17] text-balance">
                  層層甜點塔
                </h2>

                {bestScore > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#6E5648] font-mono-num">
                    <span>最高紀錄 {bestScore} 分</span>
                    <span aria-hidden="true">·</span>
                    <span>最高 {bestLayers} 層</span>
                  </div>
                )}

                <ol className="mt-5 space-y-2.5 text-sm text-[#4A3529] border-t border-[#EEE3D5] pt-5">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono-num font-bold text-[#9F1239]">01.</span>
                    <span>上方繩索會帶動蛋糕進行鐘擺左右擺盪。</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono-num font-bold text-[#9F1239]">02.</span>
                    <span>抓準時機點擊螢幕，讓蛋糕垂直落到下方疊高。</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono-num font-bold text-[#9F1239]">03.</span>
                    <span>超出下層邊緣會被削去，完全沒疊到就結束遊戲。</span>
                  </li>
                </ol>

                <button
                  type="button"
                  onClick={startNewGame}
                  className="mt-6 w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.98] text-white font-semibold text-base transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
                >
                  開始遊戲
                </button>
              </div>
            </div>
          )}

          {/* PAUSED OVERLAY (10-second temporary pause countdown) */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#2D1E17]/35 backdrop-blur-xs">
              <div className="w-full max-w-xs rounded-2xl bg-[#FFFDF9] p-6 shadow-xl border border-[#E4D6C5] text-center">
                <h2 className="font-display text-2xl font-bold text-[#2D1E17]">暫時停止遊戲</h2>
                <p className="mt-1.5 text-sm text-[#6E5648] font-mono-num">
                  目前 {hud.score} 分 · 已疊 {hud.layers} 層
                </p>

                <div className="mt-4 py-3 border-y border-[#EEE3D5]">
                  <span className="font-mono-num text-4xl font-bold text-[#E11D48]">
                    {pauseSecondsLeft}
                  </span>
                  <span className="block mt-1 text-xs text-[#6E5648]">
                    秒後自動繼續遊戲
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={resumeFromPause}
                    className="w-full min-h-[48px] px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.98] text-white font-semibold text-sm transition-all whitespace-nowrap cursor-pointer"
                  >
                    立即繼續
                  </button>
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F4ECE1] hover:bg-[#EADDCB] text-[#2D1E17] font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
                  >
                    重新開始
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#2D1E17]/40 backdrop-blur-xs">
              <div className="w-full max-w-sm rounded-2xl bg-[#FFFDF9] p-7 shadow-xl border border-[#E4D6C5]">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-2xl font-bold text-[#2D1E17]">
                    甜點塔完成
                  </h2>
                  {hud.isNewRecord && (
                    <span className="text-xs font-bold text-[#B45309]">
                      新紀錄達成
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 py-4 border-y border-[#EEE3D5]">
                  <div>
                    <span className="text-xs text-[#7D6354] block">最終分數</span>
                    <span className="font-mono-num text-3xl font-bold text-[#2D1E17]">
                      {hud.score}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[#7D6354] block">疊高層數</span>
                    <span className="font-mono-num text-3xl font-bold text-[#2D1E17]">
                      {hud.layers}
                      <span className="text-sm font-medium text-[#7D6354] ml-1">層</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#5C4438]">
                  <div className="flex items-center justify-between">
                    <span>最高紀錄</span>
                    <span className="font-mono-num font-semibold text-[#2D1E17]">
                      {Math.max(bestScore, hud.score)} 分 · {Math.max(bestLayers, hud.layers)} 層
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>完美對齊次數</span>
                    <span className="font-mono-num font-semibold text-[#2D1E17]">
                      {hud.perfectCount} 次
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>最高連擊</span>
                    <span className="font-mono-num font-semibold text-[#2D1E17]">
                      ×{hud.maxCombo}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startNewGame}
                  className="mt-6 w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E11D48]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>再玩一次</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Desktop Right Panel: Live Telemetry & Flavor Catalog */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col justify-between px-7 py-8 border-l border-[#E4D6C5] bg-[#FAF4EC]">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-[#2D1E17]">即時狀態</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between py-2 border-b border-[#EAE0D2]">
                <span className="text-[#6E5648]">最高紀錄</span>
                <span className="font-mono-num font-bold text-[#2D1E17]">
                  {Math.max(bestScore, hud.score)} 分
                </span>
              </div>
              <div className="flex items-baseline justify-between py-2 border-b border-[#EAE0D2]">
                <span className="text-[#6E5648]">目前蛋糕寬度</span>
                <span className="font-mono-num font-bold text-[#2D1E17]">
                  {hud.currentWidthPct}%
                </span>
              </div>
              <div className="flex items-baseline justify-between py-2 border-b border-[#EAE0D2]">
                <span className="text-[#6E5648]">完美對齊</span>
                <span className="font-mono-num font-bold text-[#2D1E17]">
                  {hud.perfectCount} 次
                </span>
              </div>
              <div className="flex items-baseline justify-between py-2 border-b border-[#EAE0D2]">
                <span className="text-[#6E5648]">下一層口味</span>
                <span className="font-medium text-[#2D1E17]">
                  {hud.currentFlavor.nameZh}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#2D1E17]">甜點口味輪替</h2>
            <ul className="mt-3 space-y-2">
              {CAKE_FLAVORS.map((flavor) => {
                const isNext = flavor.id === hud.currentFlavor.id;
                return (
                  <li
                    key={flavor.id}
                    className={`flex items-center justify-between text-xs py-1 ${
                      isNext ? 'font-bold text-[#9F1239]' : 'text-[#6E5648]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-xs border border-[#2D1E17]/15"
                        style={{ backgroundColor: flavor.dripColor }}
                        aria-hidden="true"
                      />
                      <span>{flavor.nameZh}</span>
                    </span>
                    <span className="text-[11px] opacity-80">{flavor.nameEn}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E4D6C5] text-xs text-[#7D6354] space-y-1">
          <p>配樂：青花瓷（古箏演奏合成）</p>
          <p>疊至第 5 層觸發掌聲鼓勵，之後每層皆有好棒喝采。</p>
        </div>
      </aside>
    </div>
  );
}
