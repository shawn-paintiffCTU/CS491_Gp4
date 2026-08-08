import test from "node:test";
import assert from "node:assert/strict";
import {
  paymentMethodIsExpired,
  validatePaymentInformation,
} from "../utils/paymentValidation.js";

const TEST_DATE = new Date(2026, 7, 1);

test("accepts a valid demo card and returns safe metadata", () => {
  const result = validatePaymentInformation(
    {
      cardholderName: "  Shawn Painter  ",
      cardNumber: "4242 4242 4242 4242",
      expirationDate: "12/30",
      securityCode: "123",
    },
    TEST_DATE,
  );

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.metadata, {
    cardholderName: "Shawn Painter",
    cardBrand: "Visa",
    lastFour: "4242",
    expirationMonth: 12,
    expirationYear: 2030,
  });
});

test("rejects invalid card data", () => {
  const result = validatePaymentInformation(
    {
      cardholderName: "S",
      cardNumber: "1234",
      expirationDate: "01/20",
      securityCode: "x",
    },
    TEST_DATE,
  );

  assert.equal(result.isValid, false);
  assert.ok(result.errors.cardholderName);
  assert.ok(result.errors.cardNumber);
  assert.ok(result.errors.expirationDate);
  assert.ok(result.errors.securityCode);
});

test("detects expired saved payment metadata", () => {
  assert.equal(
    paymentMethodIsExpired(
      {
        expirationMonth: 7,
        expirationYear: 2026,
      },
      TEST_DATE,
    ),
    true,
  );

  assert.equal(
    paymentMethodIsExpired(
      {
        expirationMonth: 8,
        expirationYear: 2026,
      },
      TEST_DATE,
    ),
    false,
  );
});
