export const NAME_MAX_LENGTH = 100
export const PHONE_MAX_LENGTH = 20

const PHONE_PATTERN = /^[0-9()+\s-]{7,20}$/

export function validateContactInformation({ fullName, phone }) {
    const values = {
        fullName: fullName.trim(),
        phone: phone.trim(),
    }

    const errors = {}

    if (values.fullName.length < 2) {
        errors.fullName = 'Enter a name containing at least 2 characters.'
    }

    if (!PHONE_PATTERN.test(values.phone)) {
        errors.phone =
            'Enter a valid phone number using 7–20 numbers or phone symbols.'
    }

    return {
        values,
        errors,
        isValid: Object.keys(errors).length === 0,
    }
}