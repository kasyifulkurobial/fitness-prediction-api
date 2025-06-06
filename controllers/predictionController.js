const { supabase } = require("../config/supabase")
const { calculateBMI, getBMICategory, calculateFitnessScore } = require("../utils/calculator")
const { generateRecommendations, findSimilarProfiles, predictFitnessClassFromData } = require("../utils/recommendation")

const predictFitness = async (req, res) => {
  try {
    const { name, weight, height, age, sitUpCounts, broadJump } = req.body

    // Calculate BMI
    const bmi = calculateBMI(weight, height)
    const bmiCategory = getBMICategory(bmi)

    // Create user profile
    const userProfile = {
      name,
      age,
      height,
      weight,
      sitUps: sitUpCounts,
      broadJump,
      bmi,
    }

    // Calculate initial fitness score using formula (as fallback)
    const initialFitnessScore = calculateFitnessScore(age, sitUpCounts, broadJump, bmi)

    // Determine fitness class from CSV data
    const predictedClass = await predictFitnessClassFromData(userProfile)

    // Use predicted class if available, otherwise use rule-based approach
    const fitnessClass = predictedClass || getFitnessClassFromScore(initialFitnessScore)

    // Calculate final fitness score based on class
    const fitnessScore = getFitnessScoreFromClass(fitnessClass, initialFitnessScore)

    // Generate recommendations
    const recommendations = await generateRecommendations(userProfile, fitnessClass, fitnessScore, bmi)

    // Find similar profiles for comparison
    const similarProfiles = await findSimilarProfiles(userProfile)

    // Save prediction to database
    const { data: predictionData, error: saveError } = await supabase
      .from("predictions")
      .insert([
        {
          user_name: name,
          age,
          height_cm: height,
          weight_kg: weight,
          sit_ups_counts: sitUpCounts,
          broad_jump_cm: broadJump,
          predicted_class: fitnessClass,
          bmi: Number.parseFloat(bmi.toFixed(2)),
          fitness_score: fitnessScore,
          recommendations: JSON.stringify(recommendations),
        },
      ])
      .select()

    if (saveError) {
      console.error("Error saving prediction:", saveError)
      // Continue without failing the request
    }

    // Get age group
    const ageGroup = getAgeGroup(age)

    // Prepare response
    const result = {
      success: true,
      data: {
        userInfo: {
          name,
          age,
          ageGroup,
          height,
          weight,
          sitUpCounts,
          broadJump,
        },
        analysis: {
          bmi: Number.parseFloat(bmi.toFixed(2)),
          bmiCategory,
          fitnessScore,
          fitnessClass,
          interpretation: {
            A: "Excellent - Kondisi fisik sangat baik",
            B: "Good - Kondisi fisik baik",
            C: "Fair - Kondisi fisik cukup",
            D: "Poor - Perlu perbaikan kondisi fisik",
          }[fitnessClass],
        },
        recommendations,
        similarProfiles: similarProfiles.map((profile) => ({
          age: profile.age,
          gender: profile.gender,
          height: profile.height_cm,
          weight: profile.weight_kg,
          sitUps: profile.sit_ups_counts,
          broadJump: profile.broad_jump_cm,
          class: profile.class,
        })),
        metadata: {
          predictionId: predictionData?.[0]?.id,
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      },
    }

    res.json(result)
  } catch (error) {
    console.error("Error in predictFitness:", error)
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan dalam memproses prediksi",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Helper function to get fitness class from score (fallback method)
function getFitnessClassFromScore(score) {
  if (score >= 85) return "A"
  if (score >= 70) return "B"
  if (score >= 55) return "C"
  return "D"
}

// Helper function to get fitness score from class
function getFitnessScoreFromClass(fitnessClass, fallbackScore) {
  const scoreRanges = {
    A: { min: 85, max: 100 },
    B: { min: 70, max: 84 },
    C: { min: 55, max: 69 },
    D: { min: 0, max: 54 },
  }

  const range = scoreRanges[fitnessClass]
  if (!range) return fallbackScore

  // Return the middle of the range
  return Math.round((range.min + range.max) / 2)
}

// Helper function to get age group
function getAgeGroup(age) {
  if (age < 25) return "Young Adult"
  if (age < 35) return "Adult"
  if (age < 50) return "Middle Age"
  if (age < 65) return "Senior"
  return "Elderly"
}

const getPredictionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, userName } = req.query
    const offset = (page - 1) * limit

    let query = supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (userName) {
      query = query.ilike("user_name", `%${userName}%`)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const formattedData = data.map((record) => ({
      ...record,
      recommendations: JSON.parse(record.recommendations || "[]"),
    }))

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error getting prediction history:", error)
    res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat prediksi",
    })
  }
}

const getDetailedAnalysis = async (req, res) => {
  try {
    const { predictionId } = req.params

    const { data, error } = await supabase.from("predictions").select("*").eq("id", predictionId).single()

    if (error) {
      throw error
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Prediksi tidak ditemukan",
      })
    }

    // Get statistics for comparison
    const { data: stats, error: statsError } = await supabase
      .from("predictions")
      .select("fitness_score, predicted_class")
      .gte("age", data.age - 5)
      .lte("age", data.age + 5)

    let comparison = {}
    if (!statsError && stats.length > 0) {
      const avgScore = stats.reduce((sum, s) => sum + s.fitness_score, 0) / stats.length
      const classDistribution = stats.reduce((acc, s) => {
        acc[s.predicted_class] = (acc[s.predicted_class] || 0) + 1
        return acc
      }, {})

      comparison = {
        averageScoreInAgeGroup: Number.parseFloat(avgScore.toFixed(2)),
        classDistribution,
        percentile: Math.round(
          (stats.filter((s) => s.fitness_score <= data.fitness_score).length / stats.length) * 100,
        ),
      }
    }

    res.json({
      success: true,
      data: {
        ...data,
        recommendations: JSON.parse(data.recommendations || "[]"),
        comparison,
      },
    })
  } catch (error) {
    console.error("Error getting detailed analysis:", error)
    res.status(500).json({
      success: false,
      message: "Gagal mengambil analisis detail",
    })
  }
}

module.exports = {
  predictFitness,
  getPredictionHistory,
  getDetailedAnalysis,
}
