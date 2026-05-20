const TALUKS_BY_DISTRICT = {
  "Bagalkot": ["Jamkhandi", "Bilagi", "Hungund", "Mudhol", "Badami", "Bagalkot", "Ilkal", "Rabakavi-Banahatti"],
  "Bagalkot District": ["Jamkhandi", "Bilagi", "Hungund", "Mudhol", "Badami", "Bagalkot", "Ilkal", "Rabakavi-Banahatti"],
  "Belagavi": ["Belagavi", "Athani", "Bailhongal", "Chikodi", "Gokak", "Hukkeri", "Raybag", "Ramdurg", "Saundatti", "Khanapur", "Nippani"],
  "Belgaum": ["Belagavi", "Athani", "Bailhongal", "Chikodi", "Gokak", "Hukkeri", "Raybag", "Ramdurg", "Saundatti", "Khanapur", "Nippani"],
  "Belagavi (Belgaum)": ["Belagavi", "Athani", "Bailhongal", "Chikodi", "Gokak", "Hukkeri", "Raybag", "Ramdurg", "Saundatti", "Khanapur", "Nippani"],
  "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad"],
  "Vijayapura": ["Vijayapura", "Basavana Bagewadi", "Indi", "Sindagi", "Muddebihal"],
  "Bijapur": ["Vijayapura", "Basavana Bagewadi", "Indi", "Sindagi", "Muddebihal"],
  "Vijayapura (Bijapur)": ["Vijayapura", "Basavana Bagewadi", "Indi", "Sindagi", "Muddebihal"],
  "Dharwad": ["Dharwad", "Hubballi (Urban/Rural)", "Kalghatgi", "Kundgol", "Navalgund", "Annigeri"],
  "Gadag": ["Gadag", "Ron", "Nargund", "Shirhatti", "Mundargi"],
  "Kalaburagi": ["Kalaburagi", "Chincholi", "Sedam", "Chittapur", "Afzalpur", "Jevargi"],
  "Gulbarga": ["Kalaburagi", "Chincholi", "Sedam", "Chittapur", "Afzalpur", "Jevargi"],
  "Kalaburagi (Gulbarga)": ["Kalaburagi", "Chincholi", "Sedam", "Chittapur", "Afzalpur", "Jevargi"],
  "Haveri": ["Haveri", "Byadagi", "Ranebennur", "Hirekerur", "Shiggaon", "Savanur", "Hangal"],
  "Koppal": ["Koppal", "Gangavathi", "Kushtagi", "Yelburga", "Karatagi"],
  "Raichur": ["Raichur", "Sindhanur", "Manvi", "Lingasugur", "Devadurga", "Maski"],
};

function normalizeLocationName(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function findDistrictKey(value = "") {
  const normalizedValue = normalizeLocationName(value);

  if (!normalizedValue) {
    return null;
  }

  return (
    Object.keys(TALUKS_BY_DISTRICT).find((key) => {
      const normalizedKey = normalizeLocationName(key);
      return normalizedKey === normalizedValue || normalizedKey.includes(normalizedValue) || normalizedValue.includes(normalizedKey);
    }) || null
  );
}

function getTaluksForDistrict(value = "") {
  const districtKey = findDistrictKey(value);
  return districtKey ? TALUKS_BY_DISTRICT[districtKey] : [];
}

function findDistrictByTaluk(value = "") {
  const normalizedValue = normalizeLocationName(value);

  if (!normalizedValue) {
    return null;
  }

  return (
    Object.entries(TALUKS_BY_DISTRICT).find(([, taluks]) =>
      taluks.some((taluk) => {
        const normalizedTaluk = normalizeLocationName(taluk);
        return (
          normalizedTaluk === normalizedValue ||
          normalizedTaluk.includes(normalizedValue) ||
          normalizedValue.includes(normalizedTaluk)
        );
      })
    )?.[0] || null
  );
}

function findTalukForDistrict(district, value = "") {
  const normalizedValue = normalizeLocationName(value);
  const taluks = getTaluksForDistrict(district);

  if (!normalizedValue) {
    return "";
  }

  return (
    taluks.find((taluk) => {
      const normalizedTaluk = normalizeLocationName(taluk);
      return (
        normalizedTaluk === normalizedValue ||
        normalizedTaluk.includes(normalizedValue) ||
        normalizedValue.includes(normalizedTaluk)
      );
    }) || ""
  );
}

const districtOptions = Object.keys(TALUKS_BY_DISTRICT).filter((district, index, allDistricts) => allDistricts.indexOf(district) === index);

export { TALUKS_BY_DISTRICT, districtOptions, findDistrictByTaluk, findDistrictKey, findTalukForDistrict, getTaluksForDistrict };
