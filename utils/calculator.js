// Utility functions untuk kalkulasi fitness

function calculateBMI(weight, height) {
  // height dalam cm, konversi ke meter
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function calculateFitnessScore(age, sitUps, broadJump, bmi) {
  // Scoring system berdasarkan standar fitness
  let score = 0;
  
  // Sit-ups scoring (0-30 points)
  if (age < 30) {
    if (sitUps >= 40) score += 30;
    else if (sitUps >= 30) score += 25;
    else if (sitUps >= 20) score += 20;
    else if (sitUps >= 10) score += 15;
    else score += 10;
  } else if (age < 50) {
    if (sitUps >= 35) score += 30;
    else if (sitUps >= 25) score += 25;
    else if (sitUps >= 15) score += 20;
    else if (sitUps >= 8) score += 15;
    else score += 10;
  } else {
    if (sitUps >= 25) score += 30;
    else if (sitUps >= 18) score += 25;
    else if (sitUps >= 12) score += 20;
    else if (sitUps >= 6) score += 15;
    else score += 10;
  }
  
  // Broad jump scoring (0-30 points)
  if (age < 30) {
    if (broadJump >= 240) score += 30;
    else if (broadJump >= 220) score += 25;
    else if (broadJump >= 200) score += 20;
    else if (broadJump >= 180) score += 15;
    else score += 10;
  } else if (age < 50) {
    if (broadJump >= 220) score += 30;
    else if (broadJump >= 200) score += 25;
    else if (broadJump >= 180) score += 20;
    else if (broadJump >= 160) score += 15;
    else score += 10;
  } else {
    if (broadJump >= 200) score += 30;
    else if (broadJump >= 180) score += 25;
    else if (broadJump >= 160) score += 20;
    else if (broadJump >= 140) score += 15;
    else score += 10;
  }
  
  // BMI scoring (0-20 points)
  if (bmi >= 18.5 && bmi < 25) score += 20;
  else if (bmi >= 25 && bmi < 30) score += 15;
  else if (bmi >= 30 && bmi < 35) score += 10;
  else score += 5;
  
  // Age factor (0-20 points)
  if (age < 25) score += 20;
  else if (age < 35) score += 18;
  else if (age < 45) score += 16;
  else if (age < 55) score += 14;
  else if (age < 65) score += 12;
  else score += 10;
  
  return Math.round(score);
}

function getFitnessClass(fitnessScore) {
  if (fitnessScore >= 85) return 'A'; // Excellent
  if (fitnessScore >= 70) return 'B'; // Good
  if (fitnessScore >= 55) return 'C'; // Fair
  return 'D'; // Poor
}

function getAgeGroup(age) {
  if (age < 25) return 'Young Adult';
  if (age < 35) return 'Adult';
  if (age < 50) return 'Middle Age';
  if (age < 65) return 'Senior';
  return 'Elderly';
}

module.exports = {
  calculateBMI,
  getBMICategory,
  calculateFitnessScore,
  getFitnessClass,
  getAgeGroup
};