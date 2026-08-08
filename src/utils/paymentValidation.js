export const CARDHOLDER_NAME_MAX_LENGTH = 100;

function cardNumberPassesLuhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number(cardNumber[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function getCardBrand(cardNumber) {
  if (/^4/.test(cardNumber)) {
    return "Visa";
  }

  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) {
    return "Mastercard";
  }

  if (/^3[47]/.test(cardNumber)) {
    return "American Express";
  }

  if (/^(6011|65)/.test(cardNumber)) {
    return "Discover";
  }

  return "Card";
}

export function paymentMethodIsExpired(
  paymentMethod,
  currentDate = new Date(),
) {
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    paymentMethod.expirationYear < currentYear ||
    (paymentMethod.expirationYear === currentYear &&
      paymentMethod.expirationMonth < currentMonth)
  );
}

export function validatePaymentInformation(
  { cardholderName, cardNumber, expirationDate, securityCode },
  currentDate = new Date(),
) {
  const normalizedName = cardholderName.trim();
  const normalizedNumber = cardNumber.replace(/\D/g, "");
  const normalizedExpiration = expirationDate.trim();
  const normalizedSecurityCode = securityCode.trim();
  const errors = {};

  if (
    normalizedName.length < 2 ||
    normalizedName.length > CARDHOLDER_NAME_MAX_LENGTH
  ) {
    errors.cardholderName = "Enter the name shown on the demo card.";
  }

  if (
    !/^\d{13,16}$/.test(normalizedNumber) ||
    !cardNumberPassesLuhnCheck(normalizedNumber)
  ) {
    errors.cardNumber = "Enter a valid demonstration card number.";
  }

  const expirationMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(
    normalizedExpiration,
  );

  let expirationMonth = null;
  let expirationYear = null;

  if (!expirationMatch) {
    errors.expirationDate = "Enter an expiration date in MM/YY format.";
  } else {
    expirationMonth = Number(expirationMatch[1]);
    expirationYear = 2000 + Number(expirationMatch[2]);

    if (
      paymentMethodIsExpired({ expirationMonth, expirationYear }, currentDate)
    ) {
      errors.expirationDate = "The demonstration card is expired.";
    }
  }

  if (!/^\d{3,4}$/.test(normalizedSecurityCode)) {
    errors.securityCode = "Enter a 3 or 4 digit demo security code.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    metadata: {
      cardholderName: normalizedName,
      cardBrand: getCardBrand(normalizedNumber),
      lastFour: normalizedNumber.slice(-4),
      expirationMonth,
      expirationYear,
    },
  };
}
