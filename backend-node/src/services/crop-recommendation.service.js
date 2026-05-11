const cropProfiles = [
  {
    name: "Cotton",
    soils: ["black", "alluvial"],
    seasons: ["kharif"],
    districts: ["bagalkot", "belagavi", "koppal", "raichur"],
    target: { n: 120, p: 45, k: 160, ph: 6.8 },
    tolerance: { n: 80, p: 35, k: 70, ph: 1.2 },
    yieldData: "18 quintals/acre",
    marketPrice: "Rs 6,500/qtl",
  },
  {
    name: "Groundnut",
    soils: ["black", "red", "sandy", "loamy"],
    seasons: ["kharif", "rabi"],
    districts: ["bagalkot", "belagavi", "koppal", "raichur"],
    target: { n: 40, p: 60, k: 40, ph: 6.5 },
    tolerance: { n: 35, p: 35, k: 25, ph: 0.9 },
    yieldData: "10 quintals/acre",
    marketPrice: "Rs 5,800/qtl",
  },
  {
    name: "Maize",
    soils: ["black", "alluvial", "loamy"],
    seasons: ["kharif", "rabi"],
    districts: ["bagalkot", "belagavi", "dharwad", "koppal", "raichur"],
    target: { n: 90, p: 45, k: 35, ph: 6.6 },
    tolerance: { n: 45, p: 25, k: 20, ph: 0.8 },
    yieldData: "24 quintals/acre",
    marketPrice: "Rs 2,300/qtl",
  },
  {
    name: "Paddy",
    soils: ["clay", "alluvial", "loamy"],
    seasons: ["kharif"],
    districts: ["koppal", "raichur", "mandya"],
    target: { n: 110, p: 40, k: 40, ph: 6.2 },
    tolerance: { n: 40, p: 20, k: 20, ph: 0.8 },
    yieldData: "22 quintals/acre",
    marketPrice: "Rs 2,200/qtl",
  },
  {
    name: "Sugarcane",
    soils: ["black", "alluvial", "loamy"],
    seasons: ["whole_year", "rabi"],
    districts: ["belagavi", "bagalkot", "mandya"],
    target: { n: 150, p: 60, k: 120, ph: 7.0 },
    tolerance: { n: 70, p: 30, k: 50, ph: 1.0 },
    yieldData: "38 tons/acre",
    marketPrice: "Rs 340/qtl",
  },
];

function normalizeSeason(season) {
  if (season === "summer") {
    return "zaid";
  }

  return season;
}

function clampScore(value) {
  return Math.max(0, Math.min(1, value));
}

function nutrientMatch(inputValue, targetValue, tolerance) {
  const delta = Math.abs(inputValue - targetValue);
  return clampScore(1 - delta / tolerance);
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

function recommendCrops(payload) {
  const normalizedSeason = normalizeSeason(payload.season);
  const district = payload.location.district.trim().toLowerCase();

  const scoredProfiles = cropProfiles
    .map((profile) => {
      const seasonMatch = profile.seasons.includes(normalizedSeason) ? 1 : 0.15;
      const soilMatch = profile.soils.includes(payload.soilType) ? 1 : 0.2;
      const districtMatch = profile.districts.includes(district) ? 1 : 0;

      const nutrientScore =
        (nutrientMatch(payload.n, profile.target.n, profile.tolerance.n) +
          nutrientMatch(payload.p, profile.target.p, profile.tolerance.p) +
          nutrientMatch(payload.k, profile.target.k, profile.tolerance.k)) /
        3;

      const phScore = nutrientMatch(payload.ph, profile.target.ph, profile.tolerance.ph);

      const score =
        seasonMatch * 0.3 +
        soilMatch * 0.25 +
        nutrientScore * 0.3 +
        phScore * 0.1 +
        districtMatch * 0.05;

      return {
        name: profile.name,
        score: roundScore(score),
        yieldData: profile.yieldData,
        marketPrice: profile.marketPrice,
      };
    })
    .sort((left, right) => right.score - left.score);

  const [primaryCrop, ...rest] = scoredProfiles;

  return {
    primaryCrop,
    alternatives: rest.slice(0, 3).map((crop) => ({
      name: crop.name,
      score: crop.score,
      yieldData: crop.yieldData,
      marketPrice: crop.marketPrice,
    })),
  };
}

module.exports = {
  recommendCrops,
};
