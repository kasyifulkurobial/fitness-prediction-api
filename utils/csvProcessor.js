// BMI calculation
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// BMI category determination
const calculateBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Body fat percentage estimation (using BMI and age)
const calculateBodyFatEstimate = (bmi, age) => {
  // Simple estimation formula (not medically accurate, for demonstration)
  // Real implementation would need gender and other factors
  const baseFat = (bmi - 18.5) * 1.2;
  const ageFactor = age * 0.1;
  return Math.max(5, Math.min(50, baseFat + ageFactor));
};

// Fitness score calculation based on performance metrics
const calculateFitnessScore = (userInput) => {
  const { usia, beratBadan, tinggiBadan, sitUpCounts, broadJump } = userInput;
  
  // Age factor (younger gets higher score)
  const ageScore = Math.max(0, 100 - (usia - 20) * 1.5);
  
  // BMI score (optimal BMI around 22 gets highest score)
  const bmi = calculateBMI(beratBadan, tinggiBadan);
  const optimalBMI = 22;
  const bmiScore = Math.max(0, 100 - Math.abs(bmi - optimalBMI) * 5);
  
  // Sit-ups score (normalized to 0-100 scale)
  const sitUpScore = Math.min(100, (sitUpCounts / 50) * 100);
  
  // Broad jump score (normalized to 0-100 scale)
  const broadJumpScore = Math.min(100, (broadJump / 250) * 100);
  
  // Weighted average
  const weights = {
    age: 0.15,
    bmi: 0.25,
    sitUp: 0.30,
    broadJump: 0.30
  };
  
  return (
    ageScore * weights.age +
    bmiScore * weights.bmi +
    sitUpScore * weights.sitUp +
    broadJumpScore * weights.broadJump
  );
};

// Calculate ideal weight range
const calculateIdealWeightRange = (height) => {
  const heightInMeters = height / 100;
  const minWeight = Math.round(18.5 * heightInMeters * heightInMeters);
  const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters);
  return { min: minWeight, max: maxWeight };
};

// Calculate metabolic rate estimation
const calculateBMR = (weight, height, age, gender = 'unknown') => {
  // Mifflin-St Jeor Equation
  // Since we don't have gender input, we'll use average
  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
  return Math.round(baseBMR + 5); // Adding average between male (+5) and female (-161)
};

// Calculate daily calorie needs
const calculateDailyCalories = (bmr, activityLevel = 'moderate') => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };
  
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
};

// Performance percentile calculation
const calculatePerformancePercentile = (value, metric, age, referenceData = null) => {
  // Simplified percentile calculation
  // In real implementation, this would use actual reference data
  const ageGroup = Math.floor(age / 10) * 10;
  
  const referenceValues = {
    sitUps: {
      20: { p25: 15, p50: 25, p75: 35, p90: 45 },
      30: { p25: 12, p50: 22, p75: 32, p90: 42 },
      40: { p25: 10, p50: 20, p75: 30, p90: 40 },
      50: { p25: 8, p50: 18, p75: 28, p90: 38 }
    },
    broadJump: {
      20: { p25: 180, p50: 200, p75: 220, p90: 240 },
      30: { p25: 170, p50: 190, p75: 210, p90: 230 },
      40: { p25: 160, p50: 180, p75: 200, p90: 220 },
      50: { p25: 150, p50: 170, p75: 190, p90: 210 }
    }
  };
  
  const ref = referenceValues[metric]?.[ageGroup] || referenceValues[metric]?.['30'];
  if (!ref) return 50;
  
  if (value <= ref.p25) return 25;
  if (value <= ref.p50) return 50;
  if (value <= ref.p75) return 75;
  if (value <= ref.p90) return 90;
  return 95;
};

// Health risk assessment
const assessHealthRisk = (bmi, age, fitnessScore) => {
  let riskLevel = 'low';
  let riskFactors = [];
  
  if (bmi < 18.5) {
    riskFactors.push('Underweight');
    riskLevel = 'moderate';
  } else if (bmi > 30) {
    riskFactors.push('Obesity');
    riskLevel = 'high';
  } else if (bmi > 25) {
    riskFactors.push('Overweight');
    riskLevel = 'moderate';
  }
  
  if (age > 50 && fitnessScore < 40) {
    riskFactors.push('Low fitness in older age');
    riskLevel = riskLevel === 'high' ? 'high' : 'moderate';
  }
  
  if (fitnessScore < 30) {
    riskFactors.push('Very low fitness level');
    riskLevel = 'high';
  }
  
  return {
    level: riskLevel,
    factors: riskFactors,
    recommendations: generateHealthRecommendations(riskLevel, riskFactors)
  };
};

// Generate health recommendations based on risk assessment
const generateHealthRecommendations = (riskLevel, riskFactors) => {
  const recommendations = [];
  
  if (riskFactors.includes('Underweight')) {
    recommendations.push('Konsultasi dengan ahli gizi untuk program penambahan berat badan sehat');
  }
  
  if (riskFactors.includes('Obesity')) {
    recommendations.push('Program penurunan berat badan dengan pengawasan medis');
  }
  
  if (riskFactors.includes('Overweight')) {
    recommendations.push('Diet seimbang dan olahraga teratur untuk menurunkan berat badan');
  }
  
  if (riskFactors.includes('Low fitness in older age')) {
    recommendations.push('Program latihan khusus usia lanjut dengan intensitas bertahap');
  }
  
  if (riskFactors.includes('Very low fitness level')) {
    recommendations.push('Mulai program olahraga dasar dengan bantuan pelatih');
  }
  
  if (riskLevel === 'high') {
    recommendations.push('Konsultasi dengan dokter sebelum memulai program fitness');
  }
  
  return recommendations;
};

module.exports = {
  calculateBMI,
  calculateBMICategory,
  calculateBodyFatEstimate,
  calculateFitnessScore,
  calculateIdealWeightRange,
  calculateBMR,
  calculateDailyCalories,
  calculatePerformancePercentile,
  assessHealthRisk,
  generateHealthRecommendations
};