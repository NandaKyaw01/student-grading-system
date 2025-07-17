'use server';

import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx-js-style';

export async function exportTableToExcel(enrollmentIds?: number[]) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        AND: [
          {
            result: {
              isNot: null
            }
          },
          ...(enrollmentIds
            ? [
                {
                  id: {
                    in: enrollmentIds
                  }
                }
              ]
            : [])
        ]
      },
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
      // throw new Error('No enrollments found');
      return {
        success: false,
        error: 'No enrollments found'
      };
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
      ).sort((a, b) => {
        const getSemesterNumber = (name: string) => {
          const numMatch = name.match(/(\d+)/);
          if (numMatch) return parseInt(numMatch[0]);
          const textualNumbers = [
            'first',
            'second',
            'third',
            'fourth',
            'fifth',
            'sixth'
          ];
          const lowerName = name.toLowerCase();
          for (let i = 0; i < textualNumbers.length; i++) {
            if (lowerName.includes(textualNumbers[i])) return i + 1;
          }
          return 0;
        };
        return (
          getSemesterNumber(a[0].split(' (')[0]) -
          getSemesterNumber(b[0].split(' (')[0])
        );
      })) {
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
        ).sort((a, b) => {
          const getClassNumber = (name: string) => {
            const numMatch = name.match(/(\d+)/);
            if (numMatch) return parseInt(numMatch[0]);
            const textualNumbers = [
              'first',
              'second',
              'third',
              'fourth',
              'fifth',
              'sixth'
            ];
            const lowerName = name.toLowerCase();
            for (let i = 0; i < textualNumbers.length; i++) {
              if (lowerName.includes(textualNumbers[i])) return i + 1;
            }
            return 0;
          };
          return getClassNumber(a[0]) - getClassNumber(b[0]);
        })) {
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

export async function exportAcademicYearResultsToExcel(
  academicYearIds?: number[]
) {
  try {
    // Fetch academic year results with all related information
    const academicYearResults = await prisma.academicYearResult.findMany({
      where: academicYearIds
        ? {
            id: {
              in: academicYearIds
            }
          }
        : undefined,
      include: {
        student: true,
        academicYear: true,
        semesterResults: {
          include: {
            enrollment: {
              include: {
                class: {
                  include: {
                    semester: true
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
                }
              }
            }
          }
        }
      }
    });

    if (academicYearResults.length === 0) {
      throw new Error('No academic year results found');
    }

    // Group results by academic year first, then by class
    const resultsByYear = academicYearResults.reduce(
      (acc, result) => {
        const yearRange = result.academicYear.yearRange;

        if (!acc[yearRange]) {
          acc[yearRange] = [];
        }
        acc[yearRange].push(result);

        return acc;
      },
      {} as Record<string, typeof academicYearResults>
    );

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Define color scheme
    const colors = {
      yearHeader: {
        fill: { fgColor: { rgb: 'FFFFFF' }, bgColor: { rgb: '2E4A8B' } },
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
      semesterHeader: {
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
        styleConfig === colors.classHeader ||
        styleConfig === colors.tableHeader ||
        styleConfig === colors.semesterHeader ||
        styleConfig === colors.passStatus ||
        styleConfig === colors.failStatus ||
        styleConfig === colors.incompleteStatus;

      const isTitle =
        styleConfig === colors.yearHeader || styleConfig === colors.classHeader;

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
    for (const [yearRange, yearResults] of Object.entries(resultsByYear)) {
      // Group results by class within this academic year
      const resultsByClass = yearResults.reduce(
        (acc, result) => {
          // Get all classes the student was enrolled in during this academic year
          const studentClasses = new Set<string>();

          result.semesterResults.forEach((semesterResult) => {
            const className = semesterResult.enrollment.class.className;
            studentClasses.add(className);
          });

          // Add student to each class they were enrolled in
          studentClasses.forEach((className) => {
            if (!acc[className]) {
              acc[className] = [];
            }
            acc[className].push(result);
          });

          return acc;
        },
        {} as Record<string, typeof academicYearResults>
      );

      // Create worksheet data for this academic year
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worksheetData: Array<Array<any>> = [];

      // Add academic year header
      worksheetData.push([
        createStyledCell(
          `Academic Year Results: ${yearRange}`,
          colors.yearHeader
        )
      ]);
      worksheetData.push([createStyledCell('', colors.oddRow)]); // Empty row

      // Process each class within this academic year
      for (const [className, classResults] of Object.entries(
        resultsByClass
      ).sort((a, b) => {
        const getClassNumber = (name: string) => {
          const numMatch = name.match(/(\d+)/);
          if (numMatch) return parseInt(numMatch[0]);
          const textualNumbers = [
            'first',
            'second',
            'third',
            'fourth',
            'fifth',
            'sixth'
          ];
          const lowerName = name.toLowerCase();
          for (let i = 0; i < textualNumbers.length; i++) {
            if (lowerName.includes(textualNumbers[i])) return i + 1;
          }
          return 0;
        };
        return getClassNumber(a[0]) - getClassNumber(b[0]);
      })) {
        // Add class header
        worksheetData.push([
          createStyledCell(`Class: ${className}`, colors.classHeader)
        ]);

        // Get all unique semesters for this class
        const allSemesters = new Set<string>();
        classResults.forEach((result) => {
          result.semesterResults.forEach((semesterResult) => {
            if (semesterResult.enrollment.class.className === className) {
              allSemesters.add(
                semesterResult.enrollment.class.semester.semesterName
              );
            }
          });
        });

        const uniqueSemesters = Array.from(allSemesters).sort();

        // Create headers
        const headerRow = [
          createStyledCell('Admission ID', colors.tableHeader),
          createStyledCell('Student Name', colors.tableHeader),
          createStyledCell('Total Semesters', colors.tableHeader),
          createStyledCell('Is Complete', colors.tableHeader)
        ];

        // Add semester-specific headers
        uniqueSemesters.forEach((semesterName) => {
          headerRow.push(
            createStyledCell(`${semesterName} - GPA`, colors.semesterHeader),
            createStyledCell(
              `${semesterName} - Credits`,
              colors.semesterHeader
            ),
            createStyledCell(`${semesterName} - GP`, colors.semesterHeader),
            createStyledCell(`${semesterName} - Status`, colors.semesterHeader)
          );
        });

        // Add overall result headers
        headerRow.push(
          createStyledCell('Overall GPA', colors.tableHeader),
          createStyledCell('Total Credits', colors.tableHeader),
          createStyledCell('Total GP', colors.tableHeader),
          createStyledCell('Year Rank', colors.tableHeader),
          createStyledCell('Final Status', colors.tableHeader)
        );

        worksheetData.push(headerRow);

        // Add student data with alternating row colors
        classResults.forEach((result, index) => {
          const isEvenRow = index % 2 === 0;
          const rowStyle = isEvenRow ? colors.evenRow : colors.oddRow;

          const row = [
            createStyledCell(result.student.admissionId, rowStyle),
            createStyledCell(result.student.studentName, rowStyle),
            createStyledCell(result.semesterCount.toString(), rowStyle),
            createStyledCell(result.isComplete ? 'Yes' : 'No', rowStyle)
          ];

          // Create semester results map for quick lookup
          const semesterResultsMap = new Map<
            string,
            (typeof result.semesterResults)[0]
          >();
          result.semesterResults.forEach((semesterResult) => {
            if (semesterResult.enrollment.class.className === className) {
              const semesterName =
                semesterResult.enrollment.class.semester.semesterName;
              semesterResultsMap.set(semesterName, semesterResult);
            }
          });

          // Add semester-specific data
          uniqueSemesters.forEach((semesterName) => {
            const semesterResult = semesterResultsMap.get(semesterName);
            if (semesterResult) {
              const statusStyle = getStatusColor(semesterResult.status);
              row.push(
                createStyledCell(semesterResult.gpa.toFixed(2), rowStyle),
                createStyledCell(
                  semesterResult.totalCredits.toFixed(1),
                  rowStyle
                ),
                createStyledCell(semesterResult.totalGp.toFixed(2), rowStyle),
                createStyledCell(semesterResult.status, statusStyle)
              );
            } else {
              // Student not enrolled in this semester for this class
              row.push(
                createStyledCell('N/A', rowStyle),
                createStyledCell('N/A', rowStyle),
                createStyledCell('N/A', rowStyle),
                createStyledCell('N/A', rowStyle)
              );
            }
          });

          // Add overall result data
          const finalStatusStyle = getStatusColor(result.status);
          row.push(
            createStyledCell(result.overallGpa.toFixed(2), rowStyle),
            createStyledCell(result.totalCredits.toFixed(1), rowStyle),
            createStyledCell(result.totalGp.toFixed(2), rowStyle),
            createStyledCell(result.yearRank?.toString() || 'N/A', rowStyle),
            createStyledCell(result.status, finalStatusStyle)
          );

          worksheetData.push(row);
        });

        // Add empty rows between classes
        worksheetData.push([createStyledCell('', colors.oddRow)]);
        worksheetData.push([createStyledCell('', colors.oddRow)]);
      }

      // Create worksheet for this academic year
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
          colWidths.push({ width: Math.min(Math.max(maxLength + 3, 12), 30) });
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
              ['2E4A8B', '7B9BD9', '34495E', '5D6D7E'].includes(bgColor)
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
              value.includes('Academic Year Results:') ||
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

      // Add worksheet to workbook with year-specific sheet name
      const sheetName =
        Object.keys(resultsByYear).length > 1
          ? `Results ${yearRange}`
          : `Academic Year Results ${yearRange}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    });

    // Convert to base64 for download
    const base64 = Buffer.from(excelBuffer).toString('base64');

    // Create filename based on whether single or multiple years
    const allYears = Object.keys(resultsByYear).sort();
    const fileName =
      allYears.length === 1
        ? `academic_year_results_${allYears[0].replace('/', '-')}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `academic_year_results_${allYears[0].replace('/', '-')}_to_${allYears[allYears.length - 1].replace('/', '-')}_${new Date().toISOString().split('T')[0]}.xlsx`;

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
