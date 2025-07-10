'use server';

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/handle-error';
import * as XLSX from 'xlsx-js-style';
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
  classCode: string;
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

    const SUBJECT_PRIORITY: Record<string, number> = {
      Myanmar: 1,
      English: 2,
      Physics: 3
      // Add other subjects with lower priority (default)
    };

    const classSubjects = templateData.subjects.sort((a, b) => {
      // First, sort by subject name priority
      const priorityA = SUBJECT_PRIORITY[a.name] || Infinity;
      const priorityB = SUBJECT_PRIORITY[b.name] || Infinity;

      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Myanmar (1) comes before English (2), etc.
      }

      // If same priority, sort by subject ID (numeric part)
      const numA = parseInt(a.id.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.id.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    if (classSubjects.length === 0) {
      throw new Error('No subjects found for this class');
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Generate headers
    const headers = ['Admission ID', 'Roll Number', '', 'Student Name'];

    // Add subject-specific columns
    classSubjects.forEach((cs) => {
      headers.push(
        cs.name,
        `${cs.id} ${(cs.examWeight * 100).toFixed(0)}%`,
        `${cs.id} ${(cs.assignWeight * 100).toFixed(0)}%`,
        `${cs.id} 100%`,
        `${cs.id} Grade`,
        `${cs.id} Score`,
        `${cs.id} GP`
      );
    });

    // Add summary columns
    headers.push('Total GP', 'GPA');

    // Create sample data rows for demonstration
    // const sampleRows = [];

    // // Add 5 sample rows to show the format
    // for (let i = 1; i <= 5; i++) {
    //   const row = [
    //     `${String(i).padStart(6, '0')}`,
    //     `${templateData.classCode || 'CS'}`, // Class part
    //     `${i}`, // Number part
    //     `Sample Student ${i}` // Name
    //   ];

    //   // Add empty cells for each subject's columns
    //   classSubjects.forEach(() => {
    //     row.push('', '', '', '', '', '', '');
    //   });

    //   // Add empty cells for summary columns
    //   row.push('', ''); // Total GP, GPA

    //   sampleRows.push(row);
    // }

    // Create worksheet data
    // const worksheetData = [headers, ...sampleRows];
    const worksheetData = [headers];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Admission ID
      { wch: 8 }, // Roll Number - Class
      { wch: 8 }, // Roll Number - Number
      { wch: 15 } // Student Name
    ];

    // Add widths for subject columns
    classSubjects.forEach(() => {
      columnWidths.push(
        { wch: 10 }, // real
        { wch: 10 }, // exam
        { wch: 10 }, // assign
        { wch: 10 }, // Subject Name
        { wch: 10 }, // Grade
        { wch: 10 }, // Score
        { wch: 10 } // GP
      );
    });

    // Add widths for summary columns
    columnWidths.push({ wch: 8 }, { wch: 8 }); // Total GP, GPA

    worksheet['!cols'] = columnWidths;

    // Create merged cells for "Roll Number" header
    const merges = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } } // Roll Number spans columns B and C
    ];

    worksheet['!merges'] = merges;

    const SUBJECT_COLORS = [
      'CCE5FF', // More visible blue
      'FFE4B5', // More visible orange
      'D4EDDA', // More visible green
      'E1BEE7', // More visible purple
      'B8E6B8', // More visible mint
      'FFF2CC', // More visible yellow
      'D1C4E9', // More visible lavender
      'FFCCCB' // More visible pink
    ];

    if (worksheet['!ref']) {
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);

      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;

        // Determine subject color based on column
        let subjectColor = 'FFFFFF'; // Default white
        if (col >= 4) {
          // Subject columns start from column 4
          const subjectColumnIndex = col - 4;
          const subjectIndex = Math.floor(subjectColumnIndex / 7); // 7 columns per subject
          subjectColor = SUBJECT_COLORS[subjectIndex % SUBJECT_COLORS.length];
        }

        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
          },
          fill: {
            fgColor: { rgb: subjectColor }
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      }
    }

    if (worksheet['!ref']) {
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);

      // Extend range to include more rows for styling
      const extendedRange = {
        s: { c: 0, r: 0 },
        e: { c: headerRange.e.c, r: Math.max(headerRange.e.r, 200) }
      };
      worksheet['!ref'] = XLSX.utils.encode_range(extendedRange);

      // Style data rows
      for (let row = 1; row <= 200; row++) {
        for (let col = 0; col <= headerRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { t: 's', v: '' };
          }

          // Determine subject color based on column
          let subjectColor = 'FFFFFF'; // Default white
          if (col >= 4) {
            // Subject columns start from column 4
            const subjectColumnIndex = col - 4;
            const subjectIndex = Math.floor(subjectColumnIndex / 7); // 7 columns per subject
            subjectColor = SUBJECT_COLORS[subjectIndex % SUBJECT_COLORS.length];
          }

          worksheet[cellAddress].s = {
            alignment: {
              horizontal: col === 3 ? 'left' : 'center', // Student name left, others center
              vertical: 'center'
            },
            fill: {
              fgColor: { rgb: subjectColor }
            },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          };
        }
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
      ['2. Admission ID column: Admission ID number (e.g., 000001)'],
      ['3. Roll Number columns: Split the roll number into two parts'],
      ['   - First column: Class code part (e.g., 2CS, 3IT, 1EE)'],
      ['   - Second column: Number part (e.g., 34, 15, 02)'],
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
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellStyles: false, // Ignore cell styles
      cellHTML: false, // Don't parse HTML
      cellFormula: false, // Don't parse formulas
      cellDates: false, // Handle dates as strings for consistency
      dense: false // Use standard format
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false, // Skip completely blank rows
      range: range // Use the actual range
    }) as (string | number | boolean | null)[][];

    const cleanedData = jsonData
      .filter((row) =>
        row.some((cell) => cell && cell.toString().trim() !== '')
      )
      .map((row) =>
        row.map((cell) => {
          if (cell === null || cell === undefined) return '';
          return cell.toString().trim();
        })
      );

    if (cleanedData.length < 2) {
      return {
        success: false,
        message: 'Excel file must contain at least header and one data row',
        errors: [
          {
            row: 0,
            column: '',
            field: 'general',
            message: `Excel file must contain at least header and one data row`
          }
        ]
      };
    }

    const headers = cleanedData[0].map((header) => header.trim());
    const dataRows = cleanedData.slice(1);

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

    // Expected columns - Updated to use separate roll number columns
    const requiredColumns = ['Student Name', 'Admission ID', 'Roll Number', '']; // Roll Number and empty column for number part
    const subjectColumns = classSubjects.flatMap((cs) => [
      cs.subject.subjectName,
      `${cs.subject.id} ${(cs.subject.examWeight * 100).toFixed(0)}%`,
      `${cs.subject.id} ${(cs.subject.assignWeight * 100).toFixed(0)}%`,
      `${cs.subject.id} 100%`,
      `${cs.subject.id} Grade`,
      `${cs.subject.id} Score`,
      `${cs.subject.id} GP`
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
        errors: [
          {
            row: 0,
            column: '',
            field: 'general',
            message: `Missing required columns: ${missingColumns.join(', ')}`
          }
        ],
        errorData: dataRows.map((row) =>
          Object.fromEntries(headers.map((h, i) => [h, row[i]]))
        ) as Record<string, unknown>[]
      };
    }

    function isEmptyValue(value: string | number | boolean | null | undefined) {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      if (typeof value === 'number' && isNaN(value)) return true;
      return false;
    }

    function isValidNumber(
      value: string | number | boolean | null | undefined,
      min = 0,
      max = 100
    ) {
      if (isEmptyValue(value)) return false;
      const num =
        typeof value === 'number' ? value : parseFloat(value!.toString());
      return !isNaN(num) && num >= min && num <= max;
    }

    // Validation function for roll number class code
    function isValidClassCode(code: string): boolean {
      const validCodes = [
        '1CST',
        '2CS',
        '2CT',
        '3CS',
        '3CT',
        '4CS',
        '4CT',
        '5CS',
        '5CT'
      ];
      return validCodes.includes(code.toUpperCase());
    }

    // Function to get roll number column indices
    function getRollNumberColumnIndices(headers: string[]): {
      classIndex: number;
      numberIndex: number;
    } {
      const rollNumberIndex = headers.findIndex((h) => h === 'Roll Number');
      if (rollNumberIndex === -1) {
        return { classIndex: -1, numberIndex: -1 };
      }

      // The number column should be the next column after Roll Number
      const numberIndex = rollNumberIndex + 1;

      return { classIndex: rollNumberIndex, numberIndex };
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
        rowData[header] = cellValue ?? '';
      });

      // Validate required fields
      if (isEmptyValue(rowData['Student Name'])) {
        errors.push({
          row: rowNumber,
          column: 'Student Name',
          field: 'studentName',
          message: 'Student name is required'
        });
        hasErrors = true;
      }

      if (isEmptyValue(rowData['Admission ID'])) {
        errors.push({
          row: rowNumber,
          column: 'Admission ID',
          field: 'admissionId',
          message: 'Admission ID is required'
        });
        hasErrors = true;
      }

      // Validate roll number parts
      const { classIndex, numberIndex } = getRollNumberColumnIndices(headers);
      let combinedRollNumber = '';

      if (classIndex !== -1 && numberIndex !== -1) {
        const classCode = row[classIndex]?.toString().trim() || '';
        const numberPart = row[numberIndex]?.toString().trim() || '';

        // Validate class code
        if (isEmptyValue(classCode)) {
          errors.push({
            row: rowNumber,
            column: 'Roll Number',
            field: 'rollNumberClass',
            message: 'Roll number class code is required'
          });
          hasErrors = true;
        } else if (!isValidClassCode(classCode)) {
          errors.push({
            row: rowNumber,
            column: 'Roll Number',
            field: 'rollNumberClass',
            message: `Invalid class code '${classCode}'. Valid codes: 1CST, 2CS, 2CT, 3CS, 3CT, 4CS, 4CT, 5CS, 5CT`
          });
          hasErrors = true;
        }

        // Validate number part
        if (isEmptyValue(numberPart)) {
          errors.push({
            row: rowNumber,
            column: headers[numberIndex] || '',
            field: 'rollNumberNumber',
            message: 'Roll number (number part) is required'
          });
          hasErrors = true;
        } else if (isNaN(parseInt(numberPart))) {
          errors.push({
            row: rowNumber,
            column: headers[numberIndex] || '',
            field: 'rollNumberNumber',
            message: `Invalid roll number '${numberPart}'. Must be a valid number`
          });
          hasErrors = true;
        }

        // Combine roll number if both parts are valid
        if (
          !hasErrors ||
          (classCode &&
            numberPart &&
            isValidClassCode(classCode) &&
            !isNaN(parseInt(numberPart)))
        ) {
          combinedRollNumber = `${classCode.toUpperCase()}-${numberPart}`;
        }
      } else {
        errors.push({
          row: rowNumber,
          column: 'Roll Number',
          field: 'rollNumber',
          message: 'Roll number columns not found'
        });
        hasErrors = true;
      }

      // Validate subject grades
      for (const cs of classSubjects) {
        const subjectId = cs.subject.id;
        const subjectName = cs.subject.subjectName;

        const subjectNameCol = subjectName;
        const examWeightCol = `${subjectId} ${(cs.subject.examWeight * 100).toFixed(0)}%`;
        const assignWeightCol = `${subjectId} ${(cs.subject.assignWeight * 100).toFixed(0)}%`;
        const subjectIdCol = `${subjectId} 100%`;
        const gradeCol = `${subjectId} Grade`;
        const scoreCol = `${subjectId} Score`;
        const gpCol = `${subjectId} GP`;

        // Find the index of this subject's columns in headers
        const subjectStartIndex = headers.findIndex(
          (h, i) =>
            headers[i] === subjectNameCol &&
            headers[i + 1] === examWeightCol &&
            headers[i + 2] === assignWeightCol &&
            headers[i + 3] === subjectIdCol &&
            headers[i + 4] === gradeCol &&
            headers[i + 5] === scoreCol &&
            headers[i + 6] === gpCol
        );

        if (subjectStartIndex !== -1) {
          const subjectNameColumnKey = headers[subjectStartIndex]; // Subject Name (Base Mark)
          const examMarkColumnKey = headers[subjectStartIndex + 1]; // 60% (Exam Mark)
          const assignMarkColumnKey = headers[subjectStartIndex + 2]; // 40% (Assignment Mark)
          const finalMarkColumnKey = headers[subjectStartIndex + 3]; // SubjectId 100% (Final Mark)
          const gradeColumnKey = headers[subjectStartIndex + 4]; // Grade
          const scoreColumnKey = headers[subjectStartIndex + 5]; // Score
          const gpColumnKey = headers[subjectStartIndex + 6]; // GP

          const subjectNameValue = rowData[subjectNameColumnKey];
          const examMarkValue = rowData[examMarkColumnKey];
          const assignMarkValue = rowData[assignMarkColumnKey];
          const finalMarkValue = rowData[finalMarkColumnKey];
          const gradeValue = rowData[gradeColumnKey];
          const scoreValue = rowData[scoreColumnKey];
          const gpValue = rowData[gpColumnKey];

          // Validate Base Mark (Subject Name column)
          if (isEmptyValue(subjectNameValue)) {
            errors.push({
              row: rowNumber,
              column: subjectNameColumnKey,
              field: 'baseMark',
              message: 'Base Mark is required'
            });
            hasErrors = true;
          } else {
            if (!isValidNumber(subjectNameValue)) {
              errors.push({
                row: rowNumber,
                column: subjectNameColumnKey,
                field: 'baseMark',
                message: `Invalid Base Mark '${subjectNameValue}' for subject ${subjectName}. Must be between 0 and 100`,
                value: subjectNameValue
              });
              hasErrors = true;
            }
          }

          // Validate Exam Mark (60% column)
          if (isEmptyValue(examMarkValue)) {
            errors.push({
              row: rowNumber,
              column: examMarkColumnKey,
              field: 'examMark',
              message: 'Exam mark is required'
            });
            hasErrors = true;
          } else {
            if (!isValidNumber(examMarkValue, 0, cs.subject.examWeight * 100)) {
              errors.push({
                row: rowNumber,
                column: examMarkColumnKey,
                field: 'examMark',
                message: `Invalid exam mark '${examMarkValue}' for subject ${subjectName}. Must be between 0 and 100`,
                value: examMarkValue
              });
              hasErrors = true;
            }
          }

          // Validate Assignment Mark (40% column)
          if (isEmptyValue(assignMarkValue)) {
            errors.push({
              row: rowNumber,
              column: assignMarkColumnKey,
              field: 'assignMark',
              message: 'Assignment mark is required'
            });
            hasErrors = true;
          } else {
            if (
              !isValidNumber(assignMarkValue, 0, cs.subject.assignWeight * 100)
            ) {
              errors.push({
                row: rowNumber,
                column: assignMarkColumnKey,
                field: 'assignMark',
                message: `Invalid assignment mark '${assignMarkValue}' for subject ${subjectName}. Must be between 0 and 100`,
                value: assignMarkValue
              });
              hasErrors = true;
            }
          }

          // Validate Final Mark
          if (isEmptyValue(finalMarkValue)) {
            errors.push({
              row: rowNumber,
              column: finalMarkColumnKey,
              field: 'finalMark',
              message: 'Final mark is required'
            });
            hasErrors = true;
          } else {
            if (!isValidNumber(finalMarkValue)) {
              errors.push({
                row: rowNumber,
                column: finalMarkColumnKey,
                field: 'finalMark',
                message: `Invalid final mark '${finalMarkValue}' for subject ${subjectName}. Must be between 0 and 100`,
                value: finalMarkValue
              });
              hasErrors = true;
            }
          }

          // Validate Grade
          if (isEmptyValue(gradeValue)) {
            errors.push({
              row: rowNumber,
              column: gradeColumnKey,
              field: 'grade',
              message: 'Grade is required'
            });
            hasErrors = true;
          } else {
            const grade = gradeValue!.toString().trim().toUpperCase();
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
                message: `Invalid grade '${grade}' for subject ${subjectName}. Valid grades: ${validGrades.join(', ')}`,
                value: gradeValue
              });
              hasErrors = true;
            }
          }

          // Validate Score
          if (isEmptyValue(scoreValue)) {
            errors.push({
              row: rowNumber,
              column: scoreColumnKey,
              field: 'score',
              message: 'Score is required'
            });
            hasErrors = true;
          } else {
            if (!isValidNumber(scoreValue, 0, 4.0)) {
              errors.push({
                row: rowNumber,
                column: scoreColumnKey,
                field: 'score',
                message: `Invalid score '${scoreValue}' for subject ${subjectName}. Must be between 0.0 and 4.0`,
                value: scoreValue
              });
              hasErrors = true;
            }
          }

          // Validate GP
          if (isEmptyValue(gpValue)) {
            errors.push({
              row: rowNumber,
              column: gpColumnKey,
              field: 'gp',
              message: 'GP is required'
            });
            hasErrors = true;
          } else {
            const maxGP = 4.0 * cs.subject.creditHours;
            if (!isValidNumber(gpValue, 0, maxGP)) {
              errors.push({
                row: rowNumber,
                column: gpColumnKey,
                field: 'gp',
                message: `Invalid GP '${gpValue}' for subject ${subjectName}. Must be between 0 and ${maxGP}`,
                value: gpValue
              });
              hasErrors = true;
            }
          }
        } else {
          // If we can't find the subject columns, add an error
          errors.push({
            row: rowNumber,
            column: '',
            field: 'general',
            message: `Could not find columns for subject: ${subjectName}. Expected columns: ${subjectNameCol}, ${examWeightCol}, ${assignWeightCol}, ${subjectIdCol}, Grade, Score, GP`
          });
          hasErrors = true;
        }
      }

      if (isEmptyValue(rowData['Total GP'])) {
        errors.push({
          row: rowNumber,
          column: 'Total GP',
          field: 'totalGp',
          message: 'Total GP is required'
        });
        hasErrors = true;
      }

      if (isEmptyValue(rowData['GPA'])) {
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
        // Add the combined roll number to the valid data
        const validRowData = { ...rowData } as StudentResultRow;
        validRowData['Roll Number'] = combinedRollNumber;
        validData.push(validRowData);
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

    // Process valid data in smaller batches
    let processedCount = 0;
    const BATCH_SIZE = 10; // Process 10 students at a time

    // First, prepare all data outside transaction
    const preparedData = [];
    for (const rowData of validData) {
      const studentData = {
        studentName: rowData['Student Name'].toString().trim(),
        admissionId: rowData['Admission ID'].toString().trim()
      };

      const gradesData = [];
      for (const cs of classSubjects) {
        const subjectNameCol = cs.subject.subjectName;
        const examWeightCol = `${cs.subject.id} ${(cs.subject.examWeight * 100).toFixed(0)}%`;
        const assignWeightCol = `${cs.subject.id} ${(cs.subject.assignWeight * 100).toFixed(0)}%`;
        const subjectIdCol = `${cs.subject.id} 100%`;
        const gradeCol = `${cs.subject.id} Grade`;
        const scoreCol = `${cs.subject.id} Score`;
        const gpCol = `${cs.subject.id} GP`;

        const subjectStartIndex = headers.findIndex(
          (h, i) =>
            headers[i] === subjectNameCol &&
            headers[i + 1] === examWeightCol &&
            headers[i + 2] === assignWeightCol &&
            headers[i + 3] === subjectIdCol &&
            headers[i + 4] === gradeCol &&
            headers[i + 5] === scoreCol &&
            headers[i + 6] === gpCol
        );

        if (subjectStartIndex !== -1) {
          gradesData.push({
            classSubjectId: cs.id,
            baseMark: parseFloat(
              String(rowData[headers[subjectStartIndex]] || 0)
            ),
            examMark: parseFloat(
              String(rowData[headers[subjectStartIndex + 1]] || 0)
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
        rollNumber: rowData['Roll Number'].toString().trim(), // This is now the combined roll number
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
                  rollNumber: item.rollNumber
                },
                create: {
                  rollNumber: item.rollNumber,
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
                      baseMark: parseFloat(gradeData.baseMark.toFixed(2)),
                      examMark: parseFloat(gradeData.examMark.toFixed(2)),
                      assignMark: parseFloat(gradeData.assignMark.toFixed(2)),
                      finalMark: parseFloat(gradeData.finalMark.toFixed(2)),
                      grade: gradeData.grade,
                      score: parseFloat(gradeData.score.toFixed(2)),
                      gp: parseFloat(gradeData.gp.toFixed(2))
                    },
                    create: {
                      enrollmentId: enrollment.id,
                      classSubjectId: gradeData.classSubjectId,
                      baseMark: parseFloat(gradeData.baseMark.toFixed(2)),
                      examMark: parseFloat(gradeData.examMark.toFixed(2)),
                      assignMark: parseFloat(gradeData.assignMark.toFixed(2)),
                      finalMark: parseFloat(gradeData.finalMark.toFixed(2)),
                      grade: gradeData.grade,
                      score: parseFloat(gradeData.score.toFixed(2)),
                      gp: parseFloat(gradeData.gp.toFixed(2))
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
                  gpa: parseFloat(item.gpa.toFixed(2)),
                  totalCredits: parseFloat(totalCredits.toFixed(2)),
                  totalGp: parseFloat(item.totalGp.toFixed(2)),
                  status: allPassed ? 'PASS' : 'FAIL',
                  academicYearResultId: null
                },
                create: {
                  enrollmentId: enrollment.id,
                  gpa: parseFloat(item.gpa.toFixed(2)),
                  totalCredits: parseFloat(totalCredits.toFixed(2)),
                  totalGp: parseFloat(item.totalGp.toFixed(2)),
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
