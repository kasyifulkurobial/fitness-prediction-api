const fs = require("fs")
const csv = require("csv-parser")
const { createClient } = require("@supabase/supabase-js")
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    // Check if tables exist, create them if they don't
    await createTablesIfNotExist()

    // Check if data already exists
    const { count, error: countError } = await supabase.from("fitness_data").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking existing data:", countError)
    } else if (count > 0) {
      console.log(`Database already contains ${count} records. Do you want to reseed? (y/n)`)
      // In a real script, you would prompt the user here
      // For this example, we'll proceed with reseeding
      console.log("Proceeding with reseeding...")
    }

    // Clear existing data
    console.log("🗑️ Clearing existing data...")
    const { error: deleteError } = await supabase.from("fitness_data").delete().neq("id", 0) // Delete all records

    if (deleteError) {
      console.error("Error clearing data:", deleteError)
    }

    // Read and parse CSV file
    const csvData = []

    return new Promise((resolve, reject) => {
      fs.createReadStream("./data/data.csv")
        .pipe(csv())
        .on("data", (row) => {
          // Clean and transform data
          const cleanedRow = {
            age: Number.parseInt(row.age) || 0,
            gender: row.gender || "Unknown",
            height_cm: Number.parseFloat(row.height_cm) || 0,
            weight_kg: Number.parseFloat(row.weight_kg) || 0,
            "body fat_%": Number.parseFloat(row["body fat_%"] || 0),
            diastolic: Number.parseFloat(row.diastolic || 0),
            systolic: Number.parseFloat(row.systolic || 0),
            gripForce: Number.parseFloat(row.gripForce || 0),
            "sit and bend forward_cm": Number.parseFloat(row["sit and bend forward_cm"] || 0),
            "sit-ups counts": Number.parseInt(row["sit-ups counts"] || 0),
            "broad jump_cm": Number.parseFloat(row["broad jump_cm"] || 0),
            class: row.class || "D",
          }

          // Validate data
          if (cleanedRow.age > 0 && cleanedRow.height_cm > 0 && cleanedRow.weight_kg > 0) {
            csvData.push(cleanedRow)
          }
        })
        .on("end", async () => {
          try {
            console.log(`📊 Processed ${csvData.length} records from CSV`)

            // Insert data in batches
            const batchSize = 100
            let insertedCount = 0

            for (let i = 0; i < csvData.length; i += batchSize) {
              const batch = csvData.slice(i, i + batchSize)

              const { data, error } = await supabase.from("fitness_data").insert(batch)

              if (error) {
                console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
              } else {
                insertedCount += batch.length
                console.log(
                  `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(csvData.length / batchSize)} (${insertedCount}/${csvData.length} records)`,
                )
              }
            }

            // Verify insertion
            const { count, error: countError } = await supabase
              .from("fitness_data")
              .select("*", { count: "exact", head: true })

            if (countError) {
              console.error("Error counting records:", countError)
            } else {
              console.log(`🎉 Database seeding completed! Total records: ${count}`)
            }

            // Show class distribution
            const { data: classStats, error: statsError } = await supabase
              .from("fitness_data")
              .select("class")
              .order("class")

            if (!statsError && classStats) {
              const distribution = classStats.reduce((acc, row) => {
                acc[row.class] = (acc[row.class] || 0) + 1
                return acc
              }, {})

              console.log("📈 Class Distribution:")
              Object.entries(distribution).forEach(([cls, count]) => {
                console.log(`   Class ${cls}: ${count} records`)
              })
            }

            resolve()
          } catch (error) {
            reject(error)
          }
        })
        .on("error", (error) => {
          reject(error)
        })
    })
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Helper function to create tables if they don't exist
async function createTablesIfNotExist() {
  try {
    // Check if fitness_data table exists
    const { error: fitnessDataError } = await supabase.from("fitness_data").select("id").limit(1)

    if (fitnessDataError && fitnessDataError.code === "42P01") {
      // Table doesn't exist, create it using SQL
      const { error } = await supabase.rpc("create_fitness_data_table")
      if (error) {
        console.error("Error creating fitness_data table:", error)
      } else {
        console.log("Created fitness_data table")
      }
    }

    // Check if predictions table exists
    const { error: predictionsError } = await supabase.from("predictions").select("id").limit(1)

    if (predictionsError && predictionsError.code === "42P01") {
      // Table doesn't exist, create it using SQL
      const { error } = await supabase.rpc("create_predictions_table")
      if (error) {
        console.error("Error creating predictions table:", error)
      } else {
        console.log("Created predictions table")
      }
    }
  } catch (error) {
    console.error("Error checking/creating tables:", error)
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log("✨ Seeding process completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Seeding process failed:", error)
    process.exit(1)
  })
