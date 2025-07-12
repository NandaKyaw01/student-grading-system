'use server';

import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx-js-style';

export async function exportTableToExcel(enrollmentIds?: number[]) {
  try {
    // Fetch enrollment data with all related information
    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentIds
        ? {
            id: {
              in: enrollmentIds
            }
          }
        : undefined,
      include: {
        student: true,
        class: {
          include: {
            semester: {
              include: {
                academicYear: true
              }
            }
          }
        },
        grades: {
          include: {
            classSubject: {
              include: {
                subject: true
              }
            }
          }
        },
        result: true
      }
    });

    if (enrollments.length === 0) {
      throw new Error('No enrollments found');
    }

    // Group enrollments by academic year and semester
    const enrollmentsByYear = enrollments.reduce(
      (acc, enrollment) => {
        const yearRange = enrollment.class.semester.academicYear.yearRange;
        const semesterName = enrollment.class.semester.semesterName;
        const semesterKey = `${semesterName} (${enrollment.class.semester.academicYear.yearRange})`;

        if (!acc[yearRange]) {
          acc[yearRange] = {};
        }
        if (!acc[yearRange][semesterKey]) {
          acc[yearRange][semesterKey] = [];
        }
        acc[yearRange][semesterKey].push(enrollment);
        return acc;
      },
      {} as Record<string, Record<string, typeof enrollments>>
    );

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Define color scheme
    const colors = {
      yearHeader: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '2E4A8B' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      semesterHeader: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '4F73B8' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      classHeader: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '7B9BD9' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      tableHeader: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '34495E' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      subjectHeader: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '5D6D7E' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      evenRow: {
        fill: { fgColor: { rgb: '000000' }, bgColor: { rgb: 'F8F9FA' } },
        font: { color: { rgb: '000000' } }
      },
      oddRow: {
        fill: { fgColor: { rgb: '000000' }, bgColor: { rgb: 'FFFFFF' } },
        font: { color: { rgb: '000000' } }
      },
      passStatus: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '27AE60' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      failStatus: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: 'E74C3C' } },
        font: { color: { rgb: 'FFFFFF' } }
      },
      incompleteStatus: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: 'F39C12' } },
        font: { color: { rgb: 'FFFFFF' } }
      }
    };

    // Helper function to create styled cell
    type StyleConfig = {
      fill: { fgColor: { rgb: string }; bgColor: { rgb: string } };
      font: { color: { rgb: string } };
    };

    function createStyledCell(value: unknown, styleConfig: StyleConfig) {
      const isHeaderStyle =
        styleConfig === colors.yearHeader ||
        styleConfig === colors.semesterHeader ||
        styleConfig === colors.classHeader ||
        styleConfig === colors.tableHeader ||
        styleConfig === colors.subjectHeader ||
        styleConfig === colors.passStatus ||
        styleConfig === colors.failStatus ||
        styleConfig === colors.incompleteStatus;

      const isTitle =
        styleConfig === colors.yearHeader ||
        styleConfig === colors.semesterHeader ||
        styleConfig === colors.classHeader;

      return {
        v: value,
        s: {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: styleConfig.fill.bgColor.rgb }
          },
          font: {
            name: 'Arial',
            sz: isHeaderStyle ? 11 : 10,
            bold: isHeaderStyle,
            color: { rgb: styleConfig.font.color.rgb }
          },
          alignment: {
            horizontal: isTitle ? 'left' : 'center',
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D5D8DC' } },
            bottom: { style: 'thin', color: { rgb: 'D5D8DC' } },
            left: { style: 'thin', color: { rgb: 'D5D8DC' } },
            right: { style: 'thin', color: { rgb: 'D5D8DC' } }
          }
        }
      };
    }

    // Helper function to get status color
    function getStatusColor(status: string) {
      switch (status?.toUpperCase()) {
        case 'PASS':
          return colors.passStatus;
        case 'FAIL':
          return colors.failStatus;
        default:
          return colors.incompleteStatus;
      }
    }

    // Process each academic year
    for (const [yearRange, semesterGroups] of Object.entries(
      enrollmentsByYear
    )) {
      // Create worksheet data for this year
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worksheetData: Array<Array<any>> = [];

      // Add year header with icon
      worksheetData.push([
        createStyledCell(`Academic Year: ${yearRange}`, colors.yearHeader)
      ]);
      worksheetData.push([createStyledCell('', colors.oddRow)]); // Empty row

      // Process each semester within the year
      for (const [semesterKey, semesterEnrollments] of Object.entries(
        semesterGroups
      )) {
        // Extract semester name from key (remove year range part)

        const semesterName = semesterKey.split(' (')[0];

        // Add semester header
        worksheetData.push([
          createStyledCell(`Semester: ${semesterName}`, colors.semesterHeader)
        ]);
        // worksheetData.push([createStyledCell('', colors.oddRow)]); // Empty row

        // Group by class within the semester
        const enrollmentsByClass = semesterEnrollments.reduce(
          (acc, enrollment) => {
            const className = enrollment.class.className;
            if (!acc[className]) {
              acc[className] = [];
            }
            acc[className].push(enrollment);
            return acc;
          },
          {} as Record<string, typeof enrollments>
        );

        for (const [className, classEnrollments] of Object.entries(
          enrollmentsByClass
        )) {
          // Add class header with icon
          worksheetData.push([
            createStyledCell(`Class: ${className}`, colors.classHeader)
          ]);
          //   worksheetData.push([createStyledCell('', colors.oddRow)]); // Empty row

          // Get all unique subjects for this class
          const allSubjects = new Set<string>();
          classEnrollments.forEach((enrollment) => {
            enrollment.grades.forEach((grade) => {
              allSubjects.add(grade.classSubject.subject.id);
            });
          });

          const uniqueSubjects = Array.from(allSubjects).sort();

          // Create headers
          const headerRow = [
            createStyledCell('Admission ID', colors.tableHeader),
            createStyledCell('Roll Number', colors.tableHeader),
            createStyledCell('Student Name', colors.tableHeader)
          ];

          // Add subject headers
          uniqueSubjects.forEach((subjectId) => {
            const subject = classEnrollments[0].grades.find(
              (g) => g.classSubject.subject.id === subjectId
            )?.classSubject.subject;
            const subjectName = subject?.subjectName || subjectId;

            headerRow.push(
              createStyledCell(`${subjectName}`, colors.subjectHeader),
              createStyledCell(
                `${subjectId} (${(subject?.examWeight ?? 0) * 100}%)`,
                colors.subjectHeader
              ),
              createStyledCell(
                `${subjectId} (${(subject?.assignWeight ?? 0) * 100}%)`,
                colors.subjectHeader
              ),
              createStyledCell(`${subjectId} (100%)`, colors.subjectHeader),
              createStyledCell(`${subjectId} Grade`, colors.subjectHeader),
              createStyledCell(`${subjectId} Score`, colors.subjectHeader),
              createStyledCell(`${subjectId} GP`, colors.subjectHeader)
            );
          });

          headerRow.push(
            createStyledCell('Total GP', colors.tableHeader),
            createStyledCell('Total Credits', colors.tableHeader),
            createStyledCell('GPA', colors.tableHeader),
            createStyledCell('Status', colors.tableHeader)
          );

          worksheetData.push(headerRow);

          // Add student data with alternating row colors
          classEnrollments.forEach((enrollment, index) => {
            const isEvenRow = index % 2 === 0;
            const rowStyle = isEvenRow ? colors.evenRow : colors.oddRow;

            const row = [
              createStyledCell(enrollment.student.admissionId, rowStyle),
              createStyledCell(enrollment.rollNumber, rowStyle),
              createStyledCell(enrollment.student.studentName, rowStyle)
            ];

            // Create grade map for quick lookup
            const gradeMap = new Map<
              string,
              (typeof enrollment.grades)[number]
            >();
            enrollment.grades.forEach((grade) => {
              gradeMap.set(grade.classSubject.subject.id, grade);
            });

            // Add grade data for each subject
            uniqueSubjects.forEach((subjectId) => {
              const grade = gradeMap.get(subjectId);
              if (grade) {
                row.push(
                  createStyledCell(grade.baseMark.toString(), rowStyle),
                  createStyledCell(grade.examMark.toString(), rowStyle),
                  createStyledCell(grade.assignMark.toString(), rowStyle),
                  createStyledCell(grade.finalMark.toString(), rowStyle),
                  createStyledCell(grade.grade, rowStyle),
                  createStyledCell(grade.score.toString(), rowStyle),
                  createStyledCell(grade.gp.toString(), rowStyle)
                );
              } else {
                // Subject not taken - add empty cells
                row.push(
                  createStyledCell('', rowStyle),
                  createStyledCell('', rowStyle),
                  createStyledCell('', rowStyle),
                  createStyledCell('', rowStyle),
                  createStyledCell('', rowStyle),
                  createStyledCell('', rowStyle),
                  createStyledCell('', rowStyle)
                );
              }
            });

            // Add result data with status-specific styling
            const status = enrollment.result?.status || 'INCOMPLETE';
            const statusStyle = getStatusColor(status);

            row.push(
              createStyledCell(
                (enrollment.result?.totalGp ?? 0).toString(),
                rowStyle
              ),
              createStyledCell(
                (enrollment.result?.totalCredits ?? 0).toString(),
                rowStyle
              ),
              createStyledCell(
                (enrollment.result?.gpa ?? 0).toString(),
                rowStyle
              ),
              createStyledCell(status, statusStyle)
            );

            worksheetData.push(row);
          });

          // Add empty rows between classes
          worksheetData.push([createStyledCell('', colors.oddRow)]);
          worksheetData.push([createStyledCell('', colors.oddRow)]);
        }

        // Add empty rows between semesters
        worksheetData.push([createStyledCell('', colors.oddRow)]);
        worksheetData.push([createStyledCell('', colors.oddRow)]);
      }

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Auto-size columns with improved sizing
      const colWidths = [];
      if (worksheetData.length > 0) {
        const maxCols = Math.max(...worksheetData.map((row) => row.length));
        for (let i = 0; i < maxCols; i++) {
          const maxLength = Math.max(
            ...worksheetData.map((row) => {
              const cell = row[i];
              if (cell && typeof cell === 'object' && 'v' in cell) {
                return cell.v ? cell.v.toString().length : 0;
              }
              return cell ? cell.toString().length : 0;
            })
          );
          colWidths.push({ width: Math.min(Math.max(maxLength + 3, 12), 25) });
        }
      }
      worksheet['!cols'] = colWidths;

      // Set row heights for better readability
      const rowHeights = worksheetData.map((row, index) => {
        // Check if this is a header row by examining the cell style
        const isHeader = row.some((cell) => {
          if (cell && typeof cell === 'object' && 's' in cell && cell.s.fill) {
            const bgColor = cell.s.fill.fgColor?.rgb;
            return (
              bgColor &&
              ['2E4A8B', '4F73B8', '7B9BD9', '34495E', '5D6D7E'].includes(
                bgColor
              )
            );
          }
          return false;
        });
        return { hpt: isHeader ? 30 : 20 };
      });
      worksheet['!rows'] = rowHeights;

      // Merge cells for headers
      const merges: XLSX.Range[] = [];
      worksheetData.forEach((row, rowIndex) => {
        if (row.length > 0) {
          const firstCell = row[0];
          if (firstCell && typeof firstCell === 'object' && 'v' in firstCell) {
            const value = firstCell.v?.toString() || '';
            if (
              value.includes('Academic Year:') ||
              value.includes('Semester:') ||
              value.includes('Class:')
            ) {
              const maxCol =
                Math.max(...worksheetData.map((r) => r.length)) - 1;
              merges.push({
                s: { r: rowIndex, c: 0 },
                e: { r: rowIndex, c: maxCol }
              });
            }
          }
        }
      });
      worksheet['!merges'] = merges;

      // Add worksheet to workbook
      const sheetName =
        Object.keys(enrollmentsByYear).length > 1
          ? `Results ${yearRange}`
          : 'Student Results';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    });

    // Convert to base64 for download
    const base64 = Buffer.from(excelBuffer).toString('base64');
    const fileName = `student_results_${new Date().toISOString().split('T')[0]}.xlsx`;

    return {
      success: true,
      data: base64,
      fileName: fileName,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
