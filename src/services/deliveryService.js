const DEMO_DELIVERY_ZIP_CODES = ['36830', '36831', '36832']

function formatZipCodeRanges(zipCodes) {
  const sortedCodes = [...zipCodes]
    .map(Number)
    .sort((first, second) => first - second)

  const ranges = []
  let rangeStart = sortedCodes[0]
  let previousCode = sortedCodes[0]

  for (let index = 1; index < sortedCodes.length; index += 1) {
    const currentCode = sortedCodes[index]

    if (currentCode === previousCode + 1) {
      previousCode = currentCode
      continue
    }

    ranges.push(
      rangeStart === previousCode
        ? String(rangeStart)
        : `${rangeStart}–${previousCode}`,
    )

    rangeStart = currentCode
    previousCode = currentCode
  }

  ranges.push(
    rangeStart === previousCode
      ? String(rangeStart)
      : `${rangeStart}–${previousCode}`,
  )

  return ranges.join(', ')
}

export function getDeliveryZipCodeDescription() {
  return `Accepted demonstration ZIP codes: ${formatZipCodeRanges(
    DEMO_DELIVERY_ZIP_CODES,
  )}.`
}

export function validateDeliveryAddress(address) {
  const errors = {}

  if (address.street.trim().length < 5) {
    errors.street = 'Enter a valid street address.'
  }

  if (address.city.trim().length < 2) {
    errors.city = 'Enter a valid city.'
  }

  if (address.state.trim().toUpperCase() !== 'AL') {
    errors.state = 'This demonstration delivers within Alabama only.'
  }

  if (!DEMO_DELIVERY_ZIP_CODES.includes(address.zipCode.trim())) {
    errors.zipCode =
      'This address is outside the demonstration delivery area.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}