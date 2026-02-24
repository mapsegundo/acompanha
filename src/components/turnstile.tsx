"use client"

import { Turnstile as MarsidevTurnstile } from '@marsidev/react-turnstile'

interface TurnstileProps {
    siteKey: string
    onVerify: (token: string) => void
    onError?: () => void
    onExpire?: () => void
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'compact'
    className?: string
}

export function Turnstile({
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'light',
    size = 'normal',
    className = '',
}: TurnstileProps) {
    return (
        <div className={className}>
            <MarsidevTurnstile
                siteKey={siteKey}
                onSuccess={onVerify}
                onError={onError}
                onExpire={onExpire}
                options={{
                    theme,
                    size,
                }}
            />
        </div>
    )
}
