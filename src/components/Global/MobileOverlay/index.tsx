
import React from 'react';

interface MobileOverlayProps {
    visible: boolean;
    onClick: () => void;
}

const MobileOverlay: React.FC<MobileOverlayProps> = ({ visible, onClick }) => {
    if (!visible) return null;

    return (
        <div 
            className="mobile-overlay animate-fade-in" 
            onClick={onClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
            }}
        />
    );
}

export default MobileOverlay;
