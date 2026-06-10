import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const MATERIALS_KEY = '@edubidan_lecturer_materials';
const VIDEOS_KEY = '@edubidan_lecturer_videos';
const QUIZZES_KEY = '@edubidan_lecturer_quizzes';
const GRADES_KEY = '@edubidan_lecturer_grades';
const STUDENT_PROGRESS_KEY = '@edubidan_student_progress';

// Interfaces
export interface Material {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string; // lecturer ID
  createdAt: number;
  updatedAt: number;
  totalLessons: number;
  estimatedDuration: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  materialId: string;
  url: string;
  thumbnailUrl?: string;
  duration: string;
  views: number;
  status: 'draft' | 'published' | 'processing';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  materialId: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  attempts: number;
  avgScore: number;
  status: 'draft' | 'published' | 'closed';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'essay' | 'true-false';
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

export interface Grade {
  id: string;
  studentId: string;
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  timeSpent: number; // in seconds
  attempts: number;
  status: 'pending' | 'graded' | 'reviewed';
  feedback?: string;
  gradedBy?: string;
  submittedAt: number;
  gradedAt?: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
  isCorrect?: boolean;
  points?: number;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  materialId: string;
  progress: number; // 0-100
  completedLessons: string[];
  watchedVideos: string[];
  completedQuizzes: string[];
  lastAccessedAt: number;
}

export class LecturerDatabase {
  
  // ============= MATERIALS CRUD =============
  
  static async getAllMaterials(): Promise<Material[]> {
    try {
      const materialsJson = await AsyncStorage.getItem(MATERIALS_KEY);
      return materialsJson ? JSON.parse(materialsJson) : [];
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  static async saveMaterials(materials: Material[]): Promise<void> {
    try {
      await AsyncStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    } catch (error) {
      console.error('Error saving materials:', error);
      throw error;
    }
  }

  static async createMaterial(materialData: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; material?: Material }> {
    try {
      const newMaterial: Material = {
        ...materialData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const materials = await this.getAllMaterials();
      materials.push(newMaterial);
      await this.saveMaterials(materials);

      return { success: true, message: 'Materi berhasil dibuat!', material: newMaterial };
    } catch (error) {
      console.error('Error creating material:', error);
      return { success: false, message: 'Gagal membuat materi. Silakan coba lagi.' };
    }
  }

  static async updateMaterial(materialId: string, updates: Partial<Material>): Promise<{ success: boolean; message: string; material?: Material }> {
    try {
      const materials = await this.getAllMaterials();
      const materialIndex = materials.findIndex(m => m.id === materialId);

      if (materialIndex === -1) {
        return { success: false, message: 'Materi tidak ditemukan.' };
      }

      materials[materialIndex] = {
        ...materials[materialIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      await this.saveMaterials(materials);
      return { success: true, message: 'Materi berhasil diperbarui!', material: materials[materialIndex] };
    } catch (error) {
      console.error('Error updating material:', error);
      return { success: false, message: 'Gagal memperbarui materi.' };
    }
  }

  static async deleteMaterial(materialId: string): Promise<{ success: boolean; message: string }> {
    try {
      const materials = await this.getAllMaterials();
      const updatedMaterials = materials.filter(m => m.id !== materialId);
      
      if (materials.length === updatedMaterials.length) {
        return { success: false, message: 'Materi tidak ditemukan.' };
      }

      await this.saveMaterials(updatedMaterials);
      return { success: true, message: 'Materi berhasil dihapus!' };
    } catch (error) {
      console.error('Error deleting material:', error);
      return { success: false, message: 'Gagal menghapus materi.' };
    }
  }

  static async getMaterialById(materialId: string): Promise<Material | null> {
    try {
      const materials = await this.getAllMaterials();
      return materials.find(m => m.id === materialId) || null;
    } catch (error) {
      console.error('Error getting material by ID:', error);
      return null;
    }
  }

  // ============= VIDEOS CRUD =============
  
  static async getAllVideos(): Promise<Video[]> {
    try {
      const videosJson = await AsyncStorage.getItem(VIDEOS_KEY);
      return videosJson ? JSON.parse(videosJson) : [];
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      await AsyncStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
    } catch (error) {
      console.error('Error saving videos:', error);
      throw error;
    }
  }

  static async createVideo(videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; video?: Video }> {
    try {
      const newVideo: Video = {
        ...videoData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const videos = await this.getAllVideos();
      videos.push(newVideo);
      await this.saveVideos(videos);

      return { success: true, message: 'Video berhasil ditambahkan!', video: newVideo };
    } catch (error) {
      console.error('Error creating video:', error);
      return { success: false, message: 'Gagal menambahkan video. Silakan coba lagi.' };
    }
  }

  static async updateVideo(videoId: string, updates: Partial<Video>): Promise<{ success: boolean; message: string; video?: Video }> {
    try {
      const videos = await this.getAllVideos();
      const videoIndex = videos.findIndex(v => v.id === videoId);

      if (videoIndex === -1) {
        return { success: false, message: 'Video tidak ditemukan.' };
      }

      videos[videoIndex] = {
        ...videos[videoIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      await this.saveVideos(videos);
      return { success: true, message: 'Video berhasil diperbarui!', video: videos[videoIndex] };
    } catch (error) {
      console.error('Error updating video:', error);
      return { success: false, message: 'Gagal memperbarui video.' };
    }
  }

  static async deleteVideo(videoId: string): Promise<{ success: boolean; message: string }> {
    try {
      const videos = await this.getAllVideos();
      const updatedVideos = videos.filter(v => v.id !== videoId);
      
      if (videos.length === updatedVideos.length) {
        return { success: false, message: 'Video tidak ditemukan.' };
      }

      await this.saveVideos(updatedVideos);
      return { success: true, message: 'Video berhasil dihapus!' };
    } catch (error) {
      console.error('Error deleting video:', error);
      return { success: false, message: 'Gagal menghapus video.' };
    }
  }

  static async getVideoById(videoId: string): Promise<Video | null> {
    try {
      const videos = await this.getAllVideos();
      return videos.find(v => v.id === videoId) || null;
    } catch (error) {
      console.error('Error getting video by ID:', error);
      return null;
    }
  }

  static async getVideosByMaterialId(materialId: string): Promise<Video[]> {
    try {
      const videos = await this.getAllVideos();
      return videos.filter(v => v.materialId === materialId);
    } catch (error) {
      console.error('Error getting videos by material ID:', error);
      return [];
    }
  }

  // ============= QUIZZES CRUD =============
  
  static async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const quizzesJson = await AsyncStorage.getItem(QUIZZES_KEY);
      return quizzesJson ? JSON.parse(quizzesJson) : [];
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return [];
    }
  }

  static async saveQuizzes(quizzes: Quiz[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quizzes:', error);
      throw error;
    }
  }

  static async createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; quiz?: Quiz }> {
    try {
      const newQuiz: Quiz = {
        ...quizData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const quizzes = await this.getAllQuizzes();
      quizzes.push(newQuiz);
      await this.saveQuizzes(quizzes);

      return { success: true, message: 'Quiz berhasil dibuat!', quiz: newQuiz };
    } catch (error) {
      console.error('Error creating quiz:', error);
      return { success: false, message: 'Gagal membuat quiz. Silakan coba lagi.' };
    }
  }

  static async updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<{ success: boolean; message: string; quiz?: Quiz }> {
    try {
      const quizzes = await this.getAllQuizzes();
      const quizIndex = quizzes.findIndex(q => q.id === quizId);

      if (quizIndex === -1) {
        return { success: false, message: 'Quiz tidak ditemukan.' };
      }

      quizzes[quizIndex] = {
        ...quizzes[quizIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      await this.saveQuizzes(quizzes);
      return { success: true, message: 'Quiz berhasil diperbarui!', quiz: quizzes[quizIndex] };
    } catch (error) {
      console.error('Error updating quiz:', error);
      return { success: false, message: 'Gagal memperbarui quiz.' };
    }
  }

  static async deleteQuiz(quizId: string): Promise<{ success: boolean; message: string }> {
    try {
      const quizzes = await this.getAllQuizzes();
      const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
      
      if (quizzes.length === updatedQuizzes.length) {
        return { success: false, message: 'Quiz tidak ditemukan.' };
      }

      await this.saveQuizzes(updatedQuizzes);
      return { success: true, message: 'Quiz berhasil dihapus!' };
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return { success: false, message: 'Gagal menghapus quiz.' };
    }
  }

  static async getQuizById(quizId: string): Promise<Quiz | null> {
    try {
      const quizzes = await this.getAllQuizzes();
      return quizzes.find(q => q.id === quizId) || null;
    } catch (error) {
      console.error('Error getting quiz by ID:', error);
      return null;
    }
  }

  static async getQuizzesByMaterialId(materialId: string): Promise<Quiz[]> {
    try {
      const quizzes = await this.getAllQuizzes();
      return quizzes.filter(q => q.materialId === materialId);
    } catch (error) {
      console.error('Error getting quizzes by material ID:', error);
      return [];
    }
  }

  // ============= GRADES CRUD =============
  
  static async getAllGrades(): Promise<Grade[]> {
    try {
      const gradesJson = await AsyncStorage.getItem(GRADES_KEY);
      return gradesJson ? JSON.parse(gradesJson) : [];
    } catch (error) {
      console.error('Error getting grades:', error);
      return [];
    }
  }

  static async saveGrades(grades: Grade[]): Promise<void> {
    try {
      await AsyncStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    } catch (error) {
      console.error('Error saving grades:', error);
      throw error;
    }
  }

  static async createGrade(gradeData: Omit<Grade, 'id'>): Promise<{ success: boolean; message: string; grade?: Grade }> {
    try {
      const newGrade: Grade = {
        ...gradeData,
        id: Date.now().toString(),
      };

      const grades = await this.getAllGrades();
      grades.push(newGrade);
      await this.saveGrades(grades);

      return { success: true, message: 'Nilai berhasil disimpan!', grade: newGrade };
    } catch (error) {
      console.error('Error creating grade:', error);
      return { success: false, message: 'Gagal menyimpan nilai.' };
    }
  }

  static async updateGrade(gradeId: string, updates: Partial<Grade>): Promise<{ success: boolean; message: string; grade?: Grade }> {
    try {
      const grades = await this.getAllGrades();
      const gradeIndex = grades.findIndex(g => g.id === gradeId);

      if (gradeIndex === -1) {
        return { success: false, message: 'Nilai tidak ditemukan.' };
      }

      grades[gradeIndex] = {
        ...grades[gradeIndex],
        ...updates,
      };

      await this.saveGrades(grades);
      return { success: true, message: 'Nilai berhasil diperbarui!', grade: grades[gradeIndex] };
    } catch (error) {
      console.error('Error updating grade:', error);
      return { success: false, message: 'Gagal memperbarui nilai.' };
    }
  }

  static async getGradesByStudentId(studentId: string): Promise<Grade[]> {
    try {
      const grades = await this.getAllGrades();
      return grades.filter(g => g.studentId === studentId);
    } catch (error) {
      console.error('Error getting grades by student ID:', error);
      return [];
    }
  }

  static async getGradesByQuizId(quizId: string): Promise<Grade[]> {
    try {
      const grades = await this.getAllGrades();
      return grades.filter(g => g.quizId === quizId);
    } catch (error) {
      console.error('Error getting grades by quiz ID:', error);
      return [];
    }
  }

  static async getPendingGrades(): Promise<Grade[]> {
    try {
      const grades = await this.getAllGrades();
      return grades.filter(g => g.status === 'pending');
    } catch (error) {
      console.error('Error getting pending grades:', error);
      return [];
    }
  }

  // ============= STUDENT PROGRESS CRUD =============
  
  static async getAllStudentProgress(): Promise<StudentProgress[]> {
    try {
      const progressJson = await AsyncStorage.getItem(STUDENT_PROGRESS_KEY);
      return progressJson ? JSON.parse(progressJson) : [];
    } catch (error) {
      console.error('Error getting student progress:', error);
      return [];
    }
  }

  static async saveStudentProgress(progressList: StudentProgress[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STUDENT_PROGRESS_KEY, JSON.stringify(progressList));
    } catch (error) {
      console.error('Error saving student progress:', error);
      throw error;
    }
  }

  static async updateStudentProgress(
    studentId: string, 
    materialId: string, 
    updates: Partial<StudentProgress>
  ): Promise<{ success: boolean; message: string; progress?: StudentProgress }> {
    try {
      const progressList = await this.getAllStudentProgress();
      const existingIndex = progressList.findIndex(
        p => p.studentId === studentId && p.materialId === materialId
      );

      let progress: StudentProgress;

      if (existingIndex === -1) {
        // Create new progress record
        progress = {
          id: Date.now().toString(),
          studentId,
          materialId,
          progress: 0,
          completedLessons: [],
          watchedVideos: [],
          completedQuizzes: [],
          lastAccessedAt: Date.now(),
          ...updates,
        };
        progressList.push(progress);
      } else {
        // Update existing progress
        progressList[existingIndex] = {
          ...progressList[existingIndex],
          ...updates,
          lastAccessedAt: Date.now(),
        };
        progress = progressList[existingIndex];
      }

      await this.saveStudentProgress(progressList);
      return { success: true, message: 'Progress berhasil diperbarui!', progress };
    } catch (error) {
      console.error('Error updating student progress:', error);
      return { success: false, message: 'Gagal memperbarui progress.' };
    }
  }

  static async getStudentProgressByStudentId(studentId: string): Promise<StudentProgress[]> {
    try {
      const progressList = await this.getAllStudentProgress();
      return progressList.filter(p => p.studentId === studentId);
    } catch (error) {
      console.error('Error getting student progress by student ID:', error);
      return [];
    }
  }

  static async getStudentProgressByMaterialId(materialId: string): Promise<StudentProgress[]> {
    try {
      const progressList = await this.getAllStudentProgress();
      return progressList.filter(p => p.materialId === materialId);
    } catch (error) {
      console.error('Error getting student progress by material ID:', error);
      return [];
    }
  }

  // ============= INITIALIZATION =============
  
  static async initializeDatabase(): Promise<void> {
    try {
      // Initialize with sample data if no data exists
      const materials = await this.getAllMaterials();
      const videos = await this.getAllVideos();
      const quizzes = await this.getAllQuizzes();

      if (materials.length === 0) {
        await this.initializeSampleData();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private static async initializeSampleData(): Promise<void> {
    try {
      // Sample materials based on MODULES
      const sampleMaterials: Material[] = [
        {
          id: '1',
          title: 'Asuhan Kehamilan (ANC)',
          category: 'Kehamilan',
          description: 'Pembelajaran komprehensif tentang asuhan kehamilan dari konsepsi hingga persalinan',
          content: 'Materi lengkap tentang ANC...',
          status: 'published',
          createdBy: 'lecturer1',
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 24 * 60 * 60 * 1000,
          totalLessons: 8,
          estimatedDuration: '4 jam',
        },
        {
          id: '2',
          title: 'Asuhan Persalinan Normal',
          category: 'Persalinan',
          description: 'Teknik dan prosedur dalam asuhan persalinan normal',
          content: 'Materi lengkap tentang persalinan...',
          status: 'published',
          createdBy: 'lecturer1',
          createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          totalLessons: 6,
          estimatedDuration: '3 jam',
        },
      ];

      // Sample videos
      const sampleVideos: Video[] = [
        {
          id: '1',
          title: 'Pemeriksaan Fisik Kehamilan',
          description: 'Video pembelajaran tentang teknik pemeriksaan fisik pada ibu hamil',
          materialId: '1',
          url: 'https://youtu.be/dQw4w9WgXcQ',
          thumbnailUrl: 'https://picsum.photos/320/180?random=1',
          duration: '15:30',
          views: 142,
          status: 'published',
          createdBy: 'lecturer1',
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
        {
          id: '2',
          title: 'Teknik Palpasi Leopold',
          description: 'Demonstrasi lengkap teknik palpasi Leopold I-IV',
          materialId: '1',
          url: 'https://youtu.be/dQw4w9WgXcQ',
          thumbnailUrl: 'https://picsum.photos/320/180?random=2',
          duration: '12:45',
          views: 98,
          status: 'published',
          createdBy: 'lecturer1',
          createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
      ];

      // Sample quizzes
      const sampleQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'Quiz Asuhan Kehamilan',
          description: 'Evaluasi pemahaman tentang asuhan kehamilan',
          materialId: '1',
          questions: [
            {
              id: '1',
              question: 'Apa yang dimaksud dengan ANC?',
              type: 'multiple-choice',
              options: ['Ante Natal Care', 'After Natal Care', 'Anti Natal Care', 'Annual Natal Care'],
              correctAnswer: 0,
              points: 10,
            },
            {
              id: '2',
              question: 'Sebutkan tanda-tanda kehamilan!',
              type: 'essay',
              correctAnswer: 'Tanda presumtif, probable, dan positif',
              points: 15,
            },
          ],
          timeLimit: 30,
          attempts: 3,
          avgScore: 85,
          status: 'published',
          createdBy: 'lecturer1',
          createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
      ];

      await this.saveMaterials(sampleMaterials);
      await this.saveVideos(sampleVideos);
      await this.saveQuizzes(sampleQuizzes);

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // ============= UTILITY FUNCTIONS =============
  
  static async getStatistics(): Promise<{
    totalMaterials: number;
    totalVideos: number;
    totalQuizzes: number;
    totalStudents: number;
    pendingGrades: number;
    completionRate: number;
  }> {
    try {
      const materials = await this.getAllMaterials();
      const videos = await this.getAllVideos();
      const quizzes = await this.getAllQuizzes();
      const grades = await this.getAllGrades();
      const progress = await this.getAllStudentProgress();

      const pendingGrades = grades.filter(g => g.status === 'pending').length;
      const totalSubmissions = grades.length;
      const completedSubmissions = grades.filter(g => g.status === 'graded').length;
      const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0;

      // Get unique students from progress records
      const uniqueStudents = new Set(progress.map(p => p.studentId));

      return {
        totalMaterials: materials.length,
        totalVideos: videos.length,
        totalQuizzes: quizzes.length,
        totalStudents: uniqueStudents.size || 45, // Default to 45 if no progress records
        pendingGrades,
        completionRate,
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalMaterials: 0,
        totalVideos: 0,
        totalQuizzes: 0,
        totalStudents: 45,
        pendingGrades: 0,
        completionRate: 0,
      };
    }
  }

  static async searchMaterials(query: string): Promise<Material[]> {
    try {
      const materials = await this.getAllMaterials();
      const lowerQuery = query.toLowerCase();
      return materials.filter(m => 
        m.title.toLowerCase().includes(lowerQuery) ||
        m.category.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching materials:', error);
      return [];
    }
  }

  static async searchVideos(query: string): Promise<Video[]> {
    try {
      const videos = await this.getAllVideos();
      const lowerQuery = query.toLowerCase();
      return videos.filter(v => 
        v.title.toLowerCase().includes(lowerQuery) ||
        v.description.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }
}