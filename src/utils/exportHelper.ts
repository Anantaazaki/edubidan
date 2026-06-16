/**
 * exportHelper.ts
 * Utility untuk export data ke CSV dan share
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export class ExportHelper {

  // Export data ke CSV dan share
  static async exportToCSV(data: any[], filename: string, headers: string[]): Promise<void> {
    try {
      if (data.length === 0) {
        Alert.alert('Info', 'Tidak ada data untuk diexport');
        return;
      }

      // Build CSV content
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const key = header.toLowerCase().replace(/\s+/g, '');
          const value = this.getNestedValue(row, key) || '-';
          // Escape commas and quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvContent += values.join(',') + '\n';
      });

      // Save file
      const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Export ${filename}`,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Sukses', `File disimpan di: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Gagal export data');
    }
  }

  // Export nilai quiz
  static async exportGrades(grades: any[]): Promise<void> {
    const headers = ['Nama', 'NIM', 'Quiz', 'Skor', 'MaxSkor', 'Status', 'Waktu'];
    const data = grades.map(g => ({
      nama: g.studentName,
      nim: g.studentNim,
      quiz: g.quizTitle,
      skor: g.score,
      maxskor: g.maxScore,
      status: g.status,
      waktu: g.timeSpent,
    }));
    await this.exportToCSV(data, 'nilai_quiz', headers);
  }

  // Export daftar mahasiswa
  static async exportStudents(students: any[]): Promise<void> {
    const headers = ['Nama', 'NIM', 'Email', 'Progress', 'Status'];
    const data = students.map(s => ({
      nama: s.name,
      nim: s.nim,
      email: s.email,
      progress: `${s.progress}%`,
      status: s.status,
    }));
    await this.exportToCSV(data, 'daftar_mahasiswa', headers);
  }

  // Helper: get value from object
  private static getNestedValue(obj: any, key: string): any {
    // Try direct match
    if (obj[key] !== undefined) return obj[key];
    // Try case-insensitive
    const found = Object.keys(obj).find(k => k.toLowerCase() === key);
    return found ? obj[found] : undefined;
  }
}