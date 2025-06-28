'use server';

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/handle-error';
import * as XLSX from 'xlsx';

export async function getAcademicYears() {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: [{ isCurrent: 'desc' }, { yearRange: 'desc' }],
      select: {
        id: true,
        yearRange: true,
        isCurrent: true
      }
    });

    return { success: true, data: academicYears };
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return { success: false, error: 'Failed to fetch academic years' };
  }
}

export async function getSemesters(academicYearId: number) {
  try {
    const semesters = await prisma.semester.findMany({
      where: { academicYearId },
      orderBy: [{ isCurrent: 'desc' }, { semesterName: 'asc' }],
      select: {
        id: true,
        semesterName: true,
        academicYearId: true,
        isCurrent: true
      }
    });

    return { success: true, data: semesters };
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return { success: false, error: 'Failed to fetch semesters' };
  }
}

export async function getClasses(semesterId: number) {
  try {
    const classes = await prisma.class.findMany({
      where: { semesterId },
      orderBy: [{ departmentCode: 'asc' }, { className: 'asc' }],
      select: {
        id: true,
        className: true,
        departmentCode: true,
        semesterId: true
      }
    });

    return { success: true, data: classes };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: 'Failed to fetch classes' };
  }
}

export async function getClassSubjects(classId: number) {
  try {
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            creditHours: true,
            examWeight: true,
            assignWeight: true
          }
        }
      },
      orderBy: {
        subject: {
          subjectName: 'asc'
        }
      }
    });

    return { success: true, data: classSubjects };
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    return { success: false, error: 'Failed to fetch class subjects' };
  }
}
export async function generateStudentTemplate(
  classId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateData: any
) {
  try {
    if (!classId) {
      throw new Error('Class ID is required');
    }

    // Fetch class subjects with subject details
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        classId: classId
      },
      include: {
        subject: true
      },
      orderBy: {
        subject: {
          subjectName: 'asc'
        }
      }
    });

    if (classSubjects.length === 0) {
      throw new Error('No subjects found for this class');
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Generate headers
    const headers = ['No.', 'Roll Number', 'Name'];

    // Add subject-specific columns
    classSubjects.forEach((cs) => {
      const subjectName = cs.subject.subjectName;
      const creditHours = cs.subject.creditHours;

      headers.push(
        `${subjectName} (${creditHours} Credits)`,
        'Grade',
        'Score',
        'GP'
      );
    });

    // Add summary columns
    headers.push('Total GP', 'GPA');

    // Create sample data rows for demonstration
    const sampleRows = [];

    // Add 5 sample rows to show the format
    for (let i = 1; i <= 5; i++) {
      const row = [
        i, // No.
        `2024-${templateData.class?.substring(0, 2).toUpperCase() || 'CS'}-${String(i).padStart(3, '0')}`, // Roll Number
        `Sample Student ${i}` // Name
      ];

      // Add empty cells for each subject's columns
      classSubjects.forEach(() => {
        row.push('', '', '', ''); // Subject Mark, Grade, Score, GP
      });

      // Add empty cells for summary columns
      row.push('', ''); // Total GP, GPA

      sampleRows.push(row);
    }

    // Create worksheet data
    const worksheetData = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // No.
      { wch: 15 }, // Roll Number
      { wch: 20 } // Name
    ];

    // Add widths for subject columns
    classSubjects.forEach(() => {
      columnWidths.push(
        { wch: 25 }, // Subject Name
        { wch: 8 }, // Grade
        { wch: 8 }, // Score
        { wch: 8 } // GP
      );
    });

    // Add widths for summary columns
    columnWidths.push({ wch: 10 }, { wch: 8 }); // Total GP, GPA

    worksheet['!cols'] = columnWidths;

    // Style the header row - Fixed null check
    if (worksheet['!ref']) {
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '366092' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      }
    }

    // Add worksheet to workbook
    const sheetName = `${templateData.class || 'Class'}_Template`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Create instructions worksheet
    const instructionsData = [
      ['STUDENT DATA IMPORT TEMPLATE'],
      [''],
      ['Academic Year:', templateData.academicYear || ''],
      ['Semester:', templateData.semester || ''],
      ['Class:', templateData.class || ''],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Fill in student information in the main sheet'],
      ['2. No. column: Sequential number (1, 2, 3, ...)'],
      ['3. Roll Number: Student roll number (e.g., 2024-CS-001)'],
      ['4. Name: Full student name'],
      [''],
      ['SUBJECT COLUMNS:'],
      ['For each subject, fill in the following columns:'],
      ['- Subject Mark: Raw marks obtained'],
      ['- Grade: Letter grade (A+, A, B+, B, C+, C, D+, D, F)'],
      ['- Score: Numerical score (0-4.0)'],
      ['- GP: Grade Points (Score × Credit Hours)'],
      [''],
      ['SUMMARY COLUMNS:'],
      ['- Total GP: Sum of all GP values'],
      ['- GPA: Total GP ÷ Total Credit Hours'],
      [''],
      ['SUBJECTS IN THIS CLASS:'],
      ...classSubjects.map((cs, index) => [
        `${index + 1}. ${cs.subject.subjectName}`,
        `Credit Hours: ${cs.subject.creditHours}`,
        `Exam Weight: ${(cs.subject.examWeight * 100).toFixed(0)}%`,
        `Assignment Weight: ${(cs.subject.assignWeight * 100).toFixed(0)}%`
      ]),
      [''],
      ['GRADE SCALE:'],
      ['A+ = 4.0 (90-100)', 'A = 3.7 (85-89)', 'B+ = 3.3 (80-84)'],
      ['B = 3.0 (75-79)', 'C+ = 2.7 (70-74)', 'C = 2.3 (65-69)'],
      ['D+ = 2.0 (60-64)', 'D = 1.7 (55-59)', 'F = 0.0 (0-54)'],
      [''],
      ['NOTE: Delete sample data before importing real student data']
    ];

    const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData);

    // Style instructions worksheet
    instructionsWorksheet['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 }
    ];

    // Style the title
    if (instructionsWorksheet['A1']) {
      instructionsWorksheet['A1'].s = {
        font: { bold: true, size: 16, color: { rgb: '000000' } },
        alignment: { horizontal: 'center' }
      };
    }

    XLSX.utils.book_append_sheet(
      workbook,
      instructionsWorksheet,
      'Instructions'
    );

    // Generate buffer
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true
    });

    // Convert buffer to base64 for client-side download
    const base64 = buffer.toString('base64');

    // Create filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `student_data_template_${templateData.class || 'class'}_${timestamp}.xlsx`;

    return {
      success: true,
      data: base64,
      filename,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  } catch (error) {
    console.error('Template generation error:', error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}
