'use client'

import Image from 'next/image'

export default function JiveLogo() {
    return (
        <Image
            src="/logo.jpg"
            alt="Jive Logo"
            width={36}
            height={36}
        />
    );
}