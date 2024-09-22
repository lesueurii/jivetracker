'use client'

import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const ToastHandler: React.FC = () => {
    const [toastProps, setToastProps] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        const handleShowToast = (event: CustomEvent<{ message: string; type: 'success' | 'error' | 'info' }>) => {
            setToastProps(event.detail);
        };

        window.addEventListener('showToast', handleShowToast as EventListener);

        return () => {
            window.removeEventListener('showToast', handleShowToast as EventListener);
        };
    }, []);

    if (!toastProps) return null;

    return <Toast message={toastProps.message} type={toastProps.type} />;
};

export default ToastHandler;