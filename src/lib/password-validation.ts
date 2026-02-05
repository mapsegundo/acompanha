export interface PasswordValidation {
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
    requirements: {
        minLength: boolean
        hasUppercase: boolean
        hasLowercase: boolean
        hasNumber: boolean
        hasSpecialChar: boolean
    }
}

const MIN_PASSWORD_LENGTH = 8
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{};\':"|<>?,./`~'

export function validatePassword(password: string): PasswordValidation {
    const requirements = {
        minLength: password.length >= MIN_PASSWORD_LENGTH,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password),
    }

    const errors: string[] = []

    if (!requirements.minLength) {
        errors.push(`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`)
    }
    if (!requirements.hasUppercase) {
        errors.push('Pelo menos 1 letra maiúscula')
    }
    if (!requirements.hasLowercase) {
        errors.push('Pelo menos 1 letra minúscula')
    }
    if (!requirements.hasNumber) {
        errors.push('Pelo menos 1 número')
    }
    if (!requirements.hasSpecialChar) {
        errors.push('Pelo menos 1 caractere especial (!@#$%^&*)')
    }

    const passedCount = Object.values(requirements).filter(Boolean).length

    let strength: 'weak' | 'medium' | 'strong'
    if (passedCount <= 2) {
        strength = 'weak'
    } else if (passedCount <= 4) {
        strength = 'medium'
    } else {
        strength = 'strong'
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        requirements,
    }
}

export function getPasswordStrengthLabel(strength: 'weak' | 'medium' | 'strong'): string {
    const labels = {
        weak: 'Fraca',
        medium: 'Média',
        strong: 'Forte',
    }
    return labels[strength]
}
