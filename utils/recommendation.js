const { supabase } = require("../config/supabase")

async function generateRecommendations(userProfile, fitnessClass, fitnessScore, bmi) {
  const { age, height, weight, sitUps, broadJump } = userProfile
  const recommendations = []

  try {
    // Determine fitness class from CSV data instead of rule-based
    const predictedClass = await predictFitnessClassFromData(userProfile)

    // Use the predicted class from CSV if available, otherwise use the calculated one
    const finalFitnessClass = predictedClass || fitnessClass

    // Find similar profiles from CSV data
    const similarProfiles = await findSimilarProfiles(userProfile, 10)

    // Find successful profiles (Class A and B) with similar characteristics
    const successfulProfiles = await findSuccessfulProfiles(userProfile)

    // Generate class-specific recommendations based on data
    const classRecommendation = await generateClassBasedRecommendation(finalFitnessClass, similarProfiles)
    if (classRecommendation) {
      recommendations.push(classRecommendation)
    }

    // Generate improvement recommendations based on successful profiles
    const improvementRecommendations = await generateImprovementRecommendations(
      userProfile,
      successfulProfiles,
      finalFitnessClass,
    )
    recommendations.push(...improvementRecommendations)

    // Generate BMI-specific recommendations from data
    const bmiRecommendation = await generateBMIRecommendations(userProfile, bmi)
    if (bmiRecommendation) {
      recommendations.push(bmiRecommendation)
    }

    // Generate age-specific recommendations from data
    const ageRecommendation = await generateAgeBasedRecommendations(userProfile)
    if (ageRecommendation) {
      recommendations.push(ageRecommendation)
    }

    // If no recommendations were generated, add a default one
    if (recommendations.length === 0) {
      recommendations.push({
        title: "📊 Rekomendasi Umum",
        message: "Berdasarkan profil Anda",
        tips: [
          "Lakukan latihan kardio minimal 150 menit per minggu",
          "Tambahkan latihan kekuatan 2-3 kali seminggu",
          "Jaga pola makan seimbang dan istirahat yang cukup",
        ],
      })
    }
  } catch (error) {
    console.error("Error generating data-driven recommendations:", error)
    // Fallback to basic recommendation
    recommendations.push({
      title: "📊 Rekomendasi Dasar",
      message: "Berdasarkan analisis dasar profil Anda",
      tips: ["Tingkatkan konsistensi latihan", "Perhatikan pola makan seimbang", "Istirahat yang cukup untuk recovery"],
    })
  }

  return recommendations
}

// Predict fitness class based on CSV data using k-nearest neighbors approach
async function predictFitnessClassFromData(userProfile) {
  try {
    const { age, height, weight, sitUps, broadJump } = userProfile

    // Find similar profiles for classification
    const { data, error } = await supabase
      .from("fitness_data")
      .select("*")
      .gte("age", age - 10)
      .lte("age", age + 10)
      .gte("height_cm", height - 15)
      .lte("height_cm", height + 15)
      .gte("weight_kg", weight - 15)
      .lte("weight_kg", weight + 15)
      .limit(20)

    if (error || !data || data.length === 0) {
      console.error("Error or no data found for class prediction:", error)
      return null
    }

    // Calculate similarity scores
    const profilesWithSimilarity = data.map((profile) => {
      // Calculate Euclidean distance for similarity
      const ageDiff = Math.abs(profile.age - age) / 10 // Normalize by decade
      const heightDiff = Math.abs(profile.height_cm - height) / 20 // Normalize by ~20cm
      const weightDiff = Math.abs(profile.weight_kg - weight) / 20 // Normalize by ~20kg

      // If sit-ups and broad jump data exists in the profile
      let sitUpDiff = 0
      let broadJumpDiff = 0

      if (profile["sit-ups counts"] && sitUps) {
        sitUpDiff = Math.abs(profile["sit-ups counts"] - sitUps) / 30 // Normalize by ~30 sit-ups
      }

      if (profile["broad jump_cm"] && broadJump) {
        broadJumpDiff = Math.abs(profile["broad jump_cm"] - broadJump) / 100 // Normalize by ~100cm
      }

      // Calculate weighted similarity score (lower is more similar)
      const similarityScore =
        ageDiff * 1.0 + heightDiff * 1.0 + weightDiff * 1.0 + sitUpDiff * 2.0 + broadJumpDiff * 2.0

      return { ...profile, similarityScore }
    })

    // Sort by similarity (lowest score = most similar)
    const sortedProfiles = profilesWithSimilarity.sort((a, b) => a.similarityScore - b.similarityScore)

    // Take top 5 most similar profiles
    const topProfiles = sortedProfiles.slice(0, 5)

    // Count class occurrences among top profiles
    const classCount = topProfiles.reduce((acc, profile) => {
      acc[profile.class] = (acc[profile.class] || 0) + 1
      return acc
    }, {})

    // Find the most common class
    let predictedClass = null
    let maxCount = 0

    for (const [cls, count] of Object.entries(classCount)) {
      if (count > maxCount) {
        maxCount = count
        predictedClass = cls
      }
    }

    console.log(`Predicted class from CSV data: ${predictedClass} (based on ${topProfiles.length} similar profiles)`)
    return predictedClass
  } catch (error) {
    console.error("Error predicting fitness class from data:", error)
    return null
  }
}

// Find successful profiles with similar characteristics
async function findSuccessfulProfiles(userProfile, limit = 5) {
  try {
    const { age, height, weight } = userProfile

    const { data, error } = await supabase
      .from("fitness_data")
      .select("*")
      .in("class", ["A", "B"]) // Only successful classes
      .gte("age", age - 10)
      .lte("age", age + 10)
      .gte("height_cm", height - 15)
      .lte("height_cm", height + 15)
      .gte("weight_kg", weight - 15)
      .lte("weight_kg", weight + 15)
      .limit(limit)

    if (error) {
      console.error("Error finding successful profiles:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in findSuccessfulProfiles:", error)
    return []
  }
}

// Generate class-based recommendations from data analysis
async function generateClassBasedRecommendation(fitnessClass, similarProfiles) {
  try {
    const classStats = await getClassStatistics(fitnessClass)

    // If we couldn't get valid statistics, return null
    if (!classStats || classStats.avgSitUps === 0 || classStats.avgBroadJump === 0) {
      return null
    }

    const classMessages = {
      A: {
        title: "🌟 Excellent Fitness Level!",
        message: `Anda berada di ${classStats.percentile}% teratas! Pertahankan performa luar biasa ini.`,
        tips: [
          `Rata-rata sit-ups kelas A: ${classStats.avgSitUps} repetisi`,
          `Rata-rata broad jump kelas A: ${classStats.avgBroadJump}cm`,
          "Fokus pada variasi latihan untuk mencegah plateau",
        ],
      },
      B: {
        title: "💪 Good Fitness Level",
        message: `Anda dalam kondisi baik! Untuk mencapai kelas A, tingkatkan performa.`,
        tips: [
          `Target sit-ups untuk kelas A: ${classStats.targetSitUps} repetisi`,
          `Target broad jump untuk kelas A: ${classStats.targetBroadJump}cm`,
          "Tingkatkan intensitas latihan secara bertahap",
        ],
      },
      C: {
        title: "⚡ Fair Fitness Level",
        message: `Ada potensi besar untuk improvement! Data menunjukkan Anda bisa mencapai kelas B.`,
        tips: [
          `Target sit-ups untuk kelas B: ${classStats.targetSitUps} repetisi`,
          `Target broad jump untuk kelas B: ${classStats.targetBroadJump}cm`,
          "Konsistensi latihan adalah kunci utama",
        ],
      },
      D: {
        title: "🎯 Mari Mulai Perjalanan Fitness!",
        message: `Berdasarkan data, dengan latihan konsisten Anda bisa mencapai kelas C dalam 3-6 bulan.`,
        tips: [
          `Mulai dengan target sit-ups: ${Math.max(5, classStats.minSitUps)} repetisi per hari`,
          `Target awal broad jump: ${Math.max(100, classStats.minBroadJump)}cm`,
          "Mulai dengan latihan ringan 3x seminggu",
        ],
      },
    }

    return classMessages[fitnessClass] || classMessages["D"]
  } catch (error) {
    console.error("Error generating class-based recommendation:", error)
    return null
  }
}

// Generate improvement recommendations based on successful profiles
async function generateImprovementRecommendations(userProfile, successfulProfiles, currentClass) {
  const recommendations = []

  try {
    if (!successfulProfiles || successfulProfiles.length === 0) {
      // If no successful profiles found, get general targets based on class
      const { data, error } = await supabase
        .from("fitness_data")
        .select('"sit-ups counts", "broad jump_cm"')
        .in("class", ["A", "B"])
        .limit(20)

      if (error || !data || data.length === 0) {
        return [
          {
            title: "💪 Peningkatan Performa",
            message: "Rekomendasi umum untuk peningkatan performa",
            tips: [
              "Tingkatkan jumlah sit-ups secara bertahap",
              "Latihan plyometric untuk meningkatkan broad jump",
              "Kombinasikan latihan kardio dan kekuatan",
            ],
          },
        ]
      }

      // Calculate averages from general data
      const avgSitUps = Math.round(data.reduce((sum, p) => sum + (p["sit-ups counts"] || 0), 0) / data.length)
      const avgBroadJump = Math.round(data.reduce((sum, p) => sum + (p["broad jump_cm"] || 0), 0) / data.length)

      const { sitUps, broadJump } = userProfile

      if (sitUps < avgSitUps) {
        recommendations.push({
          title: "💪 Peningkatan Sit-ups",
          message: `Rata-rata sit-ups kelas A/B adalah ${avgSitUps} repetisi`,
          tips: [
            `Tingkatkan ${Math.max(5, avgSitUps - sitUps)} repetisi dari performa saat ini`,
            "Latihan core 3-4x seminggu dengan progressive overload",
            "Tambahkan variasi: plank, bicycle crunches, mountain climbers",
          ],
        })
      }

      if (broadJump < avgBroadJump) {
        recommendations.push({
          title: "🦘 Peningkatan Explosive Power",
          message: `Rata-rata broad jump kelas A/B adalah ${avgBroadJump}cm`,
          tips: [
            `Target peningkatan: ${Math.max(10, avgBroadJump - broadJump)}cm dari performa saat ini`,
            "Latihan plyometric: jump squats, box jumps, burpees",
            "Strengthening kaki: squats, lunges, calf raises",
          ],
        })
      }

      return recommendations
    }

    const { sitUps, broadJump } = userProfile

    // Analyze sit-ups improvement potential
    const validSitUps = successfulProfiles.filter((p) => p["sit-ups counts"] && p["sit-ups counts"] > 0)
    if (validSitUps.length > 0) {
      const avgSuccessfulSitUps = Math.round(
        validSitUps.reduce((sum, p) => sum + p["sit-ups counts"], 0) / validSitUps.length,
      )

      if (sitUps < avgSuccessfulSitUps) {
        const improvement = Math.max(5, Math.ceil(avgSuccessfulSitUps - sitUps))
        recommendations.push({
          title: "💪 Peningkatan Sit-ups",
          message: `Profil sukses serupa rata-rata melakukan ${avgSuccessfulSitUps} sit-ups`,
          tips: [
            `Tingkatkan ${improvement} repetisi dari performa saat ini`,
            "Latihan core 3-4x seminggu dengan progressive overload",
            "Tambahkan variasi: plank, bicycle crunches, mountain climbers",
          ],
        })
      }
    }

    // Analyze broad jump improvement potential
    const validBroadJumps = successfulProfiles.filter((p) => p["broad jump_cm"] && p["broad jump_cm"] > 0)
    if (validBroadJumps.length > 0) {
      const avgSuccessfulBroadJump = Math.round(
        validBroadJumps.reduce((sum, p) => sum + p["broad jump_cm"], 0) / validBroadJumps.length,
      )

      if (broadJump < avgSuccessfulBroadJump) {
        const improvement = Math.max(10, Math.ceil(avgSuccessfulBroadJump - broadJump))
        recommendations.push({
          title: "🦘 Peningkatan Explosive Power",
          message: `Profil sukses serupa rata-rata mencapai ${avgSuccessfulBroadJump}cm`,
          tips: [
            `Target peningkatan: ${improvement}cm dari performa saat ini`,
            "Latihan plyometric: jump squats, box jumps, burpees",
            "Strengthening kaki: squats, lunges, calf raises",
          ],
        })
      }
    }
  } catch (error) {
    console.error("Error generating improvement recommendations:", error)
    // Add a default recommendation if there's an error
    recommendations.push({
      title: "💪 Peningkatan Performa",
      message: "Rekomendasi umum untuk peningkatan performa",
      tips: [
        "Tingkatkan jumlah sit-ups secara bertahap",
        "Latihan plyometric untuk meningkatkan broad jump",
        "Kombinasikan latihan kardio dan kekuatan",
      ],
    })
  }

  return recommendations
}

// Generate BMI recommendations based on data analysis
async function generateBMIRecommendations(userProfile, bmi) {
  try {
    // Find profiles with optimal BMI and good fitness class
    const { data: optimalProfiles, error } = await supabase
      .from("fitness_data")
      .select("*")
      .gte("height_cm", userProfile.height - 5)
      .lte("height_cm", userProfile.height + 5)
      .in("class", ["A", "B"])
      .limit(10)

    if (error || !optimalProfiles || optimalProfiles.length === 0) {
      return null
    }

    const avgOptimalWeight = Math.round(
      optimalProfiles.reduce((sum, p) => sum + p.weight_kg, 0) / optimalProfiles.length,
    )
    const weightDiff = Math.round(userProfile.weight - avgOptimalWeight)

    if (Math.abs(weightDiff) > 5) {
      return {
        title: "⚖️ Optimalisasi Berat Badan",
        message: `Profil sukses dengan tinggi serupa rata-rata memiliki berat ${avgOptimalWeight}kg`,
        tips: [
          weightDiff > 0
            ? `Pertimbangkan penurunan ${weightDiff}kg untuk performa optimal`
            : `Pertimbangkan penambahan ${Math.abs(weightDiff)}kg massa otot`,
          "Konsultasi dengan ahli gizi untuk program yang tepat",
          "Kombinasikan latihan kardio dan strength training",
        ],
      }
    }
  } catch (error) {
    console.error("Error generating BMI recommendations:", error)
  }

  return null
}

// Generate age-based recommendations from data
async function generateAgeBasedRecommendations(userProfile) {
  try {
    const { age } = userProfile
    const { data: ageGroupData, error } = await supabase
      .from("fitness_data")
      .select("*")
      .gte("age", age - 5)
      .lte("age", age + 5)
      .in("class", ["A", "B"])
      .limit(10)

    if (error || !ageGroupData || ageGroupData.length === 0) {
      return null
    }

    // Filter valid data points
    const validSitUps = ageGroupData.filter((p) => p["sit-ups counts"] && p["sit-ups counts"] > 0)
    const validBroadJumps = ageGroupData.filter((p) => p["broad jump_cm"] && p["broad jump_cm"] > 0)

    // Calculate averages only if we have valid data
    const avgSitUps =
      validSitUps.length > 0
        ? Math.round(validSitUps.reduce((sum, p) => sum + p["sit-ups counts"], 0) / validSitUps.length)
        : 30 // Default value if no data

    const avgBroadJump =
      validBroadJumps.length > 0
        ? Math.round(validBroadJumps.reduce((sum, p) => sum + p["broad jump_cm"], 0) / validBroadJumps.length)
        : 200 // Default value if no data

    return {
      title: `🎯 Standar Usia ${age} Tahun`,
      message: `Berdasarkan data ${ageGroupData.length} profil sukses seusia Anda`,
      tips: [
        `Standar sit-ups usia Anda: ${avgSitUps} repetisi`,
        `Standar broad jump usia Anda: ${avgBroadJump}cm`,
        age >= 40
          ? "Fokus pada fleksibilitas dan recovery yang lebih baik"
          : "Manfaatkan usia muda untuk membangun fondasi kekuatan",
      ],
    }
  } catch (error) {
    console.error("Error generating age-based recommendations:", error)
    return null
  }
}

// Get class statistics from data
async function getClassStatistics(targetClass) {
  try {
    // Get statistics for target class
    const { data: classData, error: classError } = await supabase
      .from("fitness_data")
      .select('"sit-ups counts", "broad jump_cm"')
      .eq("class", targetClass)

    // Get statistics for next better class
    const nextClass = targetClass === "D" ? "C" : targetClass === "C" ? "B" : "A"
    const { data: nextClassData, error: nextError } = await supabase
      .from("fitness_data")
      .select('"sit-ups counts", "broad jump_cm"')
      .eq("class", nextClass)

    if (classError || nextError) {
      console.error("Error getting class statistics:", classError || nextError)
      return {
        avgSitUps: 30, // Default values
        avgBroadJump: 200,
        targetSitUps: 40,
        targetBroadJump: 220,
        minSitUps: 20,
        minBroadJump: 180,
        percentile: targetClass === "A" ? 95 : targetClass === "B" ? 75 : targetClass === "C" ? 50 : 25,
      }
    }

    // Filter valid data points
    const validClassSitUps = classData.filter((p) => p["sit-ups counts"] && p["sit-ups counts"] > 0)
    const validClassBroadJumps = classData.filter((p) => p["broad jump_cm"] && p["broad jump_cm"] > 0)
    const validNextSitUps = nextClassData.filter((p) => p["sit-ups counts"] && p["sit-ups counts"] > 0)
    const validNextBroadJumps = nextClassData.filter((p) => p["broad jump_cm"] && p["broad jump_cm"] > 0)

    // Calculate statistics with fallback values
    const stats = {
      avgSitUps:
        validClassSitUps.length > 0
          ? Math.round(validClassSitUps.reduce((sum, p) => sum + p["sit-ups counts"], 0) / validClassSitUps.length)
          : 30, // Default value

      avgBroadJump:
        validClassBroadJumps.length > 0
          ? Math.round(validClassBroadJumps.reduce((sum, p) => sum + p["broad jump_cm"], 0) / validClassBroadJumps.length)
          : 200, // Default value

      targetSitUps:
        validNextSitUps.length > 0
          ? Math.round(validNextSitUps.reduce((sum, p) => sum + p["sit-ups counts"], 0) / validNextSitUps.length)
          : 40, // Default value

      targetBroadJump:
        validNextBroadJumps.length > 0
          ? Math.round(validNextBroadJumps.reduce((sum, p) => sum + p["broad jump_cm"], 0) / validNextBroadJumps.length)
          : 220, // Default value

      minSitUps: validClassSitUps.length > 0 ? Math.min(...validClassSitUps.map((p) => p["sit-ups counts"])) : 20, // Default value

      minBroadJump:
        validClassBroadJumps.length > 0 ? Math.min(...validClassBroadJumps.map((p) => p["broad jump_cm"])) : 180, // Default value

      percentile: targetClass === "A" ? 95 : targetClass === "B" ? 75 : targetClass === "C" ? 50 : 25,
    }

    return stats
  } catch (error) {
    console.error("Error getting class statistics:", error)
    // Return default values if there's an error
    return {
      avgSitUps: 30,
      avgBroadJump: 200,
      targetSitUps: 40,
      targetBroadJump: 220,
      minSitUps: 20,
      minBroadJump: 180,
      percentile: targetClass === "A" ? 95 : targetClass === "B" ? 75 : targetClass === "C" ? 50 : 25,
    }
  }
}

async function findSimilarProfiles(userProfile, limit = 5) {
  try {
    const { age, height, weight, sitUps, broadJump } = userProfile

    // Calculate similarity score using multiple factors
    const { data, error } = await supabase
      .from("fitness_data")
      .select("*")
      .gte("age", age - 10)
      .lte("age", age + 10)
      .gte("height_cm", height - 15)
      .lte("height_cm", height + 15)
      .gte("weight_kg", weight - 15)
      .lte("weight_kg", weight + 15)
      .limit(30)

    if (error || !data || data.length === 0) {
      console.error("Error or no data found for similar profiles:", error)
      return []
    }

    // Calculate similarity scores and sort
    const profilesWithSimilarity = data.map((profile) => {
      const ageDiff = Math.abs(profile.age - age)
      const heightDiff = Math.abs(profile.height_cm - height)
      const weightDiff = Math.abs(profile.weight_kg - weight)

      // Handle potential null values
      let sitUpDiff = 0
      let broadJumpDiff = 0

      if (profile["sit-ups counts"] && sitUps) {
        sitUpDiff = Math.abs(profile["sit-ups counts"] - sitUps)
      }

      if (profile["broad jump_cm"] && broadJump) {
        broadJumpDiff = Math.abs(profile["broad jump_cm"] - broadJump)
      }

      // Calculate similarity score (lower is more similar)
      const similarityScore =
        ageDiff * 0.2 + heightDiff * 0.2 + weightDiff * 0.2 + sitUpDiff * 0.2 + broadJumpDiff * 0.2

      return { ...profile, similarityScore }
    })

    // Sort by similarity and return top matches
    return profilesWithSimilarity.sort((a, b) => a.similarityScore - b.similarityScore).slice(0, limit)
  } catch (error) {
    console.error("Error finding similar profiles:", error)
    return []
  }
}

module.exports = {
  generateRecommendations,
  findSimilarProfiles,
  predictFitnessClassFromData,
}