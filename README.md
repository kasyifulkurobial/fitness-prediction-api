# Fitness Prediction API

Sistem prediksi fitness dengan rekomendasi yang menggunakan Express.js, Supabase, dan algoritma machine learning sederhana.

## 🚀 Fitur

- **Prediction System**: Prediksi level fitness berdasarkan input user
- **Smart Recommendations**: Rekomendasi personal berdasarkan analisis
- **Data Management**: Upload dan kelola dataset fitness
- **Statistics Dashboard**: Statistik lengkap dataset dan prediksi
- **History Tracking**: Riwayat prediksi dengan analisis detail

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- Account Supabase
- npm atau yarn

## 🛠️ Installation

1. **Clone repository**

```bash
git clone https://github.com/kasyifulkurobial/fitness-prediction-api.git
cd fitness-prediction-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Supabase Anda:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5432
NODE_ENV=development
```

4. **Start development server**

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5432`

## 📊 Database Schema

### fitness_data

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | SERIAL | Primary key |
| age | DECIMAL | Usia dalam tahun |
| gender | VARCHAR(10) | Jenis kelamin (M/F) |
| height_cm | DECIMAL(5,2) | Tinggi badan (cm) |
| weight_kg | DECIMAL(5,2) | Berat badan (kg) |
| body_fat_percent | DECIMAL(5,2) | Persentase lemak tubuh |
| diastolic | DECIMAL | Tekanan darah diastolik |
| systolic | DECIMAL | Tekanan darah sistolik |
| grip_force | DECIMAL(5,2) | Kekuatan genggaman |
| sit_and_bend_forward_cm | DECIMAL(5,2) | Fleksibilitas (cm) |
| sit_ups_counts | DECIMAL | Jumlah sit-up |
| broad_jump_cm | DECIMAL(5,2) | Lompat jauh (cm) |
| class | VARCHAR(20) | Klasifikasi fitness (A,B,C,D) |

### predictions

| Kolom           | Tipe         | Deskripsi          |
|-----------------|--------------|--------------------|
| id              | SERIAL       | Primary key        |
| user_name       | VARCHAR(100) | Nama user          |
| age             | DECIMAL      | Usia               |
| height_cm       | DECIMAL(5,2) | Tinggi badan       |
| weight_kg       | DECIMAL(5,2) | Berat badan        |
| sit_ups_counts  | DECIMAL      | Jumlah sit-up      |
| broad_jump_cm   | DECIMAL(5,2) | Lompat jauh        |
| predicted_class | VARCHAR(20)  | Hasil prediksi     |
| bmi             | DECIMAL(5,2) | BMI                |
| fitness_score   | DECIMAL(5,2) | Skor fitness       |
| recommendations | TEXT         | Rekomendasi (JSON) |

## 🔌 API Endpoints

### Prediction Endpoints

#### POST /api/prediction/predict

Melakukan prediksi fitness berdasarkan input user.

**Request Body:**

```json
{
  "name": "John Doe",
  "weight": 70,
  "height": 175,
  "age": 25,
  "sitUpCounts": 30,
  "broadJump": 220
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userInfo": {
      "name": "John Doe",
      "age": 25,
      "ageGroup": "Young Adult",
      "height": 175,
      "weight": 70,
      "sitUpCounts": 30,
      "broadJump": 220
    },
    "analysis": {
      "bmi": 22.86,
      "bmiCategory": "Normal",
      "fitnessScore": 75,
      "fitnessClass": "B",
      "interpretation": "Good - Kondisi fisik baik"
    },
    "recommendations": [
      {
        "title": "💪 Good Fitness Level",
        "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
        "tips": [
          "Tambahkan latihan kekuatan 2-3x seminggu",
          "Tingkatkan durasi dan intensitas kardio",
          "Fokus pada fleksibilitas dan mobilitas"
        ]
      }
    ],
    "similarProfiles": [],
    "metadata": {
      "predictionId": 123,
      "timestamp": "2024-01-15T10:30:00Z",
      "version": "1.0"
    }
  }
}
```

#### GET /api/prediction/history

Mengambil riwayat prediksi dengan pagination.

```json
{
    "success": true,
    "data": [
        {
            "id": 2,
            "user_name": "John Doe",
            "age": 25,
            "height_cm": 175,
            "weight_kg": 70,
            "sit_ups_counts": 30,
            "broad_jump_cm": 220,
            "predicted_class": "A",
            "bmi": 22.86,
            "fitness_score": 88,
            "recommendations": [
                {
                    "title": "🌟 Excellent Fitness Level!",
                    "message": "Pertahankan performa yang luar biasa ini!",
                    "tips": [
                        "Tingkatkan intensitas latihan untuk tantangan lebih besar",
                        "Fokus pada latihan variasi untuk mencegah plateau",
                        "Pertimbangkan untuk menjadi mentor fitness bagi orang lain"
                    ]
                },
                {
                    "title": "💪 Latihan Core",
                    "message": "Target sit-ups untuk usia Anda: 40",
                    "tips": [
                        "Lakukan latihan core 3-4x seminggu",
                        "Mulai dengan plank, mountain climbers, dan crunches",
                        "Tingkatkan secara bertahap 2-3 repetisi per minggu"
                    ]
                },
                {
                    "title": "🦘 Latihan Explosive Power",
                    "message": "Target broad jump untuk usia Anda: 240cm",
                    "tips": [
                        "Latihan plyometric seperti jump squats dan burpees",
                        "Strengthening otot kaki dengan squats dan lunges",
                        "Latihan koordinasi dan timing"
                    ]
                }
            ],
            "created_at": "2025-05-30T03:40:12.713039"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 0,
        "totalRecords": null,
        "limit": 10
    }
}
```

**Query Parameters:**

- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 10)
- `userName` (optional): Filter berdasarkan nama

#### GET /api/prediction/:predictionId

Mengambil analisis detail untuk prediksi tertentu.
**Response**

```json
{
    "success": true,
    "data": {
        "id": 2,
        "user_name": "John Doe",
        "age": 25,
        "height_cm": 175,
        "weight_kg": 70,
        "sit_ups_counts": 30,
        "broad_jump_cm": 220,
        "predicted_class": "A",
        "bmi": 22.86,
        "fitness_score": 88,
        "recommendations": [
            {
                "title": "🌟 Excellent Fitness Level!",
                "message": "Pertahankan performa yang luar biasa ini!",
                "tips": [
                    "Tingkatkan intensitas latihan untuk tantangan lebih besar",
                    "Fokus pada latihan variasi untuk mencegah plateau",
                    "Pertimbangkan untuk menjadi mentor fitness bagi orang lain"
                ]
            },
            {
                "title": "💪 Latihan Core",
                "message": "Target sit-ups untuk usia Anda: 40",
                "tips": [
                    "Lakukan latihan core 3-4x seminggu",
                    "Mulai dengan plank, mountain climbers, dan crunches",
                    "Tingkatkan secara bertahap 2-3 repetisi per minggu"
                ]
            },
            {
                "title": "🦘 Latihan Explosive Power",
                "message": "Target broad jump untuk usia Anda: 240cm",
                "tips": [
                    "Latihan plyometric seperti jump squats dan burpees",
                    "Strengthening otot kaki dengan squats dan lunges",
                    "Latihan koordinasi dan timing"
                ]
            }
        ],
        "created_at": "2025-05-30T03:40:12.713039",
        "comparison": {
            "averageScoreInAgeGroup": 88,
            "classDistribution": {
                "A": 1
            },
            "percentile": 100
        }
    }
}
```

### Data Management Endpoints

#### GET /api/data/fitness

Mengambil dataset fitness dengan filtering dan pagination.

**Query Parameters:**

- `page`, `limit`: Pagination
- `class`: Filter berdasarkan fitness class
- `gender`: Filter berdasarkan gender (F or M)
- `ageMin`, `ageMax`: Filter berdasarkan rentang usia

#### GET /api/data/metadata

Mengambil informasi metadata dataset.

#### GET /api/data/statistics

Mengambil statistik dataset dan prediksi.

#### POST /api/data/upload

Upload file CSV dataset baru.

**Form Data:**

- `csvFile`: File CSV

### Health Check

#### GET /api/health

Status kesehatan API.

## 🧮 Algoritma Prediksi

Sistem menggunakan algoritma scoring yang mempertimbangkan:

1. **BMI Scoring** (0-20 poin): Berdasarkan kategori BMI WHO
2. **Sit-ups Performance** (0-30 poin): Disesuaikan dengan standar usia
3. **Broad Jump Performance** (0-30 poin): Disesuaikan dengan standar usia  
4. **Age Factor** (0-20 poin): Bonus berdasarkan kelompok usia

**Klasifikasi:**

- **A (85-100)**: Excellent - Kondisi fisik sangat baik
- **B (70-84)**: Good - Kondisi fisik baik
- **C (55-69)**: Fair - Kondisi fisik cukup
- **D (0-54)**: Poor - Perlu perbaikan kondisi fisik

## 🎯 Sistem Rekomendasi

Rekomendasi dibuat berdasarkan:

- Fitness class hasil prediksi
- Analisis BMI dan kategorinya
- Performa sit-ups vs target usia
- Performa broad jump vs target usia
- Faktor usia dan kelompok demografis

## 📝 Development

### Scripts

```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run setup-db    # Setup database tables
```

### Struktur Code

- `controllers/`: Logic bisnis utama
- `routes/`: Definisi endpoint API
- `middleware/`: Validation dan error handling
- `utils/`: Helper functions dan kalkulasi
- `config/`: Konfigurasi database dan environment

## 🔒 Security Features

- Input validation dengan Joi
- SQL injection protection via Supabase
- File upload restrictions
- Error handling yang aman
- Environment variable protection

## 🚀 Deployment

1. Setup Supabase project di production
2. Update environment variables
3. Deploy ke platform pilihan (Vercel, Railway, dll)
4. Run database setup di production

## 📄 Example Frontend Integration

```javascript
// Contoh penggunaan di frontend
const predictFitness = async (userData) => {
  try {
    const response = await fetch('/api/prediction/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Tampilkan hasil prediksi dan rekomendasi
      displayResults(result.data);
    }
  } catch (error) {
    console.error('Prediction error:', error);
  }
};
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.

---

## Made with ❤️ for fitness enthusiasts