'use client'

import React, { useEffect, useState } from 'react';

interface TooltipProps {
    text: string;
    visible?: boolean;
    targetRef?: React.RefObject<HTMLElement>;
    children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, visible = false, targetRef, children }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (visible && targetRef?.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 10, // Position below the target element
                left: rect.left + rect.width / 2
            });
        }
    }, [visible, targetRef]);

    const tooltipContent = (
        <div
            className="fixed z-10 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 whitespace-nowrap transform -translate-x-1/2"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
            {text}
            <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
    );

    if (children) {
        return (
            <div className="relative inline-block">
                {children}
                {visible && tooltipContent}
            </div>
        );
    }

    if (!visible) return null;

    return tooltipContent;
};

export default Tooltip;