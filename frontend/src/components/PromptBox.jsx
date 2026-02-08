import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import GlassContainer from "./GlassContainer.jsx";
import { useUiStore } from "../store/uiStore.js";
import { EASE_OUT_QUINT } from "../utils/motion.js";
import { validatePrompt } from "../utils/validators.js";

export default function PromptBox() {
  const prompt = useUiStore((state) => state.prompt);
  const setPrompt = useUiStore((state) => state.setPrompt);
  const generating = useUiStore((state) => state.generating);
  const generate = useUiStore((state) => state.generate);
  const textareaRef = useRef(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(280, element.scrollHeight)}px`;
  }, [prompt]);

  const validation = useMemo(() => validatePrompt(prompt), [prompt]);
  const disabled = generating || !prompt.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.46, ease: EASE_OUT_QUINT }}
    >
      <GlassContainer className="glass-breathe p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-white/70">Prompt</span>
              <span className="tabular-nums text-white/55">{prompt.length.toLocaleString()} / 4000</span>
            </div>

            <div className="glass-input-wrap rounded-2xl p-3">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                disabled={generating}
                rows={3}
                placeholder="Describe your system or process..."
                className="glass-textarea min-h-[100px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-white/90 outline-none placeholder:text-white/40"
              />
            </div>

            <p className="mt-2 text-xs text-white/60">
              {validation.ok ? "Natural language input with auto-layout generation." : validation.message}
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={disabled ? undefined : { y: -2 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.44, ease: EASE_OUT_QUINT }}
            onClick={() => generate()}
            disabled={disabled}
            className={[
              "glass-button-primary relative inline-flex min-h-[54px] min-w-[180px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold",
              disabled ? "cursor-not-allowed opacity-60" : "opacity-100"
            ].join(" ")}
          >
            <Sparkles className="h-4 w-4" />
            {generating ? (
              <span className="inline-flex items-center gap-2">
                Generating
                <span className="loading-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </span>
            ) : (
              <span>Generate Diagram</span>
            )}
          </motion.button>
        </div>
      </GlassContainer>
    </motion.div>
  );
}
