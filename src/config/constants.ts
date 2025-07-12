// Sample data for AcademicYear
const academicYears = [
  {
    yearRange: '2024-2025',
    isCurrent: true
  }
];

// Sample data for Semester
const semesters = [
  {
    semesterName: 'First Semester',
    academicYearId: 1,
    isCurrent: false
  },
  {
    semesterName: 'Second Semester',
    academicYearId: 1,
    isCurrent: false
  }
];

// Sample data for Class
const classes = [
  {
    className: 'First Year',
    departmentCode: '1101 CST',
    semesterId: 1
  },
  {
    className: 'Second Year',
    departmentCode: '1102 CS',
    semesterId: 1
  },
  {
    className: 'Second Year',
    departmentCode: '1103 CT',
    semesterId: 1
  },
  {
    className: 'Third Year',
    departmentCode: '1104 CS',
    semesterId: 1
  },
  {
    className: 'Third Year',
    departmentCode: '1105 CT',
    semesterId: 1
  },
  {
    className: 'Fourth Year',
    departmentCode: '1106 CS',
    semesterId: 1
  },
  {
    className: 'Fourth Year',
    departmentCode: '1107 CT',
    semesterId: 1
  },
  {
    className: 'Fifth Year',
    departmentCode: '1108 CS',
    semesterId: 1
  },
  {
    className: 'Fifth Year',
    departmentCode: '1109 CT',
    semesterId: 1
  },
  {
    className: 'First Year',
    departmentCode: '1201 CST',
    semesterId: 2
  },
  {
    className: 'Second Year',
    departmentCode: '1202 CS',
    semesterId: 2
  },
  {
    className: 'Second Year',
    departmentCode: '1203 CT',
    semesterId: 2
  },
  {
    className: 'Third Year',
    departmentCode: '1204 CS',
    semesterId: 2
  },
  {
    className: 'Third Year',
    departmentCode: '1205 CT',
    semesterId: 2
  },
  {
    className: 'Fourth Year',
    departmentCode: '1206 CS',
    semesterId: 2
  },
  {
    className: 'Fourth Year',
    departmentCode: '1207 CT',
    semesterId: 2
  },
  {
    className: 'Fifth Year',
    departmentCode: '1208 CS',
    semesterId: 2
  },
  {
    className: 'Fifth Year',
    departmentCode: '1209 CT',
    semesterId: 2
  }
];

// Sample data for Subject
const subjects = [
  {
    id: 'M-1201',
    subjectName: 'Myanmar',
    creditHours: 3.0,
    examWeight: 0.6,
    assignWeight: 0.4
  },
  {
    id: 'E-1201',
    subjectName: 'English',
    creditHours: 3.0,
    examWeight: 0.6,
    assignWeight: 0.4
  },
  {
    id: 'P-1201',
    subjectName: 'Physics',
    creditHours: 3.0,
    examWeight: 0.6,
    assignWeight: 0.4
  },
  {
    id: 'CST-1211',
    subjectName: 'C++',
    creditHours: 3.0,
    examWeight: 0.5,
    assignWeight: 0.5
  },
  {
    id: 'CST-1242',
    subjectName: 'Maths',
    creditHours: 3.0,
    examWeight: 0.6,
    assignWeight: 0.4
  }
];

// Sample data for ClassSubject
const classSubjects = [
  {
    classId: 1,
    subjectId: 'M-1201'
  },
  {
    classId: 1,
    subjectId: 'E-1201'
  },
  {
    classId: 1,
    subjectId: 'P-1201'
  },
  {
    classId: 1,
    subjectId: 'CST-1211'
  },
  {
    classId: 1,
    subjectId: 'CST-1242'
  }
];

// Sample data for GradeScale
const gradeScales = [
  {
    id: 1,
    minMark: 0,
    maxMark: 39,
    grade: 'F',
    score: 0
  },
  {
    id: 2,
    minMark: 40,
    maxMark: 49,
    grade: 'D',
    score: 1
  },
  {
    id: 3,
    minMark: 50,
    maxMark: 54,
    grade: 'C',
    score: 2
  },
  {
    id: 4,
    minMark: 55,
    maxMark: 59,
    grade: 'C+',
    score: 2.33
  },
  {
    id: 5,
    minMark: 60,
    maxMark: 64,
    grade: 'B-',
    score: 2.67
  },
  {
    id: 6,
    minMark: 65,
    maxMark: 69,
    grade: 'B',
    score: 3
  },
  {
    id: 7,
    minMark: 70,
    maxMark: 74,
    grade: 'B+',
    score: 3.33
  },
  {
    id: 8,
    minMark: 75,
    maxMark: 79,
    grade: 'A-',
    score: 3.67
  },
  {
    id: 9,
    minMark: 80,
    maxMark: 89,
    grade: 'A',
    score: 3.8
  },
  {
    id: 10,
    minMark: 90,
    maxMark: 100,
    grade: 'A+',
    score: 4
  }
];

// Sample data for User
const users = [
  {
    email: 'admin@ucsh.edu.mm',
    hashedPassword: 'admin123'
  }
];
