const { supabase } = require('../config/supabase');
const csv = require('csv-parser');
const fs = require('fs');

const getFitnessData = async (req, res) => {
  try {
    const { page = 1, limit = 20, class: fitnessClass, gender, ageMin, ageMax } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('fitness_data')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (fitnessClass) {
      query = query.eq('class', fitnessClass);
    }
    
    if (gender) {
      query = query.eq('gender', gender);
    }
    
    if (ageMin) {
      query = query.gte('age', parseInt(ageMin));
    }
    
    if (ageMax) {
      query = query.lte('age', parseInt(ageMax));
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting fitness data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data fitness'
    });
  }
};

const getMetadata = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('metadata')
      .select('*')
      .order('no', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Error getting metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil metadata'
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    // Get basic statistics
    const { data: totalData, error: totalError } = await supabase
      .from('fitness_data')
      .select('id', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Get class distribution
    const { data: classData, error: classError } = await supabase
      .from('fitness_data')
      .select('class')
      .not('class', 'is', null);
    
    if (classError) throw classError;
    
    // Get gender distribution
    const { data: genderData, error: genderError } = await supabase
      .from('fitness_data')
      .select('gender')
      .not('gender', 'is', null);
    
    if (genderError) throw genderError;
    
    // Get age statistics
    const { data: ageData, error: ageError } = await supabase
      .from('fitness_data')
      .select('age')
      .not('age', 'is', null);
    
    if (ageError) throw ageError;
    
    // Process statistics
    const classDistribution = classData.reduce((acc, item) => {
      acc[item.class] = (acc[item.class] || 0) + 1;
      return acc;
    }, {});
    
    const genderDistribution = genderData.reduce((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {});
    
    const ages = ageData.map(item => item.age);
    const ageStats = {
      min: Math.min(...ages),
      max: Math.max(...ages),
      average: ages.reduce((sum, age) => sum + age, 0) / ages.length
    };
    
    // Get prediction statistics
    const { data: predictionStats, error: predError } = await supabase
      .from('predictions')
      .select('predicted_class, fitness_score, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    const recentPredictions = predError ? [] : predictionStats;
    
    const predictionClassDistribution = recentPredictions.reduce((acc, item) => {
      acc[item.predicted_class] = (acc[item.predicted_class] || 0) + 1;
      return acc;
    }, {});
    
    const avgFitnessScore = recentPredictions.length > 0 
      ? recentPredictions.reduce((sum, p) => sum + p.fitness_score, 0) / recentPredictions.length 
      : 0;
    
    res.json({
      success: true,
      data: {
        totalRecords: totalData?.length || 0,
        datasetStatistics: {
          classDistribution,
          genderDistribution,
          ageStatistics: {
            ...ageStats,
            average: parseFloat(ageStats.average.toFixed(1))
          }
        },
        predictionStatistics: {
          totalPredictions: recentPredictions.length,
          classDistribution: predictionClassDistribution,
          averageFitnessScore: parseFloat(avgFitnessScore.toFixed(2))
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik'
    });
  }
};

const uploadCSVData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File CSV diperlukan'
      });
    }
    
    const results = [];
    const filePath = req.file.path;
    
    // Read and parse CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Transform data to match database schema
          const transformedData = results.map(row => ({
            age: parseInt(row.age),
            gender: row.gender,
            height_cm: parseFloat(row.height_cm),
            weight_kg: parseFloat(row['weight*kg'] || row.weight_kg),
            body_fat_percent: parseFloat(row['body fat*%'] || row.body_fat_percent),
            diastolic: parseInt(row.diastolic),
            systolic: parseInt(row.systolic),
            grip_force: parseFloat(row.gripForce || row.grip_force),
            sit_and_bend_forward_cm: parseFloat(row['sit and bend forward_cm'] || row.sit_and_bend_forward_cm),
            sit_ups_counts: parseInt(row['sit-ups counts'] || row.sit_ups_counts),
            broad_jump_cm: parseFloat(row.broad_jump_cm),
            class: row.class
          }));
          
          // Insert data in batches
          const batchSize = 100;
          let insertedCount = 0;
          
          for (let i = 0; i < transformedData.length; i += batchSize) {
            const batch = transformedData.slice(i, i + batchSize);
            const { error } = await supabase
              .from('fitness_data')
              .insert(batch);
            
            if (error) {
              throw error;
            }
            
            insertedCount += batch.length;
          }
          
          // Clean up uploaded file
          fs.unlinkSync(filePath);
          
          res.json({
            success: true,
            message: `Berhasil mengupload ${insertedCount} data fitness`,
            data: {
              insertedRecords: insertedCount,
              totalProcessed: results.length
            }
          });
          
        } catch (error) {
          console.error('Error processing CSV:', error);
          // Clean up file on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          
          res.status(500).json({
            success: false,
            message: 'Gagal memproses file CSV',
            error: error.message
          });
        }
      });
    
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupload file CSV'
    });
  }
};

module.exports = {
  getFitnessData,
  getMetadata,
  getStatistics,
  uploadCSVData
};