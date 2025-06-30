// Sample data for AcademicYear
const academicYears = [
  {
    id: 1,
    yearRange: '2024-2025',
    isCurrent: true,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-06-15')
  }
];

// Sample data for Semester
const semesters = [
  {
    id: 1,
    semesterName: 'First Semester',
    academicYearId: 1,
    isCurrent: false
  },
  {
    id: 2,
    semesterName: 'Second Semester',
    academicYearId: 1,
    isCurrent: false
  }
];

// Sample data for Class
const classes = [
  {
    id: 1,
    className: 'First Year',
    departmentCode: 'CST',
    semesterId: 1
  },
  {
    id: 2,
    className: 'Second Year',
    departmentCode: 'CS',
    semesterId: 1
  },
  {
    id: 3,
    className: 'Second Year',
    departmentCode: 'CT',
    semesterId: 1
  },
  {
    id: 4,
    className: 'Third Year',
    departmentCode: 'CS',
    semesterId: 1
  },
  {
    id: 5,
    className: 'Third Year',
    departmentCode: 'CT',
    semesterId: 1
  },
  {
    id: 6,
    className: 'Fourth Year',
    departmentCode: 'CS',
    semesterId: 1
  },
  {
    id: 7,
    className: 'Fourth Year',
    departmentCode: 'CT',
    semesterId: 1
  },
  {
    id: 8,
    className: 'Fifth Year',
    departmentCode: 'CS',
    semesterId: 1
  },
  {
    id: 9,
    className: 'Fifth Year',
    departmentCode: 'CT',
    semesterId: 1
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
    id: 1,
    classId: 1,
    subjectId: 'M-1201'
  },
  {
    id: 2,
    classId: 1,
    subjectId: 'E-1201'
  },
  {
    id: 3,
    classId: 1,
    subjectId: 'P-1201'
  },
  {
    id: 4,
    classId: 1,
    subjectId: 'CST-1211'
  },
  {
    id: 5,
    classId: 1,
    subjectId: 'CST-1242'
  }
];

// Sample data for Student
const students = [
  {
    id: 1,
    studentName: 'John Doe',
    admissionId: '202201',
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2022-06-01')
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    admissionId: '202202',
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2022-06-01')
  },
  {
    id: 3,
    studentName: 'Robert Johnson',
    admissionId: '202203',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  }
];

// Sample data for GradeScale
const gradeScales = [
  {
    id: 1,
    minMark: 0,
    maxMark: 39,
    grade: 'F',
    score: 0,
    createdAt: '2025-06-30T08:27:42.966Z',
    updatedAt: '2025-06-30T08:27:42.966Z'
  },
  {
    id: 2,
    minMark: 40,
    maxMark: 49,
    grade: 'D',
    score: 1,
    createdAt: '2025-06-30T08:28:15.779Z',
    updatedAt: '2025-06-30T08:28:15.779Z'
  },
  {
    id: 3,
    minMark: 50,
    maxMark: 54,
    grade: 'C',
    score: 2,
    createdAt: '2025-06-30T08:28:43.209Z',
    updatedAt: '2025-06-30T08:40:21.211Z'
  },
  {
    id: 4,
    minMark: 55,
    maxMark: 59,
    grade: 'C+',
    score: 2.33,
    createdAt: '2025-06-30T08:54:11.877Z',
    updatedAt: '2025-06-30T08:54:11.877Z'
  },
  {
    id: 5,
    minMark: 60,
    maxMark: 64,
    grade: 'B-',
    score: 2.67,
    createdAt: '2025-06-30T09:01:17.380Z',
    updatedAt: '2025-06-30T09:01:17.380Z'
  },
  {
    id: 6,
    minMark: 65,
    maxMark: 69,
    grade: 'B',
    score: 3,
    createdAt: '2025-06-30T09:02:10.516Z',
    updatedAt: '2025-06-30T09:02:10.516Z'
  },
  {
    id: 7,
    minMark: 70,
    maxMark: 74,
    grade: 'B+',
    score: 3.33,
    createdAt: '2025-06-30T09:02:45.542Z',
    updatedAt: '2025-06-30T09:02:45.542Z'
  },
  {
    id: 8,
    minMark: 75,
    maxMark: 79,
    grade: 'A-',
    score: 3.67,
    createdAt: '2025-06-30T09:03:56.216Z',
    updatedAt: '2025-06-30T09:04:46.701Z'
  },
  {
    id: 9,
    minMark: 80,
    maxMark: 89,
    grade: 'A',
    score: 3.8,
    createdAt: '2025-06-30T09:04:37.954Z',
    updatedAt: '2025-06-30T09:04:37.954Z'
  },
  {
    id: 10,
    minMark: 90,
    maxMark: 100,
    grade: 'A+',
    score: 4,
    createdAt: '2025-06-30T09:05:17.605Z',
    updatedAt: '2025-06-30T09:05:17.605Z'
  }
];

// Sample data for User
const users = [
  {
    email: 'admin@ucsh.edu.mm',
    hashedPassword: 'admin123'
  }
];
