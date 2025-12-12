import { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export default function FullscreenButton() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [corner, setCorner] = useState('top-right'); // top-right, top-left, bottom-right, bottom-left
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    // Update fullscreen state ketika user tekan F11 atau ESC
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setHasMoved(false);
        const rect = buttonRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setStartPosition({ x: e.clientX, y: e.clientY });
        setTempPosition({ x: rect.left, y: rect.top });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const buttonSize = 48;
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Batasi dalam viewport
        newX = Math.max(0, Math.min(newX, window.innerWidth - buttonSize));
        newY = Math.max(0, Math.min(newY, window.innerHeight - buttonSize));

        // Cek apakah sudah bergerak cukup jauh (threshold 5px)
        const distance = Math.sqrt(
            Math.pow(e.clientX - startPosition.x, 2) +
            Math.pow(e.clientY - startPosition.y, 2)
        );
        if (distance > 5) {
            setHasMoved(true);
        }

        setTempPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        // Jika tidak bergerak (hanya click), toggle fullscreen
        if (!hasMoved) {
            toggleFullscreen();
        } else {
            // Jika bergerak (drag), snap ke pojok terdekat
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const buttonSize = 48;

            // Hitung center dari tombol
            const centerX = tempPosition.x + buttonSize / 2;
            const centerY = tempPosition.y + buttonSize / 2;

            // Tentukan pojok terdekat
            const isLeft = centerX < screenWidth / 2;
            const isTop = centerY < screenHeight / 2;

            let newCorner;
            if (isTop && isLeft) {
                newCorner = 'top-left';
            } else if (isTop && !isLeft) {
                newCorner = 'top-right';
            } else if (!isTop && isLeft) {
                newCorner = 'bottom-left';
            } else {
                newCorner = 'bottom-right';
            }

            setCorner(newCorner);
        }

        setIsDragging(false);
        setHasMoved(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, tempPosition, startPosition, hasMoved]);

    // Posisi pojok
    const cornerPositions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
    };

    return (
        <button
            ref={buttonRef}
            onMouseDown={handleMouseDown}
            style={isDragging && hasMoved ? {
                left: `${tempPosition.x}px`,
                top: `${tempPosition.y}px`,
                position: 'fixed',
            } : undefined}
            className={`
        fixed z-[9999] p-3 rounded-full shadow-lg
        bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-xl
        text-gray-600 hover:text-primary-600
        cursor-grab active:cursor-grabbing
        select-none
        ${isDragging && hasMoved ? 'scale-110 shadow-xl' : `transition-all duration-300 ${cornerPositions[corner]}`}
      `}
            title={isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Masuk Fullscreen (F11)'}
        >
            {isFullscreen ? (
                <Minimize className="w-5 h-5 pointer-events-none" />
            ) : (
                <Maximize className="w-5 h-5 pointer-events-none" />
            )}
        </button>
    );
}
