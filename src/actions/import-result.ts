'use server';

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/handle-error';
import * as XLSX from 'xlsx';
import { updateAcademicYearResult } from './result';
import { revalidateTag } from 'next/cache';

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
          id: 'desc'
        }
      }
    });

    return { success: true, data: classSubjects };
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    return { success: false, error: 'Failed to fetch class subjects' };
  }
}

type TemplateData = {
  academicYear: string;
  semester: string;
  class: string;
  classCode: 'CS' | 'CT' | 'CST';
  subjects: Array<{
    id: string;
    name: string;
    creditHours: number;
    assignWeight: number;
    examWeight: number;
  }>;
};

export async function generateStudentTemplate(
  classId: number,
  templateData: TemplateData
) {
  try {
    if (!classId) {
      throw new Error('Class ID is required');
    }

    // Fetch class subjects with subject details
    const classSubjects = templateData.subjects.sort((a, b) => {
      const numA = parseInt(a.id.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.id.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    console.log(classSubjects);

    if (classSubjects.length === 0) {
      throw new Error('No subjects found for this class');
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Generate headers
    const headers = ['Admission ID', 'Roll Number', 'Student Name'];

    // Add subject-specific columns
    classSubjects.forEach((cs) => {
      headers.push(
        cs.name,
        `${(cs.examWeight * 100).toFixed(0)}%`,
        `${(cs.assignWeight * 100).toFixed(0)}%`,
        `${cs.id} 100%`,
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
        `${String(i).padStart(6, '0')}`,
        `${templateData.classCode || 'CS'}-${i}`,
        `Sample Student ${i}` // Name
      ];

      // Add empty cells for each subject's columns
      classSubjects.forEach(() => {
        row.push('', '', '', '', '', '', '');
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
      { wch: 12 }, // Admission ID
      { wch: 10 }, // Roll Number
      { wch: 20 } // Name
    ];

    // Add widths for subject columns
    classSubjects.forEach(() => {
      columnWidths.push(
        { wch: 8 }, // real
        { wch: 8 }, // exam
        { wch: 8 }, // assign
        { wch: 8 }, // Subject Name
        { wch: 8 }, // Grade
        { wch: 8 }, // Score
        { wch: 8 } // GP
      );
    });

    // Add widths for summary columns
    columnWidths.push({ wch: 8 }, { wch: 8 }); // Total GP, GPA

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
      // ['2. No. column: Sequential number (1, 2, 3, ...)'],
      ['2. Admission ID column: Admission ID number (e.g., 000001)'],
      ['3. Roll Number: Student roll number (e.g., CS-1)'],
      ['4. Name: Full student name'],
      [''],
      ['SUBJECT COLUMNS:'],
      ['For each subject, fill in the following columns:'],
      ['- Base Mark: Raw Exam marks obtained'],
      ['- Exam Mark: Calculated marks obtained'],
      ['- Assignment Mark: Raw marks obtained'],
      ['- Final Mark: Combined marks obtained'],
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
        `${index + 1}. ${cs.name}`,
        `Credit Hours: ${cs.creditHours}`,
        `Exam Weight: ${(cs.examWeight * 100).toFixed(0)}%`,
        `Assignment Weight: ${(cs.assignWeight * 100).toFixed(0)}%`
      ]),
      [''],
      ['GRADE SCALE:'],
      ['A+ = 4.00 (90-100)', 'A = 3.80 (80-89)', 'A- = 3.67 (75-79)'],
      ['B+ = 3.33 (70-74)', 'B = 3.00 (65-69)', 'B- = 2.67 (60-64)'],
      ['C+ = 2.33 (55-59)', 'C = 2.00 (50-54)', 'D = 1.00 (40-49)'],
      ['F = 0.00 (0-39)'],
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

interface ImportError {
  row: number;
  column: string;
  field: string;
  message: string;
  value?: unknown;
}

interface ImportResult {
  success: boolean;
  processedCount?: number;
  errors?: ImportError[];
  errorData?: Record<string, unknown>[];
  headers?: string[];
  message?: string;
}

interface RowData {
  [key: string]: string | number | boolean | null | undefined;
}

interface StudentResultRow extends RowData {
  'Student Name': string;
  'Admission ID': string;
  'Roll Number': string;
}

export async function importStudentResults(
  formData: FormData
): Promise<ImportResult> {
  try {
    const file = formData.get('file') as File;
    const academicYearId = parseInt(formData.get('academicYearId') as string);
    const semesterId = parseInt(formData.get('semesterId') as string);
    const classId = parseInt(formData.get('classId') as string);

    if (!file) {
      return { success: false, message: 'No file provided' };
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: '' // This ensures empty cells are treated as empty strings
    }) as (string | number | boolean | null)[][];

    if (jsonData.length < 2) {
      return {
        success: false,
        message: 'Excel file must contain at least header and one data row'
      };
    }

    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1);

    // Get class subjects for validation
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true }
    });

    if (classSubjects.length === 0) {
      return { success: false, message: 'No subjects found for this class' };
    }

    const errors: ImportError[] = [];
    const validData: StudentResultRow[] = [];
    const errorRowsData: RowData[] = [];

    // Expected columns
    const requiredColumns = ['Student Name', 'Admission ID', 'Roll Number'];
    const subjectColumns = classSubjects.flatMap((cs) => [
      cs.subject.subjectName,
      `${(cs.subject.examWeight * 100).toFixed(0)}%`,
      `${(cs.subject.assignWeight * 100).toFixed(0)}%`,
      `${cs.subject.id} 100%`,
      'Grade',
      'Score',
      'GP'
    ]);
    const overallColumns = ['Total GP', 'GPA'];
    const expectedColumns = [
      ...requiredColumns,
      ...subjectColumns,
      ...overallColumns
    ];

    // Validate headers
    const missingColumns = expectedColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        headers,
        errorData: dataRows.map((row) =>
          Object.fromEntries(headers.map((h, i) => [h, row[i]]))
        ) as Record<string, unknown>[]
      };
    }

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 for header row and 0-indexing
      const rowData: RowData = {};
      let hasErrors = false;

      // Convert row array to object
      headers.forEach((header, index) => {
        const cellValue = row[index];
        rowData[header] =
          cellValue === null || cellValue === undefined ? '' : cellValue;
      });

      // Validate required fields
      if (
        !rowData['Student Name'] ||
        rowData['Student Name'].toString().trim() === '' ||
        rowData['Student Name'] === null ||
        rowData['Student Name'] === undefined
      ) {
        errors.push({
          row: rowNumber,
          column: 'Student Name',
          field: 'studentName',
          message: 'Student name is required'
        });
        hasErrors = true;
      }

      if (
        !rowData['Admission ID'] ||
        rowData['Admission ID'].toString().trim() === '' ||
        rowData['Admission ID'] === null ||
        rowData['Admission ID'] === undefined
      ) {
        errors.push({
          row: rowNumber,
          column: 'Admission ID',
          field: 'admissionId',
          message: 'Admission ID is required'
        });
        hasErrors = true;
      }

      if (
        !rowData['Roll Number'] ||
        rowData['Roll Number'].toString().trim() === '' ||
        rowData['Roll Number'] === null ||
        rowData['Roll Number'] === undefined
      ) {
        errors.push({
          row: rowNumber,
          column: 'Roll Number',
          field: 'rollNumber',
          message: 'Roll number is required'
        });
        hasErrors = true;
      }

      // Validate subject grades
      for (const cs of classSubjects) {
        const subjectId = cs.subject.id;
        const subjectName = cs.subject.subjectName;

        const subjctNameCol = subjectName;
        const examWeightCol = `${(cs.subject.examWeight * 100).toFixed(0)}%`;
        const assignWeightCol = `${(cs.subject.assignWeight * 100).toFixed(0)}%`;
        const subjectIdCol = subjectId + ' 100%';

        // Find the index of this subject's columns in headers
        const subjectStartIndex = headers.findIndex(
          (h, i) =>
            headers[i] === subjctNameCol &&
            headers[i + 1] === examWeightCol &&
            headers[i + 2] === assignWeightCol &&
            headers[i + 3] === subjectIdCol
        );

        if (subjectStartIndex !== -1) {
          const subjectNameColumnKey = headers[subjectStartIndex];
          const examMarkColumnKey = headers[subjectStartIndex + 1];
          const assignMarkColumnKey = headers[subjectStartIndex + 2];
          const finalMarkColumnKey = headers[subjectStartIndex + 3];
          const gradeColumnKey = headers[subjectStartIndex + 4];
          const scoreColumnKey = headers[subjectStartIndex + 5];
          const gpColumnKey = headers[subjectStartIndex + 6];

          const subjectNameValue = rowData[subjectNameColumnKey];
          const examMarkValue = rowData[examMarkColumnKey];
          const assignMarkValue = rowData[assignMarkColumnKey];
          const finalMarkValue = rowData[finalMarkColumnKey];
          const gradeValue = rowData[gradeColumnKey];
          const scoreValue = rowData[scoreColumnKey];
          const gpValue = rowData[gpColumnKey];

          // Validate Subject Name
          if (
            subjectNameValue !== undefined &&
            subjectNameValue !== null &&
            subjectNameValue !== ''
          ) {
            const baseMark = parseFloat(subjectNameValue.toString());
            if (isNaN(baseMark) || baseMark < 0 || baseMark > 100) {
              errors.push({
                row: rowNumber,
                column: subjectNameColumnKey,
                field: 'baseMark',
                message: `Invalid Base Mark '${subjectNameValue}' for subject ${subjectId}. Must be between 0 and 100`,
                value: subjectNameValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: subjectNameColumnKey,
              field: 'subjectName',
              message: 'Base Mark is required'
            });
            hasErrors = true;
          }

          // console.log(examMarkValue, typeof examMarkValue);

          // Validate Exam Mark
          if (
            examMarkValue !== undefined &&
            examMarkValue !== null &&
            examMarkValue !== ''
          ) {
            const examMark = parseFloat(examMarkValue.toString()); // Convert to string first
            if (isNaN(examMark) || examMark < 0 || examMark > 100) {
              errors.push({
                row: rowNumber,
                column: examMarkColumnKey,
                field: 'examMark',
                message: `Invalid exam mark '${examMarkValue}' for subject ${subjectId}. Must be between 0 and 100`,
                value: examMarkValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: examMarkColumnKey,
              field: 'examMark',
              message: 'Exam mark is required'
            });
            hasErrors = true;
          }

          // Validate Assignment Mark
          if (
            assignMarkValue !== undefined &&
            assignMarkValue !== null &&
            assignMarkValue !== ''
          ) {
            const assignMark = parseFloat(assignMarkValue.toString()); // Convert to string first
            if (isNaN(assignMark) || assignMark < 0 || assignMark > 100) {
              errors.push({
                row: rowNumber,
                column: assignMarkColumnKey,
                field: 'assignMark',
                message: `Invalid assignment mark '${assignMarkValue}' for subject ${subjectId}. Must be between 0 and 100`,
                value: assignMarkValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: assignMarkColumnKey,
              field: 'assignMark',
              message: 'Assignment mark is required'
            });
            hasErrors = true;
          }

          // Validate Final Mark
          if (
            finalMarkValue !== undefined &&
            finalMarkValue !== null &&
            finalMarkValue !== ''
          ) {
            const finalMark = parseFloat(finalMarkValue.toString()); // Convert to string first
            if (isNaN(finalMark) || finalMark < 0 || finalMark > 100) {
              errors.push({
                row: rowNumber,
                column: finalMarkColumnKey,
                field: 'finalMark',
                message: `Invalid final mark '${finalMarkValue}' for subject ${subjectId}. Must be between 0 and 100`,
                value: finalMarkValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: finalMarkColumnKey,
              field: 'finalMark',
              message: 'Final mark is required'
            });
            hasErrors = true;
          }

          // Validate Grade
          if (
            gradeValue !== undefined &&
            gradeValue !== null &&
            gradeValue !== ''
          ) {
            const grade = gradeValue.toString().trim().toUpperCase(); // Convert to string first
            const validGrades = [
              'A+',
              'A',
              'A-',
              'B+',
              'B',
              'B-',
              'C+',
              'C',
              'D',
              'F'
            ];

            if (!validGrades.includes(grade)) {
              errors.push({
                row: rowNumber,
                column: gradeColumnKey,
                field: 'grade',
                message: `Invalid grade '${grade}' for subject ${subjectId}. Valid grades: ${validGrades.join(', ')}`,
                value: gradeValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: gradeColumnKey,
              field: 'grade',
              message: 'Grade is required'
            });
            hasErrors = true;
          }

          // Validate Score
          if (
            scoreValue !== undefined &&
            scoreValue !== null &&
            scoreValue !== ''
          ) {
            const score = parseFloat(scoreValue.toString()); // Convert to string first
            if (isNaN(score) || score < 0 || score > 4.0) {
              errors.push({
                row: rowNumber,
                column: scoreColumnKey,
                field: 'score',
                message: `Invalid score '${scoreValue}' for subject ${subjectId}. Must be between 0.0 and 4.0`,
                value: scoreValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: scoreColumnKey,
              field: 'score',
              message: 'Score is required'
            });
            hasErrors = true;
          }

          // Validate GP
          if (gpValue !== undefined && gpValue !== null && gpValue !== '') {
            const gp = parseFloat(gpValue.toString()); // Convert to string first
            const maxGP = 4.0 * cs.subject.creditHours;
            if (isNaN(gp) || gp < 0 || gp > maxGP) {
              errors.push({
                row: rowNumber,
                column: gpColumnKey,
                field: 'gp',
                message: `Invalid GP '${gpValue}' for subject ${subjectId}. Must be between 0 and ${maxGP}`,
                value: gpValue
              });
              hasErrors = true;
            }
          } else {
            errors.push({
              row: rowNumber,
              column: gpColumnKey,
              field: 'gp',
              message: 'GP is required'
            });
            hasErrors = true;
          }
        }
      }

      if (
        !rowData['Total GP'] ||
        rowData['Total GP'].toString().trim() === '' ||
        rowData['Total GP'] === null ||
        rowData['Total GP'] === undefined
      ) {
        errors.push({
          row: rowNumber,
          column: 'Total GP',
          field: 'totalGp',
          message: 'Total GP is required'
        });
        hasErrors = true;
      }

      if (
        !rowData['GPA'] ||
        rowData['GPA'].toString().trim() === '' ||
        rowData['GPA'] === null ||
        rowData['GPA'] === undefined
      ) {
        errors.push({
          row: rowNumber,
          column: 'GPA',
          field: 'gpa',
          message: 'GPA is required'
        });
        hasErrors = true;
      }

      if (hasErrors) {
        errorRowsData.push(rowData);
      } else {
        validData.push(rowData as StudentResultRow);
      }
    }

    // If there are errors, return them
    if (errors.length > 0) {
      // Convert all data rows to proper format
      const allRowsData = dataRows.map((row) => {
        const rowData: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        return rowData;
      });

      return {
        success: false,
        errors,
        errorData: allRowsData, // Send ALL rows
        headers
      };
    }

    // Process valid data
    // let processedCount = 0;

    // await prisma.$transaction(
    //   async (tx) => {
    //     for (const rowData of validData) {
    //       try {
    //         // Find or create student
    //         let student = await tx.student.findUnique({
    //           where: { admissionId: rowData['Admission ID'].toString().trim() }
    //         });

    //         if (!student) {
    //           student = await tx.student.create({
    //             data: {
    //               studentName: rowData['Student Name'].toString().trim(),
    //               admissionId: rowData['Admission ID'].toString().trim()
    //             }
    //           });
    //         } else {
    //           // Update student name if different
    //           const newName = rowData['Student Name'].toString().trim();
    //           if (student.studentName !== newName) {
    //             student = await tx.student.update({
    //               where: { id: student.id },
    //               data: { studentName: newName }
    //             });
    //           }
    //         }

    //         // Find or create enrollment
    //         let enrollment = await tx.enrollment.findUnique({
    //           where: {
    //             classId_semesterId_studentId: {
    //               classId,
    //               semesterId,
    //               studentId: student.id
    //             }
    //           }
    //         });

    //         if (!enrollment) {
    //           enrollment = await tx.enrollment.create({
    //             data: {
    //               rollNumber: rowData['Roll Number'].toString().trim(),
    //               studentId: student.id,
    //               classId,
    //               semesterId,
    //               isActive: true
    //             }
    //           });
    //         } else {
    //           // Update roll number if different
    //           const newRollNumber = rowData['Roll Number'].toString().trim();
    //           if (enrollment.rollNumber !== newRollNumber) {
    //             enrollment = await tx.enrollment.update({
    //               where: { id: enrollment.id },
    //               data: { rollNumber: newRollNumber }
    //             });
    //           }
    //         }

    //         // Process grades
    //         for (const cs of classSubjects) {
    //           const subjectId = cs.subject.id.toString();
    //           const examWeightCol = `${(cs.subject.examWeight * 100).toFixed(0)}%`;
    //           const assignWeightCol = `${(cs.subject.assignWeight * 100).toFixed(0)}%`;

    //           const subjectStartIndex = headers.findIndex(
    //             (h, i) =>
    //               headers[i] === examWeightCol &&
    //               headers[i + 1] === assignWeightCol &&
    //               headers[i + 2] === subjectId
    //           );

    //           if (subjectStartIndex !== -1) {
    //             const examMark = parseFloat(
    //               String(rowData[headers[subjectStartIndex]] || 0)
    //             );
    //             const assignMark = parseFloat(
    //               String(rowData[headers[subjectStartIndex + 1]] || 0)
    //             );
    //             const finalMark = parseFloat(
    //               String(rowData[headers[subjectStartIndex + 2]] || 0)
    //             );
    //             const grade = String(
    //               rowData[headers[subjectStartIndex + 3]] || 'F'
    //             )
    //               .trim()
    //               .toUpperCase();
    //             const score = parseFloat(
    //               String(rowData[headers[subjectStartIndex + 4]] || 0)
    //             );
    //             const gp = parseFloat(
    //               String(rowData[headers[subjectStartIndex + 5]] || 0)
    //             );

    //             if (grade) {
    //               // Create or update grade with direct values from Excel
    //               await tx.grade.upsert({
    //                 where: {
    //                   enrollmentId_classSubjectId: {
    //                     enrollmentId: enrollment.id,
    //                     classSubjectId: cs.id
    //                   }
    //                 },
    //                 update: {
    //                   examMark,
    //                   assignMark,
    //                   finalMark,
    //                   grade,
    //                   score,
    //                   gp
    //                 },
    //                 create: {
    //                   enrollmentId: enrollment.id,
    //                   classSubjectId: cs.id,
    //                   examMark,
    //                   assignMark,
    //                   finalMark,
    //                   grade,
    //                   score,
    //                   gp
    //                 }
    //               });
    //             }
    //           }
    //         }

    //         const gradesData = await tx.grade.findMany({
    //           where: {
    //             enrollmentId: enrollment.id
    //           },
    //           include: {
    //             classSubject: {
    //               select: {
    //                 subject: true
    //               }
    //             }
    //           }
    //         });

    //         console.log(gradesData);

    //         const totalCredits = gradesData.reduce(
    //           (sum, g) => sum + g.classSubject.subject.creditHours,
    //           0
    //         );

    //         const allPassed = gradesData.every(
    //           (grade) => grade.finalMark >= 50
    //         );

    //         await tx.result.upsert({
    //           where: {
    //             enrollmentId: enrollment.id
    //           },
    //           update: {
    //             gpa: parseFloat(String(rowData['GPA'])),
    //             totalCredits: parseFloat(totalCredits.toFixed(2)),
    //             totalGp: parseFloat(String(rowData['Total GP'])),
    //             status: allPassed ? 'PASS' : 'FAIL',
    //             academicYearResultId: null
    //           },
    //           create: {
    //             enrollmentId: enrollment.id,
    //             gpa: parseFloat(String(rowData['GPA'])),
    //             totalCredits: parseFloat(totalCredits.toFixed(2)),
    //             totalGp: parseFloat(String(rowData['Total GP'])),
    //             status: allPassed ? 'PASS' : 'FAIL',
    //             academicYearResultId: null // Link to the shared AcademicYearResult
    //           }
    //         });

    //         // Now update/create AcademicYearResult after the result exists
    //         const academicYearResultId = await updateAcademicYearResult(
    //           enrollment.id,
    //           tx
    //         );

    //         // Update the result to link it to the AcademicYearResult
    //         await tx.result.update({
    //           where: { enrollmentId: enrollment.id },
    //           data: { academicYearResultId }
    //         });

    //         processedCount++;
    //       } catch (error) {
    //         console.error(
    //           `Error processing row for ${rowData['Student Name']}:`,
    //           error
    //         );
    //         // Continue with next row instead of failing entire transaction
    //       }
    //     }
    //   },
    //   {
    //     maxWait: 5000, // 5 seconds max wait to connect to prisma
    //     timeout: 20000 // 20 seconds
    //   }
    // );

    // Process valid data in smaller batches
    let processedCount = 0;
    const BATCH_SIZE = 10; // Process 10 students at a time

    // First, prepare all data outside transaction
    const preparedData = [];
    for (const rowData of validData) {
      const studentData = {
        studentName: rowData['Student Name'].toString().trim(),
        admissionId: rowData['Admission ID'].toString().trim(),
        rollNumber: rowData['Roll Number'].toString().trim()
      };

      const gradesData = [];
      for (const cs of classSubjects) {
        const subjctNameCol = cs.subject.subjectName;
        const examWeightCol = `${(cs.subject.examWeight * 100).toFixed(0)}%`;
        const assignWeightCol = `${(cs.subject.assignWeight * 100).toFixed(0)}%`;
        const subjectIdCol = cs.subject.id.toString() + ' 100%';

        const subjectStartIndex = headers.findIndex(
          (h, i) =>
            headers[i] === subjctNameCol &&
            headers[i + 1] === examWeightCol &&
            headers[i + 2] === assignWeightCol &&
            headers[i + 3] === subjectIdCol
        );

        if (subjectStartIndex !== -1) {
          gradesData.push({
            classSubjectId: cs.id,
            baseMark: parseFloat(
              String(rowData[headers[subjectStartIndex]] || 0)
            ),
            examMark: parseFloat(
              String(rowData[headers[subjectStartIndex] + 1] || 0)
            ),
            assignMark: parseFloat(
              String(rowData[headers[subjectStartIndex + 2]] || 0)
            ),
            finalMark: parseFloat(
              String(rowData[headers[subjectStartIndex + 3]] || 0)
            ),
            grade: String(rowData[headers[subjectStartIndex + 4]] || 'F')
              .trim()
              .toUpperCase(),
            score: parseFloat(
              String(rowData[headers[subjectStartIndex + 5]] || 0)
            ),
            gp: parseFloat(
              String(rowData[headers[subjectStartIndex + 6]] || 0)
            ),
            creditHours: cs.subject.creditHours
          });
        }
      }

      preparedData.push({
        student: studentData,
        grades: gradesData,
        gpa: parseFloat(String(rowData['GPA'])),
        totalGp: parseFloat(String(rowData['Total GP']))
      });
    }

    // Process in batches
    for (let i = 0; i < preparedData.length; i += BATCH_SIZE) {
      const batch = preparedData.slice(i, i + BATCH_SIZE);

      try {
        await prisma.$transaction(
          async (tx) => {
            // Use createMany for better performance where possible
            const studentsToCreate = [];
            const studentsToUpdate = [];

            // First pass: identify existing students
            const admissionIds = batch.map((item) => item.student.admissionId);
            const existingStudents = await tx.student.findMany({
              where: { admissionId: { in: admissionIds } }
            });
            const existingStudentMap = new Map(
              existingStudents.map((s) => [s.admissionId, s])
            );

            for (const item of batch) {
              const existing = existingStudentMap.get(item.student.admissionId);
              if (!existing) {
                studentsToCreate.push(item.student);
              } else if (existing.studentName !== item.student.studentName) {
                studentsToUpdate.push({
                  id: existing.id,
                  studentName: item.student.studentName
                });
              }
            }

            // Bulk create new students
            if (studentsToCreate.length > 0) {
              await tx.student.createMany({
                data: studentsToCreate,
                skipDuplicates: true
              });
            }

            // Update existing students if needed
            for (const update of studentsToUpdate) {
              await tx.student.update({
                where: { id: update.id },
                data: { studentName: update.studentName }
              });
            }

            // Get all students again after creation
            const allCurrentStudents = await tx.student.findMany({
              where: { admissionId: { in: admissionIds } }
            });
            const studentMap = new Map(
              allCurrentStudents.map((s) => [s.admissionId, s])
            );

            // Process enrollments and grades for each student in batch
            for (const item of batch) {
              const student = studentMap.get(item.student.admissionId);
              if (!student) continue;

              // Handle enrollment
              const enrollment = await tx.enrollment.upsert({
                where: {
                  classId_semesterId_studentId: {
                    classId,
                    semesterId,
                    studentId: student.id
                  }
                },
                update: {
                  rollNumber: item.student.rollNumber
                },
                create: {
                  rollNumber: item.student.rollNumber,
                  studentId: student.id,
                  classId,
                  semesterId,
                  isActive: true
                }
              });

              // Handle grades - use Promise.all for parallel processing
              await Promise.all(
                item.grades.map((gradeData) =>
                  tx.grade.upsert({
                    where: {
                      enrollmentId_classSubjectId: {
                        enrollmentId: enrollment.id,
                        classSubjectId: gradeData.classSubjectId
                      }
                    },
                    update: {
                      baseMark: gradeData.baseMark,
                      examMark: gradeData.examMark,
                      assignMark: gradeData.assignMark,
                      finalMark: gradeData.finalMark,
                      grade: gradeData.grade,
                      score: gradeData.score,
                      gp: gradeData.gp
                    },
                    create: {
                      enrollmentId: enrollment.id,
                      classSubjectId: gradeData.classSubjectId,
                      baseMark: gradeData.baseMark,
                      examMark: gradeData.examMark,
                      assignMark: gradeData.assignMark,
                      finalMark: gradeData.finalMark,
                      grade: gradeData.grade,
                      score: gradeData.score,
                      gp: gradeData.gp
                    }
                  })
                )
              );

              // Calculate totals
              const totalCredits = item.grades.reduce(
                (sum, g) => sum + g.creditHours,
                0
              );
              const allPassed = item.grades.every((g) => g.finalMark >= 50);

              // Handle result
              await tx.result.upsert({
                where: { enrollmentId: enrollment.id },
                update: {
                  gpa: item.gpa,
                  totalCredits: parseFloat(totalCredits.toFixed(2)),
                  totalGp: item.totalGp,
                  status: allPassed ? 'PASS' : 'FAIL',
                  academicYearResultId: null
                },
                create: {
                  enrollmentId: enrollment.id,
                  gpa: item.gpa,
                  totalCredits: parseFloat(totalCredits.toFixed(2)),
                  totalGp: item.totalGp,
                  status: allPassed ? 'PASS' : 'FAIL',
                  academicYearResultId: null
                }
              });

              // Update academic year result
              const academicYearResultId = await updateAcademicYearResult(
                enrollment.id,
                tx
              );
              await tx.result.update({
                where: { enrollmentId: enrollment.id },
                data: { academicYearResultId }
              });

              processedCount++;
            }
          },
          {
            maxWait: 10000, // Increased to 10 seconds
            timeout: 60000 // Increased to 60 seconds
          }
        );
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        // Continue with next batch instead of failing completely
      }
    }

    revalidateTag('results');
    revalidateTag('students');
    revalidateTag('enrollments');
    revalidateTag('academic-year-results');
    return {
      success: true,
      processedCount
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
