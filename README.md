# Fitness Prediction API

Sistem prediksi fitness dengan rekomendasi yang menggunakan Express.js, Supabase, dan algoritma machine learning sederhana.

## Fitur

- Prediksi kelas fitness (A/B/C/D) berdasarkan data CSV menggunakan pendekatan k-nearest neighbors
- Rekomendasi peningkatan fitness berdasarkan analisis data
- Riwayat prediksi dan analisis detail
- Integrasi dengan Supabase untuk penyimpanan data

## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- Account Supabase
- npm atau yarn
## Alur Kerja Prediksi

1. User menginputkan data (nama, berat, tinggi, usia, sit-up counts, broad jump)
2. Sistem mencari profil serupa dari data CSV
3. Sistem memprediksi kelas fitness berdasarkan k-nearest neighbors dari data CSV
4. Sistem menganalisis gap antara performa user dan profil sukses (kelas A/B)
5. Sistem menghasilkan rekomendasi berdasarkan analisis data
6. Hasil prediksi disimpan ke database dan dikembalikan ke user

## Algoritma Prediksi

Sistem menggunakan pendekatan k-nearest neighbors untuk memprediksi kelas fitness:

1. Mencari profil dengan karakteristik serupa (usia, tinggi, berat)
2. Menghitung similarity score berdasarkan Euclidean distance
3. Mengambil k profil terdekat (default: 5)
4. Menentukan kelas berdasarkan majority voting dari profil terdekat

## Algoritma Rekomendasi

Rekomendasi dihasilkan berdasarkan analisis data CSV:

1. Mencari profil sukses (kelas A/B) dengan karakteristik serupa
2. Menganalisis gap antara performa user dan rata-rata profil sukses
3. Menghasilkan rekomendasi spesifik berdasarkan gap tersebut
4. Memberikan target peningkatan berdasarkan data statistik

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
            "name": "Abogoboga 12323456",
            "age": 25,
            "ageGroup": "Adult",
            "height": 155,
            "weight": 50,
            "sitUpCounts": 30,
            "broadJump": 120
        },
        "analysis": {
            "bmi": 20.81,
            "bmiCategory": "Normal",
            "fitnessScore": 62,
            "fitnessClass": "C",
            "interpretation": "Fair - Kondisi fisik cukup"
        },
        "recommendations": [
            {
                "title": "⚡ Fair Fitness Level",
                "message": "Ada potensi besar untuk improvement! Data menunjukkan Anda bisa mencapai kelas B.",
                "tips": [
                    "Target sit-ups untuk kelas B: 42 repetisi",
                    "Target broad jump untuk kelas B: 194cm",
                    "Konsistensi latihan adalah kunci utama"
                ]
            },
            {
                "title": "💪 Peningkatan Sit-ups",
                "message": "Profil sukses serupa rata-rata melakukan 45 sit-ups",
                "tips": [
                    "Tingkatkan 15 repetisi dari performa saat ini",
                    "Latihan core 3-4x seminggu dengan progressive overload",
                    "Tambahkan variasi: plank, bicycle crunches, mountain climbers"
                ]
            },
            {
                "title": "🦘 Peningkatan Explosive Power",
                "message": "Profil sukses serupa rata-rata mencapai 182cm",
                "tips": [
                    "Target peningkatan: 62cm dari performa saat ini",
                    "Latihan plyometric: jump squats, box jumps, burpees",
                    "Strengthening kaki: squats, lunges, calf raises"
                ]
            },
            {
                "title": "🎯 Standar Usia 25 Tahun",
                "message": "Berdasarkan data 10 profil sukses seusia Anda",
                "tips": [
                    "Standar sit-ups usia Anda: 48 repetisi",
                    "Standar broad jump usia Anda: 200cm",
                    "Manfaatkan usia muda untuk membangun fondasi kekuatan"
                ]
            }
        ],
        "similarProfiles": [
            {
                "age": 31,
                "gender": "F",
                "height": 165,
                "weight": 57.3,
                "class": "D"
            },
            {
                "age": 23,
                "gender": "F",
                "height": 160.3,
                "weight": 46.8,
                "class": "D"
            },
            {
                "age": 24,
                "gender": "F",
                "height": 154.2,
                "weight": 37.3,
                "class": "D"
            },
            {
                "age": 23,
                "gender": "F",
                "height": 169.9,
                "weight": 54.2,
                "class": "D"
            },
            {
                "age": 27,
                "gender": "F",
                "height": 158.4,
                "weight": 51,
                "class": "C"
            }
        ],
        "metadata": {
            "predictionId": 41,
            "timestamp": "2025-06-06T02:48:06.859Z",
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
            "id": 39,
            "user_name": "Abogoboga",
            "age": 25,
            "height_cm": 175,
            "weight_kg": 70,
            "sit_ups_counts": 30,
            "broad_jump_cm": 220,
            "predicted_class": "A",
            "bmi": 22.86,
            "fitness_score": 93,
            "recommendations": [
                {
                    "title": "🌟 Excellent Fitness Level!",
                    "message": "Anda berada di 95% teratas! Pertahankan performa luar biasa ini.",
                    "tips": [
                        "Rata-rata sit-ups kelas A: 30 repetisi",
                        "Rata-rata broad jump kelas A: 200cm",
                        "Fokus pada variasi latihan untuk mencegah plateau"
                    ]
                },
                {
                    "title": "🎯 Standar Usia 25 Tahun",
                    "message": "Berdasarkan data 10 profil sukses seusia Anda",
                    "tips": [
                        "Standar sit-ups usia Anda: 30 repetisi",
                        "Standar broad jump usia Anda: 200cm",
                        "Manfaatkan usia muda untuk membangun fondasi kekuatan"
                    ]
                }
            ],
            "created_at": "2025-06-06T02:26:05.190956"
        },
        {
            "id": 38,
            "user_name": "Kahfi",
            "age": 21,
            "height_cm": 171,
            "weight_kg": 80,
            "sit_ups_counts": 60,
            "broad_jump_cm": 250,
            "predicted_class": "A",
            "bmi": 27.36,
            "fitness_score": 95,
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
                    "title": "🏃‍♂️ Rekomendasi Penurunan Berat",
                    "message": "BMI Anda menunjukkan kelebihan berat badan",
                    "tips": [
                        "Kombinasikan latihan kardio dan kekuatan",
                        "Perhatikan pola makan dengan defisit kalori yang sehat",
                        "Tingkatkan aktivitas fisik harian"
                    ]
                }
            ],
            "created_at": "2025-06-05T13:45:39.547636"
        },
        {
            "id": 37,
            "user_name": "Rosa",
            "age": 19,
            "height_cm": 160,
            "weight_kg": 48,
            "sit_ups_counts": 20,
            "broad_jump_cm": 120,
            "predicted_class": "B",
            "bmi": 18.75,
            "fitness_score": 70,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
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
            "created_at": "2025-06-05T13:32:34.10611"
        },
        {
            "id": 36,
            "user_name": "Tasya",
            "age": 19,
            "height_cm": 160,
            "weight_kg": 48,
            "sit_ups_counts": 3,
            "broad_jump_cm": 200,
            "predicted_class": "B",
            "bmi": 18.75,
            "fitness_score": 70,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
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
            "created_at": "2025-06-05T13:02:19.823633"
        },
        {
            "id": 35,
            "user_name": "Milka Putri",
            "age": 21,
            "height_cm": 170,
            "weight_kg": 60,
            "sit_ups_counts": 21,
            "broad_jump_cm": 50,
            "predicted_class": "B",
            "bmi": 20.76,
            "fitness_score": 70,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
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
            "created_at": "2025-06-05T12:33:17.655638"
        },
        {
            "id": 34,
            "user_name": "Muhammad Al-Hiddayah",
            "age": 22,
            "height_cm": 174,
            "weight_kg": 80,
            "sit_ups_counts": 70,
            "broad_jump_cm": 150,
            "predicted_class": "B",
            "bmi": 26.42,
            "fitness_score": 75,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
                    ]
                },
                {
                    "title": "🏃‍♂️ Rekomendasi Penurunan Berat",
                    "message": "BMI Anda menunjukkan kelebihan berat badan",
                    "tips": [
                        "Kombinasikan latihan kardio dan kekuatan",
                        "Perhatikan pola makan dengan defisit kalori yang sehat",
                        "Tingkatkan aktivitas fisik harian"
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
            "created_at": "2025-06-05T12:32:08.814246"
        },
        {
            "id": 33,
            "user_name": "Muhammad Al-Hiddayah",
            "age": 22,
            "height_cm": 174,
            "weight_kg": 80,
            "sit_ups_counts": 90,
            "broad_jump_cm": 150,
            "predicted_class": "B",
            "bmi": 26.42,
            "fitness_score": 75,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
                    ]
                },
                {
                    "title": "🏃‍♂️ Rekomendasi Penurunan Berat",
                    "message": "BMI Anda menunjukkan kelebihan berat badan",
                    "tips": [
                        "Kombinasikan latihan kardio dan kekuatan",
                        "Perhatikan pola makan dengan defisit kalori yang sehat",
                        "Tingkatkan aktivitas fisik harian"
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
            "created_at": "2025-06-05T12:01:54.082265"
        },
        {
            "id": 32,
            "user_name": "Agnestasya",
            "age": 21,
            "height_cm": 170,
            "weight_kg": 60,
            "sit_ups_counts": 50,
            "broad_jump_cm": 170,
            "predicted_class": "B",
            "bmi": 20.76,
            "fitness_score": 80,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
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
            "created_at": "2025-06-05T11:57:18.30455"
        },
        {
            "id": 31,
            "user_name": "Agnestasya",
            "age": 21,
            "height_cm": 170,
            "weight_kg": 60,
            "sit_ups_counts": 50,
            "broad_jump_cm": 170,
            "predicted_class": "B",
            "bmi": 20.76,
            "fitness_score": 80,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
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
            "created_at": "2025-06-05T11:50:35.134029"
        },
        {
            "id": 30,
            "user_name": "Agnestasya",
            "age": 21,
            "height_cm": 170,
            "weight_kg": 60,
            "sit_ups_counts": 50,
            "broad_jump_cm": 170,
            "predicted_class": "B",
            "bmi": 20.76,
            "fitness_score": 80,
            "recommendations": [
                {
                    "title": "💪 Good Fitness Level",
                    "message": "Anda dalam kondisi fisik yang baik, terus tingkatkan!",
                    "tips": [
                        "Tambahkan latihan kekuatan 2-3x seminggu",
                        "Tingkatkan durasi dan intensitas kardio",
                        "Fokus pada fleksibilitas dan mobilitas"
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
            "created_at": "2025-06-05T11:50:21.002982"
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