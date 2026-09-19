import { useEffect, useMemo, useRef, useState } from 'react';
import './PixelTypewriter.css';

/**
 * Types each paragraph in order and keeps completed paragraphs on screen.
 *
 * @param {string[]} paragraphs Lines to type.
 * @param {number} typeSpeed Delay, in milliseconds, between characters.
 * @param {number} lineDelay Delay before continuing on the next line.
 * @param {() => void} onComplete Called once after the final character is typed.
 */
function PixelTypewriter({
    paragraphs = [],
    typeSpeed = 50,
    lineDelay = 360,
    onComplete,
}) {
    const paragraphKey = Array.isArray(paragraphs)
        ? paragraphs.filter((paragraph) => typeof paragraph === 'string').join('\u0001')
        : '';
    const lines = useMemo(
        () => (paragraphKey ? paragraphKey.split('\u0001') : []),
        [paragraphKey],
    );
    const [lineIndex, setLineIndex] = useState(0);
    const [characterIndex, setCharacterIndex] = useState(0);
    const hasCompleted = useRef(false);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        setLineIndex(0);
        setCharacterIndex(0);
        hasCompleted.current = false;
    }, [paragraphKey]);

    useEffect(() => {
        const currentLine = lines[lineIndex];
        if (currentLine === undefined) return undefined;

        const characters = Array.from(currentLine);
        if (characterIndex < characters.length) {
            const timer = window.setTimeout(
                () => setCharacterIndex((index) => index + 1),
                typeSpeed,
            );
            return () => window.clearTimeout(timer);
        }

        if (lineIndex < lines.length - 1) {
            const timer = window.setTimeout(() => {
                setLineIndex((index) => index + 1);
                setCharacterIndex(0);
            }, lineDelay);
            return () => window.clearTimeout(timer);
        }

        if (!hasCompleted.current) {
            hasCompleted.current = true;
            onCompleteRef.current?.();
        }

        return undefined;
    }, [characterIndex, lineDelay, lineIndex, lines, typeSpeed]);

    if (lines.length === 0) return null;

    return (
        <section className="pixel-typewriter" aria-live="polite">
            {lines.slice(0, lineIndex + 1).map((line, index) => {
                const isCurrentLine = index === lineIndex;
                const visibleText = isCurrentLine
                    ? Array.from(line).slice(0, characterIndex).join('')
                    : line;

                return (
                    <p className="pixel-typewriter__line" key={`${index}-${line}`}>
                        {visibleText}
                        {isCurrentLine && !hasCompleted.current && (
                            <span className="pixel-typewriter__cursor" aria-hidden="true">▋</span>
                        )}
                    </p>
                );
            })}
        </section>
    );
}

export default PixelTypewriter;
