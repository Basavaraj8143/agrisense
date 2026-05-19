import * as exifr from "exifr";
import Tesseract from "tesseract.js";

function roundCoordinate(value) {
  return Number(value.toFixed(6));
}

function parseDirectionalCoordinate(match, valueIndex, directionIndex) {
  const numericValue = Number.parseFloat(match[valueIndex]);
  const direction = match[directionIndex]?.toUpperCase();

  if (!Number.isFinite(numericValue) || !direction) {
    return null;
  }

  if (direction === "S" || direction === "W") {
    return -numericValue;
  }

  return numericValue;
}

function parseDmsCoordinate(match, degreeIndex, minuteIndex, secondIndex, directionIndex) {
  const degrees = Number.parseFloat(match[degreeIndex]);
  const minutes = Number.parseFloat(match[minuteIndex]);
  const seconds = Number.parseFloat(match[secondIndex]);
  const direction = match[directionIndex]?.toUpperCase();

  if (![degrees, minutes, seconds].every(Number.isFinite) || !direction) {
    return null;
  }

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimal *= -1;
  }

  return decimal;
}

function parseCoordinatesFromText(text) {
  const decimalPair = text.match(/Lat[^\d-]*([-+]?\d+(?:\.\d+)?)[^\d-]*Lon(?:g)?[^\d-]*([-+]?\d+(?:\.\d+)?)/i);
  if (decimalPair) {
    return {
      lat: Number.parseFloat(decimalPair[1]),
      lng: Number.parseFloat(decimalPair[2]),
      source: "ocr",
    };
  }

  const directionalPair = text.match(
    /([-+]?\d+(?:\.\d+)?)\s*[°º]?\s*([NS])(?:[,\s]+)\s*([-+]?\d+(?:\.\d+)?)\s*[°º]?\s*([EW])/i
  );
  if (directionalPair) {
    const lat = parseDirectionalCoordinate(directionalPair, 1, 2);
    const lng = parseDirectionalCoordinate(directionalPair, 3, 4);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng, source: "ocr" };
    }
  }

  const dmsPair = text.match(
    /(\d{1,3})\s*[°º]?\s*(\d{1,2})['’]?\s*(\d{1,2}(?:\.\d+)?)["”]?\s*([NS])(?:[,\s]+)(\d{1,3})\s*[°º]?\s*(\d{1,2})['’]?\s*(\d{1,2}(?:\.\d+)?)["”]?\s*([EW])/i
  );
  if (dmsPair) {
    const lat = parseDmsCoordinate(dmsPair, 1, 2, 3, 4);
    const lng = parseDmsCoordinate(dmsPair, 5, 6, 7, 8);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng, source: "ocr" };
    }
  }

  return null;
}

function sanitizeLocationName(value) {
  return typeof value === "string" ? value.replace(/[^\x00-\x7F]/g, "").trim() : "";
}

export async function extractCoordinatesFromImage(file, onStatus) {
  try {
    onStatus?.("Reading GPS metadata from the image...");
    const gps = await exifr.gps(file);

    if (gps?.latitude && gps?.longitude) {
      return {
        lat: roundCoordinate(gps.latitude),
        lng: roundCoordinate(gps.longitude),
        source: "exif",
      };
    }
  } catch {
    onStatus?.("GPS metadata was not available. Falling back to OCR...");
  }

  onStatus?.("Scanning the image text for coordinates with OCR...");
  const ocrResult = await Tesseract.recognize(file, "eng", {
    logger(message) {
      if (message.status === "recognizing text") {
        onStatus?.(`Scanning image text... ${Math.round(message.progress * 100)}%`);
      }
    },
  });

  const coordinates = parseCoordinatesFromText(ocrResult.data.text || "");
  if (!coordinates) {
    return null;
  }

  return {
    lat: roundCoordinate(coordinates.lat),
    lng: roundCoordinate(coordinates.lng),
    source: coordinates.source,
  };
}

export async function reverseGeocodeCoordinates(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
      lng
    )}&zoom=10&addressdetails=1&accept-language=en`
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding request failed");
  }

  const data = await response.json();
  const address = data.address || {};

  let district = sanitizeLocationName(
    address.county || address.district || address.city_district || address.state_district || ""
  );
  let taluk = sanitizeLocationName(address.town || address.village || address.city || address.county || "");

  if ((!district || !taluk) && typeof data.display_name === "string") {
    const parts = data.display_name.split(",");
    if (!district && parts[0]) {
      district = sanitizeLocationName(parts[0]);
    }

    if (!taluk && parts[1]) {
      taluk = sanitizeLocationName(parts[1]);
    }
  }

  return {
    district,
    taluk,
    label: [taluk, district].filter(Boolean).join(", "),
  };
}
