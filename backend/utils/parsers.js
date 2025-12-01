"use strict";

const { URLSearchParams } = require("url");

function normalizeCampusEmail(rawEmail) {
  if (typeof rawEmail !== "string") {
    return null;
  }

  const normalized = rawEmail.trim().toLowerCase();
  const VALID_UOFT_DOMAINS = ["@mail.utoronto.ca", "@utoronto.ca"];
  return VALID_UOFT_DOMAINS.some((domain) => normalized.endsWith(domain))
    ? normalized
    : null;
}

function parseBirthdayIsoDate(rawBirthday) {
  if (typeof rawBirthday !== "string") {
    return null;
  }

  const trimmed = rawBirthday.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);

  if (!match) {
    return null;
  }

  const datePart = match[1];
  const parsed = new Date(`${datePart}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const isoDate = parsed.toISOString().slice(0, 10);
  if (isoDate !== datePart) {
    return null;
  }

  return parsed;
}

function formatIsoDateOnly(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function formatIsoDateTime(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function interpretBooleanFlag(value) {
  if (Array.isArray(value)) {
    if (!value.length) {
      return null;
    }
    return interpretBooleanFlag(value[value.length - 1]);
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(lower)) return true;
    if (["false", "0", "no"].includes(lower)) return false;
  }
  return null;
}

function parsePositiveWhole(value) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

function assertPositiveInteger(value) {
  const parsedNumber = Number(value);
  if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
    return null;
  }
  return parsedNumber;
}

function mergeFilterSources(query = {}, body = {}) {
  const merged = {};

  const ingestSource = (source) => {
    if (!source || typeof source !== "object") {
      return;
    }

    for (const [key, value] of Object.entries(source)) {
      if (typeof key === "string" && key.toLowerCase().startsWith("filters.")) {
        const innerKey = key.slice(key.indexOf(".") + 1);
        if (innerKey) {
          merged[innerKey] = value;
        }
        continue;
      }

      if (
        typeof key === "string" &&
        key.toLowerCase().startsWith("filters[")
      ) {
        const closingIndex = key.indexOf("]");
        if (closingIndex > 8) {
          const innerKey = key.slice(8, closingIndex);
          if (innerKey) {
            merged[innerKey] = value;
          }
          continue;
        }
      }

      if (typeof key === "string" && key.endsWith("[]")) {
        const trimmed = key.slice(0, -2);
        if (trimmed && merged[trimmed] === undefined) {
          merged[trimmed] = value;
        }
        continue;
      }

      if (value === undefined) {
        continue;
      }

      if (typeof key === "string" && key.toLowerCase() === "filters") {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          ingestSource(value);
          continue;
        }

        if (typeof value === "string") {
          const trimmedValue = value.trim();
          let parsedObject = null;

          if (trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) {
            try {
              const parsed = JSON.parse(trimmedValue);
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                parsedObject = parsed;
              }
            } catch (err) {
              parsedObject = null;
            }
          }

          if (!parsedObject && trimmedValue.includes("=")) {
            const params = new URLSearchParams(trimmedValue);
            const obj = {};
            for (const [paramKey, paramValue] of params.entries()) {
              obj[paramKey] = paramValue;
            }
            parsedObject = obj;
          }

          if (parsedObject) {
            ingestSource(parsedObject);
          }
          continue;
        }

        continue;
      }

      if (
        typeof key === "string" &&
        key.toLowerCase() === "filters" &&
        typeof value !== "object"
      ) {
        continue;
      }

      if (merged[key] === undefined) {
        merged[key] = value;
      }
    }
  };

  ingestSource(query);
  ingestSource(body);
  return merged;
}

function digFilterValue(source, key) {
  if (!source || typeof source !== "object") {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key];
  }
  const lowered = key.toLowerCase();
  for (const [candidate, value] of Object.entries(source)) {
    const normalizedKey = candidate.toLowerCase();
    if (
      normalizedKey === lowered ||
      normalizedKey === `${lowered}[]` ||
      normalizedKey.startsWith(`${lowered}[`) ||
      normalizedKey.startsWith(`${lowered}.`)
    ) {
      return value;
    }
  }
  const filtersValue = source.filters;
  if (filtersValue && typeof filtersValue === "object") {
    if (Array.isArray(filtersValue)) {
      for (const entry of filtersValue) {
        const result = digFilterValue(entry, key);
        if (result !== undefined) {
          return result;
        }
      }
    } else {
      const nestedResult = digFilterValue(filtersValue, key);
      if (nestedResult !== undefined) {
        return nestedResult;
      }
    }
  }
  return undefined;
}

function resolveFilterInput(filters, req, key) {
  return (
    digFilterValue(filters, key) ??
    req.query?.[key] ??
    req.query?.[`filters[${key}]`] ??
    req.query?.[`filters.${key}`] ??
    req.body?.[key] ??
    req.body?.[`filters[${key}]`] ??
    req.body?.[`filters.${key}`]
  );
}

module.exports = {
  normalizeCampusEmail,
  parseBirthdayIsoDate,
  formatIsoDateOnly,
  formatIsoDateTime,
  interpretBooleanFlag,
  parsePositiveWhole,
  assertPositiveInteger,
  mergeFilterSources,
  digFilterValue,
  resolveFilterInput,
};
