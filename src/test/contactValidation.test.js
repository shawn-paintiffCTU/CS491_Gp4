import test from 'node:test'
import assert from 'node:assert/strict'
import {
    validateContactInformation,
} from '../utils/contactValidation.js'

test('accepts valid contact information and trims whitespace', () => {
    const result = validateContactInformation({
        fullName: '  Shawn Painter  ',
        phone: '  (555) 123-4567  ',
    })

    assert.equal(result.isValid, true)
    assert.deepEqual(result.errors, {})
    assert.equal(result.values.fullName, 'Shawn Painter')
    assert.equal(result.values.phone, '(555) 123-4567')
})

test('rejects a name shorter than two characters', () => {
    const result = validateContactInformation({
        fullName: 'S',
        phone: '555-123-4567',
    })

    assert.equal(result.isValid, false)
    assert.ok(result.errors.fullName)
})

test('rejects an invalid phone number', () => {
    const result = validateContactInformation({
        fullName: 'Shawn Painter',
        phone: 'not-a-phone-number',
    })

    assert.equal(result.isValid, false)
    assert.ok(result.errors.phone)
})