const { supabase } = require('../config/supabase');

async function generateRecommendations(userProfile, fitnessClass, fitnessScore, bmi) {
  const { age, sitUps, broadJump } = userProfile;
  const recommendations = [];
  
  // General recommendations based on fitness class
  const classRecommendations = {
    'A': {
      title: '🌟 Excellent Fitness Level!',
      message: 'Pertahankan performa yang luar biasa ini!',
      tips: [
        'Tingkatkan intensitas latihan untuk tantangan lebih besar',
        'Fokus pada latihan variasi untuk mencegah plateau',
        'Pertimbangkan untuk menjadi mentor fitness bagi orang lain'
      ]
    },
    'B': {
      title: '💪 Good Fitness Level',
      message: 'Anda dalam kondisi fisik yang baik, terus tingkatkan!',
      tips: [
        'Tambahkan latihan kekuatan 2-3x seminggu',
        'Tingkatkan durasi dan intensitas kardio',
        'Fokus pada fleksibilitas dan mobilitas'
      ]
    },
    'C': {
      title: '⚡ Fair Fitness Level',
      message: 'Ada ruang untuk perbaikan, mari kita tingkatkan!',
      tips: [
        'Mulai dengan latihan ringan tapi konsisten',
        'Fokus pada peningkatan bertahap',
        'Perhatikan pola makan dan istirahat'
      ]
    },
    'D': {
      title: '🎯 Perlu Peningkatan',
      message: 'Saatnya memulai perjalanan fitness yang lebih serius!',
      tips: [
        'Mulai dengan aktivitas ringan seperti jalan kaki',
        'Konsultasi dengan trainer profesional',
        'Buat rencana latihan yang realistis dan bertahap'
      ]
    }
  };
  
  // Add class-specific recommendations
  recommendations.push(classRecommendations[fitnessClass]);
  
  // BMI-based recommendations
  if (bmi < 18.5) {
    recommendations.push({
      title: '🍎 Rekomendasi Nutrisi',
      message: 'BMI Anda menunjukkan berat badan kurang',
      tips: [
        'Tingkatkan asupan kalori dengan makanan bergizi',
        'Fokus pada latihan kekuatan untuk menambah massa otot',
        'Konsumsi protein yang cukup (1.2-1.6g per kg berat badan)'
      ]
    });
  } else if (bmi >= 25) {
    recommendations.push({
      title: '🏃‍♂️ Rekomendasi Penurunan Berat',
      message: 'BMI Anda menunjukkan kelebihan berat badan',
      tips: [
        'Kombinasikan latihan kardio dan kekuatan',
        'Perhatikan pola makan dengan defisit kalori yang sehat',
        'Tingkatkan aktivitas fisik harian'
      ]
    });
  }
  
  // Sit-ups specific recommendations
  const sitUpsTarget = age < 30 ? 40 : age < 50 ? 35 : 25;
  if (sitUps < sitUpsTarget) {
    recommendations.push({
      title: '💪 Latihan Core',
      message: `Target sit-ups untuk usia Anda: ${sitUpsTarget}`,
      tips: [
        'Lakukan latihan core 3-4x seminggu',
        'Mulai dengan plank, mountain climbers, dan crunches',
        'Tingkatkan secara bertahap 2-3 repetisi per minggu'
      ]
    });
  }
  
  // Broad jump specific recommendations
  const broadJumpTarget = age < 30 ? 240 : age < 50 ? 220 : 200;
  if (broadJump < broadJumpTarget) {
    recommendations.push({
      title: '🦘 Latihan Explosive Power',
      message: `Target broad jump untuk usia Anda: ${broadJumpTarget}cm`,
      tips: [
        'Latihan plyometric seperti jump squats dan burpees',
        'Strengthening otot kaki dengan squats dan lunges',
        'Latihan koordinasi dan timing'
      ]
    });
  }
  
  // Age-specific recommendations
  if (age >= 50) {
    recommendations.push({
      title: '🧘‍♂️ Rekomendasi untuk Usia Mature',
      message: 'Fokus pada kesehatan jangka panjang',
      tips: [
        'Prioritaskan fleksibilitas dan keseimbangan',
        'Low-impact exercises seperti swimming dan cycling',
        'Regular health check-up setiap 6 bulan'
      ]
    });
  }
  
  return recommendations;
}

async function findSimilarProfiles(userProfile, limit = 3) {
  try {
    const { age, height, weight, sitUps, broadJump } = userProfile;
    
    // Find similar profiles from database
    const { data, error } = await supabase
      .from('fitness_data')
      .select('*')
      .gte('age', age - 5)
      .lte('age', age + 5)
      .gte('height_cm', height - 10)
      .lte('height_cm', height + 10)
      .gte('weight_kg', weight - 10)
      .lte('weight_kg', weight + 10)
      .limit(limit);
    
    if (error) {
      console.error('Error finding similar profiles:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in findSimilarProfiles:', error);
    return [];
  }
}

module.exports = {
  generateRecommendations,
  findSimilarProfiles
};