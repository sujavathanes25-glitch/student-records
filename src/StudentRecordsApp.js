import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const DB_KEY = 'srms_students_v3';

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Business Administration',
];

const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA', 'B.Com'];

const TABS = ['Dashboard', 'Students', 'Add Student', 'Attendance', 'Grades', 'Reports'];

const COLORS = ['#185FA5', '#0F6E56', '#854F0B', '#993C1D', '#533AB7', '#3B6D11', '#993556'];

const TAB_ICONS = {
  Dashboard:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  Students:      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'Add Student': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  Attendance:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  Grades:        'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  Reports:       'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

const EMPTY_STUDENT = {
  id: '', name: '', rollNo: '', email: '', phone: '', dob: '', gender: '',
  department: '', course: '', year: '', section: '', address: '',
  parentName: '', parentPhone: '', bloodGroup: '', admissionDate: '',
  status: 'Active', grades: {}, attendance: {},
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function uid() {
  return 'STU' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function attendancePct(s) {
  const p = parseInt(s.attendance?.present || 0);
  const t = parseInt(s.attendance?.total   || 0);
  return t ? Math.round((p / t) * 100) : 0;
}

function gradeColor(grade) {
  if (!grade) return '#888';
  const g = grade.toUpperCase();
  if (g === 'O' || g === 'A+') return '#0F6E56';
  if (g === 'A')                return '#185FA5';
  if (g === 'B+' || g === 'B') return '#3B6D11';
  if (g === 'C')                return '#854F0B';
  if (g === 'D')                return '#993C1D';
  return '#A32D2D';
}

function calcGPA(grades) {
  const map = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, D: 4, F: 0 };
  const entries = Object.values(grades || {});
  if (!entries.length) return null;
  return (entries.reduce((a, v) => a + (map[v.grade] || 0), 0) / entries.length).toFixed(1);
}

/* ─────────────────────────────────────────────
   DEMO DATA  (30 students, all 4 years)
───────────────────────────────────────────── */
function buildDemoStudents() {
  const raw = [
    // ── YEAR 1 ──
    { name:'Aarav Menon',      g:'Male',   dept:'Computer Science',            sec:'A', bg:'O+',  ph:'9876543210', pn:'Suresh Menon',    pp:'9865432109', addr:'12 Anna Nagar, Chennai',        st:'Active',   p:42,t:50, grades:{'Engineering Mathematics':{grade:'O',  marks:'96', semester:'1'},'Engineering Physics':{grade:'A+',marks:'91',semester:'1'},'C Programming':{grade:'O', marks:'98',semester:'1'}} },
    { name:'Bhavya Reddy',     g:'Female', dept:'Electronics & Communication', sec:'B', bg:'A+',  ph:'9845123670', pn:'Ravi Reddy',       pp:'9834012345', addr:'45 Jubilee Hills, Hyderabad',   st:'Active',   p:48,t:50, grades:{'Engineering Mathematics':{grade:'A+',marks:'89', semester:'1'},'Basic Electronics':{grade:'O', marks:'95',semester:'1'},'English':{grade:'A',marks:'82',semester:'1'}} },
    { name:'Chirag Patel',     g:'Male',   dept:'Mechanical Engineering',      sec:'A', bg:'B+',  ph:'9823456781', pn:'Hitesh Patel',     pp:'9812345670', addr:'78 Satellite Road, Ahmedabad',  st:'Active',   p:35,t:50, grades:{'Engineering Mathematics':{grade:'B+',marks:'74', semester:'1'},'Engineering Mechanics':{grade:'B', marks:'68',semester:'1'},'Workshop':{grade:'A',marks:'83',semester:'1'}} },
    { name:'Divya Krishnan',   g:'Female', dept:'Information Technology',      sec:'C', bg:'AB+', ph:'9811234567', pn:'Mohan Krishnan',   pp:'9800123456', addr:'23 T Nagar, Chennai',            st:'Active',   p:45,t:50, grades:{'Engineering Mathematics':{grade:'A', marks:'85', semester:'1'},'Python Programming':{grade:'O', marks:'97',semester:'1'},'English':{grade:'A+',marks:'88',semester:'1'}} },
    { name:'Eshan Varma',      g:'Male',   dept:'Civil Engineering',           sec:'B', bg:'O-',  ph:'9798765432', pn:'Deepak Varma',     pp:'9787654321', addr:'56 Sector 15, Noida',            st:'Active',   p:38,t:50, grades:{'Engineering Mathematics':{grade:'B', marks:'70', semester:'1'},'Surveying':{grade:'B+',marks:'75',semester:'1'},'Engineering Drawing':{grade:'A',marks:'84',semester:'1'}} },
    { name:'Fathima Noor',     g:'Female', dept:'Computer Science',            sec:'A', bg:'A-',  ph:'9786543219', pn:'Abdul Noor',       pp:'9775432108', addr:'34 Koramangala, Bengaluru',      st:'Active',   p:50,t:50, grades:{'Engineering Mathematics':{grade:'O', marks:'99', semester:'1'},'C Programming':{grade:'O', marks:'100',semester:'1'},'English':{grade:'O',marks:'95',semester:'1'}} },
    { name:'Gaurav Joshi',     g:'Male',   dept:'Electrical Engineering',      sec:'C', bg:'B-',  ph:'9775432108', pn:'Ramesh Joshi',     pp:'9764321097', addr:'89 Pimpri, Pune',                st:'Active',   p:30,t:50, grades:{'Engineering Mathematics':{grade:'C', marks:'58', semester:'1'},'Basic Electrical':{grade:'B', marks:'67',semester:'1'},'Physics Lab':{grade:'B+',marks:'73',semester:'1'}} },
    { name:'Harini Subramani', g:'Female', dept:'Business Administration',     sec:'A', bg:'O+',  ph:'9764321097', pn:'Kumar Subramani',  pp:'9753210986', addr:'12 Velachery, Chennai',          st:'Active',   p:46,t:50, grades:{'Business Communication':{grade:'A+',marks:'90', semester:'1'},'Management Principles':{grade:'A', marks:'85',semester:'1'},'Accounting':{grade:'O',marks:'94',semester:'1'}} },
    // ── YEAR 2 ──
    { name:'Ishaan Kapoor',    g:'Male',   dept:'Computer Science',            sec:'B', bg:'A+',  ph:'9753210986', pn:'Vikas Kapoor',     pp:'9742109875', addr:'67 DLF Phase 2, Gurgaon',        st:'Active',   p:43,t:55, grades:{'Data Structures':{grade:'A+',marks:'92',semester:'3'},'DBMS':{grade:'A', marks:'86',semester:'3'},'Operating Systems':{grade:'B+',marks:'77',semester:'3'}} },
    { name:'Jasmine Thomas',   g:'Female', dept:'Electronics & Communication', sec:'A', bg:'B+',  ph:'9742109875', pn:'George Thomas',    pp:'9731098764', addr:'45 Vyttila, Kochi',               st:'Active',   p:52,t:55, grades:{'Signals & Systems':{grade:'O', marks:'95',semester:'3'},'Digital Electronics':{grade:'A+',marks:'91',semester:'3'},'Analog Circuits':{grade:'A',marks:'84',semester:'3'}} },
    { name:'Karthik Iyer',     g:'Male',   dept:'Mechanical Engineering',      sec:'C', bg:'O+',  ph:'9731098764', pn:'Venkat Iyer',      pp:'9720987653', addr:'23 Adyar, Chennai',               st:'Active',   p:40,t:55, grades:{'Thermodynamics':{grade:'B+',marks:'76',semester:'3'},'Fluid Mechanics':{grade:'B', marks:'69',semester:'3'},'Manufacturing':{grade:'A',marks:'82',semester:'3'}} },
    { name:'Lavanya Nair',     g:'Female', dept:'Information Technology',      sec:'B', bg:'AB-', ph:'9720987653', pn:'Sanjay Nair',      pp:'9709876542', addr:'78 Palarivattom, Kochi',          st:'Active',   p:55,t:55, grades:{'Web Technologies':{grade:'O', marks:'98',semester:'3'},'Data Structures':{grade:'O', marks:'96',semester:'3'},'Java Programming':{grade:'A+',marks:'93',semester:'3'}} },
    { name:'Mohit Sharma',     g:'Male',   dept:'Civil Engineering',           sec:'A', bg:'A+',  ph:'9709876542', pn:'Sunil Sharma',     pp:'9698765431', addr:'56 Vaishali, Ghaziabad',          st:'Inactive', p:20,t:55, grades:{'Structural Analysis':{grade:'C', marks:'55',semester:'3'},'Soil Mechanics':{grade:'D', marks:'45',semester:'3'},'Concrete Technology':{grade:'B',marks:'66',semester:'3'}} },
    { name:'Nithya Priya',     g:'Female', dept:'Computer Science',            sec:'C', bg:'O+',  ph:'9698765431', pn:'Rajesh Priya',     pp:'9687654320', addr:'34 Annanagar West, Chennai',      st:'Active',   p:50,t:55, grades:{'Data Structures':{grade:'A', marks:'87',semester:'3'},'Computer Networks':{grade:'A+',marks:'90',semester:'3'},'DBMS':{grade:'O',marks:'96',semester:'3'}} },
    { name:'Om Prakash',       g:'Male',   dept:'Electrical Engineering',      sec:'B', bg:'B+',  ph:'9687654320', pn:'Hari Prakash',     pp:'9676543219', addr:'89 Laxmi Nagar, Delhi',           st:'Active',   p:44,t:55, grades:{'Circuit Theory':{grade:'A', marks:'83',semester:'3'},'Electrical Machines':{grade:'B+',marks:'75',semester:'3'},'Power Systems':{grade:'A+',marks:'89',semester:'3'}} },
    { name:'Pooja Agarwal',    g:'Female', dept:'Business Administration',     sec:'A', bg:'A-',  ph:'9676543219', pn:'Dinesh Agarwal',   pp:'9665432108', addr:'12 Civil Lines, Allahabad',       st:'Active',   p:53,t:55, grades:{'Marketing Management':{grade:'O', marks:'94',semester:'3'},'Financial Management':{grade:'A+',marks:'91',semester:'3'},'HRM':{grade:'A',marks:'86',semester:'3'}} },
    // ── YEAR 3 ──
    { name:'Qasim Ali',        g:'Male',   dept:'Computer Science',            sec:'A', bg:'O+',  ph:'9665432108', pn:'Bashir Ali',       pp:'9654321097', addr:'45 Aminabad, Lucknow',            st:'Active',   p:56,t:60, grades:{'Machine Learning':{grade:'A+',marks:'92',semester:'5'},'Software Engineering':{grade:'A', marks:'85',semester:'5'},'Cloud Computing':{grade:'O',marks:'97',semester:'5'}} },
    { name:'Riya Desai',       g:'Female', dept:'Electronics & Communication', sec:'B', bg:'B+',  ph:'9654321097', pn:'Nitin Desai',      pp:'9643210986', addr:'67 Navrangpura, Ahmedabad',       st:'Active',   p:58,t:60, grades:{'VLSI Design':{grade:'O', marks:'96',semester:'5'},'Embedded Systems':{grade:'A+',marks:'93',semester:'5'},'Wireless Comm':{grade:'A',marks:'87',semester:'5'}} },
    { name:'Siddharth Menon',  g:'Male',   dept:'Mechanical Engineering',      sec:'C', bg:'A+',  ph:'9643210986', pn:'Pradeep Menon',    pp:'9632109875', addr:'23 Kakkanad, Kochi',              st:'Active',   p:48,t:60, grades:{'CAD/CAM':{grade:'A', marks:'84',semester:'5'},'Heat Transfer':{grade:'B+',marks:'78',semester:'5'},'Robotics':{grade:'A+',marks:'90',semester:'5'}} },
    { name:'Tanvi Kulkarni',   g:'Female', dept:'Information Technology',      sec:'A', bg:'O-',  ph:'9632109875', pn:'Ashok Kulkarni',   pp:'9621098764', addr:'78 Kothrud, Pune',                st:'Active',   p:60,t:60, grades:{'Artificial Intelligence':{grade:'O', marks:'99',semester:'5'},'Mobile Computing':{grade:'O', marks:'97',semester:'5'},'Cyber Security':{grade:'A+',marks:'95',semester:'5'}} },
    { name:'Ujwal Rao',        g:'Male',   dept:'Civil Engineering',           sec:'B', bg:'AB+', ph:'9621098764', pn:'Madhav Rao',       pp:'9610987653', addr:'56 Jayanagar, Bengaluru',         st:'Active',   p:45,t:60, grades:{'Transportation Engg':{grade:'B+',marks:'76',semester:'5'},'Environmental Engg':{grade:'A', marks:'82',semester:'5'},'Project Management':{grade:'A+',marks:'88',semester:'5'}} },
    { name:'Varsha Singh',     g:'Female', dept:'Electrical Engineering',      sec:'C', bg:'A+',  ph:'9610987653', pn:'Anil Singh',       pp:'9599876542', addr:'34 Kanpur Road, Lucknow',         st:'Active',   p:54,t:60, grades:{'Control Systems':{grade:'A+',marks:'90',semester:'5'},'Power Electronics':{grade:'A', marks:'86',semester:'5'},'Signal Processing':{grade:'O',marks:'95',semester:'5'}} },
    { name:'Waqar Hussain',    g:'Male',   dept:'Business Administration',     sec:'A', bg:'B-',  ph:'9599876542', pn:'Imran Hussain',    pp:'9588765431', addr:'89 Old City, Hyderabad',          st:'Active',   p:42,t:60, grades:{'Operations Research':{grade:'A', marks:'84',semester:'5'},'Business Analytics':{grade:'A+',marks:'91',semester:'5'},'Entrepreneurship':{grade:'O',marks:'93',semester:'5'}} },
    // ── YEAR 4 ──
    { name:'Xeniya George',    g:'Female', dept:'Computer Science',            sec:'B', bg:'O+',  ph:'9588765431', pn:'Binu George',      pp:'9577654320', addr:'12 Palarivattom, Kochi',          st:'Active',   p:62,t:65, grades:{'Deep Learning':{grade:'O', marks:'98',semester:'7'},'Distributed Systems':{grade:'A+',marks:'94',semester:'7'},'Compiler Design':{grade:'A',marks:'88',semester:'7'}} },
    { name:'Yashwant Patil',   g:'Male',   dept:'Electronics & Communication', sec:'A', bg:'A+',  ph:'9577654320', pn:'Dattatray Patil',  pp:'9566543219', addr:'45 Sadashiv Peth, Pune',          st:'Active',   p:60,t:65, grades:{'5G Networks':{grade:'A+',marks:'92',semester:'7'},'IoT Systems':{grade:'O', marks:'96',semester:'7'},'OFDM Techniques':{grade:'A',marks:'87',semester:'7'}} },
    { name:'Zara Hussain',     g:'Female', dept:'Mechanical Engineering',      sec:'C', bg:'B+',  ph:'9566543219', pn:'Farooq Hussain',   pp:'9555432108', addr:'67 Frazer Town, Bengaluru',       st:'Active',   p:58,t:65, grades:{'FEA':{grade:'A', marks:'84',semester:'7'},'Automobile Engg':{grade:'A+',marks:'91',semester:'7'},'Renewable Energy':{grade:'O',marks:'95',semester:'7'}} },
    { name:'Ananya Bose',      g:'Female', dept:'Information Technology',      sec:'B', bg:'AB+', ph:'9555432108', pn:'Subir Bose',       pp:'9544321097', addr:'23 Salt Lake, Kolkata',           st:'Active',   p:65,t:65, grades:{'Blockchain':{grade:'O', marks:'100',semester:'7'},'Data Science':{grade:'O', marks:'98',semester:'7'},'DevOps':{grade:'A+',marks:'94',semester:'7'}} },
    { name:'Bhargav Nambiar',  g:'Male',   dept:'Civil Engineering',           sec:'A', bg:'O+',  ph:'9544321097', pn:'Suresh Nambiar',   pp:'9533210986', addr:'78 Calicut Road, Thrissur',       st:'Active',   p:55,t:65, grades:{'Bridge Engineering':{grade:'A+',marks:'90',semester:'7'},'GIS & Remote Sensing':{grade:'A', marks:'85',semester:'7'},'Disaster Mgmt':{grade:'A+',marks:'89',semester:'7'}} },
    { name:'Chetana Verma',    g:'Female', dept:'Electrical Engineering',      sec:'C', bg:'A-',  ph:'9533210986', pn:'Pawan Verma',      pp:'9522109875', addr:'56 Hazratganj, Lucknow',          st:'Active',   p:63,t:65, grades:{'Smart Grid':{grade:'O', marks:'97',semester:'7'},'EV Technology':{grade:'A+',marks:'93',semester:'7'},'High Voltage Engg':{grade:'A',marks:'88',semester:'7'}} },
    { name:'Dhruv Malhotra',   g:'Male',   dept:'Business Administration',     sec:'B', bg:'B+',  ph:'9522109875', pn:'Sanjiv Malhotra',  pp:'9511098764', addr:'34 Defence Colony, Delhi',        st:'Inactive', p:28,t:65, grades:{'Strategic Management':{grade:'B', marks:'67',semester:'7'},'International Business':{grade:'B+',marks:'72',semester:'7'},'Project Finance':{grade:'A',marks:'80',semester:'7'}} },
  ];

  const admDates = { '1':'2024-07-15','2':'2023-07-15','3':'2022-07-15','4':'2021-07-15' };
  const dobYears = { '1':1988,'2':1987,'3':1986,'4':1985 };
  const deptCode = { 'Computer Science':'CS','Electronics & Communication':'EC','Mechanical Engineering':'ME','Civil Engineering':'CE','Electrical Engineering':'EE','Information Technology':'IT','Business Administration':'BA' };
  const yearMap  = [1,1,1,1,1,1,1,1, 2,2,2,2,2,2,2,2, 3,3,3,3,3,3,3, 4,4,4,4,4,4,4];

  return raw.map((r, i) => {
    const yr = String(yearMap[i]);
    const dc = deptCode[r.dept] || 'GE';
    const mm = String((i % 11) + 1).padStart(2, '0');
    const dd = String((i % 28) + 1).padStart(2, '0');
    return {
      ...EMPTY_STUDENT,
      id:            'STU' + String(i + 2401).padStart(6, '0'),
      name:          r.name,
      rollNo:        `${dc}${2024 - parseInt(yr) + 1}${String(i + 1).padStart(3, '0')}`,
      email:         r.name.toLowerCase().replace(/\s+/g, '.') + '@srms.edu.in',
      phone:         r.ph,
      dob:           `${dobYears[yr]}-${mm}-${dd}`,
      gender:        r.g,
      department:    r.dept,
      course:        r.dept === 'Business Administration' ? 'MBA' : 'B.Tech',
      year:          yr,
      section:       r.sec,
      address:       r.addr,
      parentName:    r.pn,
      parentPhone:   r.pp,
      bloodGroup:    r.bg,
      admissionDate: admDates[yr],
      status:        r.st,
      grades:        r.grades,
      attendance:    { present: String(r.p), total: String(r.t) },
    };
  });
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function StudentRecordsApp() {
  const [students,          setStudents]          = useState([]);
  const [activeTab,         setActiveTab]         = useState('Dashboard');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [filterDept,        setFilterDept]        = useState('');
  const [filterYear,        setFilterYear]        = useState('');
  const [filterStatus,      setFilterStatus]      = useState('');
  const [selectedStudent,   setSelectedStudent]   = useState(null);
  const [showModal,         setShowModal]         = useState(false);
  const [modalTab,          setModalTab]          = useState('profile');
  const [editForm,          setEditForm]          = useState({ ...EMPTY_STUDENT });
  const [isEditing,         setIsEditing]         = useState(false);
  const [deleteId,          setDeleteId]          = useState(null);
  const [notification,      setNotification]      = useState(null);
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [gradeForm,         setGradeForm]         = useState({ subject:'', grade:'', marks:'', semester:'' });
  const [attendanceDate,    setAttendanceDate]    = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMarks,   setAttendanceMarks]   = useState({});

  /* Load from localStorage once on mount */
  useEffect(() => {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      setStudents(JSON.parse(stored));
    } else {
      const demo = buildDemoStudents();
      setStudents(demo);
      localStorage.setItem(DB_KEY, JSON.stringify(demo));
    }
  }, []);

  /* ── persist ── */
  function save(updated) {
    setStudents(updated);
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
  }

  /* ── toast ── */
  function toast(msg, type = 'ok') {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  /* ── add / update ── */
  function handleSubmit() {
    if (!editForm.name || !editForm.rollNo || !editForm.department) {
      toast('Name, Roll No and Department are required', 'err'); return;
    }
    if (isEditing) {
      save(students.map(s => s.id === editForm.id ? editForm : s));
      toast('Student record updated');
    } else {
      save([...students, { ...editForm, id: uid(), grades: {}, attendance: { present:'0', total:'0' } }]);
      toast('Student registered successfully');
    }
    setEditForm({ ...EMPTY_STUDENT });
    setIsEditing(false);
    setActiveTab('Students');
  }

  /* ── delete ── */
  function handleDelete(id) {
    save(students.filter(s => s.id !== id));
    setDeleteId(null);
    setShowModal(false);
    toast('Student record deleted');
  }

  /* ── edit ── */
  function startEdit(student) {
    setEditForm({ ...student });
    setIsEditing(true);
    setActiveTab('Add Student');
  }

  /* ── add grade ── */
  function addGrade() {
    if (!selectedStudent || !gradeForm.subject || !gradeForm.grade) return;
    const updated = students.map(s =>
      s.id !== selectedStudent.id ? s
        : { ...s, grades: { ...s.grades, [gradeForm.subject]: { grade: gradeForm.grade, marks: gradeForm.marks, semester: gradeForm.semester } } }
    );
    save(updated);
    setSelectedStudent(updated.find(s => s.id === selectedStudent.id));
    setGradeForm({ subject:'', grade:'', marks:'', semester:'' });
    toast('Grade added');
  }

  /* ── save attendance ── */
  function saveAttendance() {
    const updated = students.map(s => {
      const mark = attendanceMarks[s.id];
      if (!mark) return s;
      const p = parseInt(s.attendance?.present || 0) + (mark === 'P' ? 1 : 0);
      const t = parseInt(s.attendance?.total   || 0) + 1;
      return { ...s, attendance: { present: String(p), total: String(t) } };
    });
    save(updated);
    setAttendanceMarks({});
    toast('Attendance saved for ' + attendanceDate);
  }

  /* ── filtered list ── */
  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
      (!filterDept   || s.department === filterDept) &&
      (!filterYear   || s.year === filterYear) &&
      (!filterStatus || s.status === filterStatus)
    );
  });

  /* ── dashboard numbers ── */
  const total       = students.length;
  const activeCount = students.filter(s => s.status === 'Active').length;
  const deptCounts  = DEPARTMENTS.map(d => ({ d, n: students.filter(s => s.department === d).length })).filter(x => x.n > 0);
  const avgAtt      = total
    ? Math.round(students.reduce((a, s) => {
        const p = parseInt(s.attendance?.present || 0);
        const t = parseInt(s.attendance?.total   || 0);
        return a + (t ? (p / t) * 100 : 0);
      }, 0) / total)
    : 0;

  /* ═══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'DM Sans','Segoe UI',sans-serif", background:'#F4F3EF', overflow:'hidden' }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{ width: sidebarOpen ? 240 : 64, transition:'width 0.25s ease', background:'#1A1A2E', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
              <path d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          {sidebarOpen && <div>
            <div style={{ color:'#fff', fontWeight:600, fontSize:13, lineHeight:1.2 }}>EduTrack</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>Student Records</div>
          </div>}
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {TABS.map(tab => {
            const active = activeTab === tab;
            return (
              <button key={tab} title={!sidebarOpen ? tab : undefined} onClick={() => setActiveTab(tab)}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer', marginBottom:2,
                  background: active ? 'rgba(79,70,229,0.2)' : 'transparent',
                  color: active ? '#A5B4FC' : 'rgba(255,255,255,0.55)',
                  transition:'all 0.15s', fontFamily:'inherit', fontSize:13, fontWeight: active ? 500 : 400,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  boxShadow: active ? 'inset 3px 0 0 #A5B4FC' : 'none',
                }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink:0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICONS[tab]} />
                </svg>
                {sidebarOpen && <span style={{ whiteSpace:'nowrap', overflow:'hidden' }}>{tab}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setSidebarOpen(v => !v)}
            style={{ display:'flex', alignItems:'center', justifyContent: sidebarOpen ? 'flex-end' : 'center', width:'100%', padding:'8px 12px', background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition:'transform 0.25s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Top bar */}
        <header style={{ background:'#fff', borderBottom:'1px solid #E8E6E0', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <h1 style={{ margin:0, fontSize:18, fontWeight:600, color:'#1A1A2E' }}>{activeTab}</h1>
            <p style={{ margin:0, fontSize:12, color:'#888' }}>
              { activeTab==='Dashboard'   ? 'Overview of all student records'
              : activeTab==='Students'    ? `${filtered.length} of ${total} students`
              : activeTab==='Add Student' ? (isEditing ? 'Editing existing record' : 'Register a new student')
              : activeTab==='Attendance'  ? `Marking attendance for ${attendanceDate}`
              : activeTab==='Grades'      ? 'Manage academic grades'
              :                             'Analytics & Reports' }
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#1A1A2E' }}>Admin</div>
              <div style={{ fontSize:11, color:'#888' }}>Registrar Office</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#1A1A2E', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:600 }}>AD</div>
          </div>
        </header>

        <div style={{ flex:1, overflow:'auto', padding:24 }}>

          {/* ════ DASHBOARD ════ */}
          {activeTab === 'Dashboard' && (
            <div>
              {/* Stat cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Total Students',  value:total,         icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color:'#185FA5', bg:'#E6F1FB' },
                  { label:'Active Students', value:activeCount,   icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',  color:'#0F6E56', bg:'#E1F5EE' },
                  { label:'Departments',     value:deptCounts.length, icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color:'#854F0B', bg:'#FAEEDA' },
                  { label:'Avg. Attendance', value:avgAtt+'%',    icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color:'#533AB7', bg:'#EEEDFE' },
                ].map(c => (
                  <div key={c.label} style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #E8E6E0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>{c.label}</div>
                        <div style={{ fontSize:28, fontWeight:700, color:'#1A1A2E' }}>{c.value}</div>
                      </div>
                      <div style={{ width:40, height:40, borderRadius:10, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={c.color} strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                {/* Dept bars */}
                <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #E8E6E0' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Department Distribution</h3>
                  {deptCounts.map((d, i) => (
                    <div key={d.d} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#555', marginBottom:4 }}>
                        <span>{d.d.replace('Engineering','Engg.')}</span><span>{d.n}</span>
                      </div>
                      <div style={{ height:6, background:'#F0EEE8', borderRadius:99 }}>
                        <div style={{ height:'100%', width:`${(d.n/total)*100}%`, background:COLORS[i%COLORS.length], borderRadius:99 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recently added */}
                <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #E8E6E0' }}>
                  <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Recently Added</h3>
                  {students.slice(-5).reverse().map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F4F3EF' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'#1A1A2E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials(s.name)}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'#1A1A2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize:11, color:'#888' }}>{s.rollNo} · {s.department?.split(' ')[0]}</div>
                      </div>
                      <span style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background: s.status==='Active'?'#E1F5EE':'#FCEBEB', color: s.status==='Active'?'#0F6E56':'#A32D2D' }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year-wise */}
              <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #E8E6E0' }}>
                <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Year-wise Strength</h3>
                <div style={{ display:'flex', gap:12 }}>
                  {['1','2','3','4'].map((y, i) => {
                    const n = students.filter(s => s.year === y).length;
                    return (
                      <div key={y} style={{ flex:1, textAlign:'center', background:'#F8F7F3', borderRadius:10, padding:'16px 8px' }}>
                        <div style={{ fontSize:28, fontWeight:700, color:COLORS[i] }}>{n}</div>
                        <div style={{ fontSize:12, color:'#666', marginTop:4 }}>Year {y}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ STUDENTS ════ */}
          {activeTab === 'Students' && (
            <div>
              {/* Filter bar */}
              <div style={{ background:'#fff', borderRadius:12, padding:16, border:'1px solid #E8E6E0', marginBottom:16, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ flex:'1 1 200px', display:'flex', alignItems:'center', gap:8, background:'#F8F7F3', borderRadius:8, padding:'0 12px' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search name, roll no, email…"
                    style={{ border:'none', background:'transparent', outline:'none', fontSize:13, padding:'10px 0', width:'100%', fontFamily:'inherit' }} />
                </div>
                {[
                  { label:'Department', val:filterDept,   set:setFilterDept,   opts:DEPARTMENTS },
                  { label:'Year',       val:filterYear,   set:setFilterYear,   opts:['1','2','3','4'] },
                  { label:'Status',     val:filterStatus, set:setFilterStatus, opts:['Active','Inactive'] },
                ].map(f => (
                  <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
                    style={{ padding:'9px 12px', borderRadius:8, border:'1px solid #E0DED8', fontSize:13, background:'#F8F7F3', fontFamily:'inherit', color:'#444', cursor:'pointer' }}>
                    <option value=''>All {f.label}s</option>
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ))}
                <button onClick={() => { setEditForm({ ...EMPTY_STUDENT }); setIsEditing(false); setActiveTab('Add Student'); }}
                  style={{ padding:'9px 16px', background:'#1A1A2E', color:'#fff', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4"/></svg>
                  Add Student
                </button>
              </div>

              {/* Table */}
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#F8F7F3', borderBottom:'1px solid #E8E6E0' }}>
                      {['Student','Roll No','Department','Year/Sec','Attendance','Status','Actions'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => {
                      const pct = attendancePct(s);
                      return (
                        <tr key={s.id} style={{ borderBottom:'1px solid #F4F3EF' }}
                          onMouseEnter={e => e.currentTarget.style.background='#FAFAF8'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:34, height:34, borderRadius:'50%', background:COLORS[idx%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials(s.name)}</div>
                              <div>
                                <div style={{ fontSize:13, fontWeight:500, color:'#1A1A2E' }}>{s.name}</div>
                                <div style={{ fontSize:11, color:'#888' }}>{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:13, color:'#444', fontFamily:'monospace' }}>{s.rollNo}</td>
                          <td style={{ padding:'12px 16px', fontSize:12, color:'#555' }}>{s.department}</td>
                          <td style={{ padding:'12px 16px', fontSize:13, color:'#555' }}>Y{s.year} / {s.section}</td>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ flex:1, height:5, background:'#F0EEE8', borderRadius:99, minWidth:60 }}>
                                <div style={{ height:'100%', width:pct+'%', borderRadius:99, background: pct>=75?'#0F6E56':pct>=60?'#854F0B':'#A32D2D' }} />
                              </div>
                              <span style={{ fontSize:12, color: pct>=75?'#0F6E56':pct>=60?'#854F0B':'#A32D2D', fontWeight:500 }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background: s.status==='Active'?'#E1F5EE':'#FCEBEB', color: s.status==='Active'?'#0F6E56':'#A32D2D', fontWeight:500 }}>{s.status}</span>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={() => { setSelectedStudent(s); setModalTab('profile'); setShowModal(true); }} style={{ padding:'5px 10px', fontSize:11, border:'1px solid #E0DED8', borderRadius:6, background:'#fff', cursor:'pointer', color:'#185FA5', fontFamily:'inherit' }}>View</button>
                              <button onClick={() => startEdit(s)} style={{ padding:'5px 10px', fontSize:11, border:'1px solid #E0DED8', borderRadius:6, background:'#fff', cursor:'pointer', color:'#444', fontFamily:'inherit' }}>Edit</button>
                              <button onClick={() => setDeleteId(s.id)} style={{ padding:'5px 10px', fontSize:11, border:'1px solid #F7C1C1', borderRadius:6, background:'#fff', cursor:'pointer', color:'#A32D2D', fontFamily:'inherit' }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#888', fontSize:14 }}>No students found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ ADD / EDIT ════ */}
          {activeTab === 'Add Student' && (
            <div style={{ maxWidth:900 }}>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', padding:28 }}>
                <h2 style={{ margin:'0 0 24px', fontSize:16, fontWeight:600, color:'#1A1A2E' }}>
                  {isEditing ? 'Edit Student Record' : 'New Student Registration'}
                </h2>

                {[
                  { title:'Personal Information', fields:[
                    { label:'Full Name *',   key:'name',       type:'text',   span:2 },
                    { label:'Roll Number *', key:'rollNo',     type:'text' },
                    { label:'Date of Birth', key:'dob',        type:'date' },
                    { label:'Gender',        key:'gender',     type:'select', opts:['Male','Female','Other'] },
                    { label:'Blood Group',   key:'bloodGroup', type:'select', opts:['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
                    { label:'Email',         key:'email',      type:'email',  span:2 },
                    { label:'Phone',         key:'phone',      type:'tel' },
                    { label:'Address',       key:'address',    type:'text',   span:2 },
                  ]},
                  { title:'Academic Details', fields:[
                    { label:'Department *',   key:'department',    type:'select', opts:DEPARTMENTS },
                    { label:'Course',         key:'course',        type:'select', opts:COURSES },
                    { label:'Year',           key:'year',          type:'select', opts:['1','2','3','4'] },
                    { label:'Section',        key:'section',       type:'select', opts:['A','B','C','D'] },
                    { label:'Admission Date', key:'admissionDate', type:'date' },
                    { label:'Status',         key:'status',        type:'select', opts:['Active','Inactive','Alumni'] },
                  ]},
                  { title:'Parent / Guardian', fields:[
                    { label:'Parent Name',  key:'parentName',  type:'text' },
                    { label:'Parent Phone', key:'parentPhone', type:'tel' },
                  ]},
                ].map(sec => (
                  <div key={sec.title} style={{ marginBottom:28 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14, paddingBottom:8, borderBottom:'1px solid #F0EEE8' }}>{sec.title}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      {sec.fields.map(f => (
                        <div key={f.key} style={{ gridColumn: f.span===2 ? 'span 2' : 'span 1' }}>
                          <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>{f.label}</label>
                          {f.type==='select'
                            ? <select value={editForm[f.key]||''} onChange={e => setEditForm(p => ({ ...p, [f.key]:e.target.value }))}
                                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #E0DED8', fontSize:13, fontFamily:'inherit', background:'#fff', color:'#333' }}>
                                <option value=''>Select {f.label.replace(' *','')}</option>
                                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            : <input type={f.type} value={editForm[f.key]||''} onChange={e => setEditForm(p => ({ ...p, [f.key]:e.target.value }))}
                                onFocus={e => e.target.style.borderColor='#4F46E5'}
                                onBlur={e  => e.target.style.borderColor='#E0DED8'}
                                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #E0DED8', fontSize:13, fontFamily:'inherit', boxSizing:'border-box', outline:'none' }} />
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
                  <button onClick={() => { setEditForm({ ...EMPTY_STUDENT }); setIsEditing(false); setActiveTab('Students'); }}
                    style={{ padding:'10px 20px', borderRadius:8, border:'1px solid #E0DED8', background:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
                  <button onClick={handleSubmit}
                    style={{ padding:'10px 24px', borderRadius:8, border:'none', background:'#1A1A2E', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
                    {isEditing ? 'Save Changes' : 'Register Student'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ ATTENDANCE ════ */}
          {activeTab === 'Attendance' && (
            <div>
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', padding:20, marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
                <div>
                  <label style={{ fontSize:12, color:'#888', marginRight:8 }}>Date</label>
                  <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                    style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #E0DED8', fontSize:13, fontFamily:'inherit' }} />
                </div>
                <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
                  {[['Mark All Present','P','#E1F5EE','#0F6E56'],['Mark All Absent','A','#FCEBEB','#A32D2D']].map(([label,mark,bg,color]) => (
                    <button key={mark} onClick={() => { const d={}; students.filter(s=>s.status==='Active').forEach(s=>{d[s.id]=mark;}); setAttendanceMarks(d); }}
                      style={{ padding:'8px 14px', fontSize:12, border:'1px solid #E0DED8', borderRadius:8, background:bg, color, cursor:'pointer', fontFamily:'inherit' }}>{label}</button>
                  ))}
                  <button onClick={saveAttendance}
                    style={{ padding:'8px 16px', fontSize:12, border:'none', borderRadius:8, background:'#1A1A2E', color:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>Save Attendance</button>
                </div>
              </div>

              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#F8F7F3', borderBottom:'1px solid #E8E6E0' }}>
                      {['Student','Roll No','Department','Overall %','Mark Today'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.status==='Active').map((s, idx) => {
                      const pct  = attendancePct(s);
                      const mark = attendanceMarks[s.id] || '';
                      return (
                        <tr key={s.id} style={{ borderBottom:'1px solid #F4F3EF' }}>
                          <td style={{ padding:'10px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:30, height:30, borderRadius:'50%', background:COLORS[idx%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#fff' }}>{initials(s.name)}</div>
                              <span style={{ fontSize:13, color:'#1A1A2E' }}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:'10px 16px', fontSize:12, color:'#666', fontFamily:'monospace' }}>{s.rollNo}</td>
                          <td style={{ padding:'10px 16px', fontSize:12, color:'#666' }}>{s.department?.split(' ')[0]}</td>
                          <td style={{ padding:'10px 16px' }}>
                            <span style={{ fontSize:13, fontWeight:500, color: pct>=75?'#0F6E56':pct>=60?'#854F0B':'#A32D2D' }}>{pct}%</span>
                          </td>
                          <td style={{ padding:'10px 16px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              {[['P','#0F6E56','#E1F5EE'],['A','#A32D2D','#FCEBEB'],['L','#854F0B','#FAEEDA']].map(([v,color,bg]) => (
                                <button key={v} onClick={() => setAttendanceMarks(p => ({ ...p, [s.id]: p[s.id]===v?'':v }))}
                                  style={{ width:32, height:32, borderRadius:8, border:'1px solid', borderColor: mark===v?color:'#E0DED8', background: mark===v?bg:'#fff', color: mark===v?color:'#888', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{v}</button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ GRADES ════ */}
          {activeTab === 'Grades' && (
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#F8F7F3', borderBottom:'1px solid #E8E6E0' }}>
                    {['Student','Roll No','Subjects & Grades','GPA','Action'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const gpa = calcGPA(s.grades);
                    return (
                      <tr key={s.id} style={{ borderBottom:'1px solid #F4F3EF' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:30, height:30, borderRadius:'50%', background:COLORS[idx%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#fff' }}>{initials(s.name)}</div>
                            <span style={{ fontSize:13, color:'#1A1A2E', fontWeight:500 }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#666', fontFamily:'monospace' }}>{s.rollNo}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {Object.entries(s.grades||{}).map(([sub,val]) => (
                              <span key={sub} style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'#F8F7F3', border:'1px solid #E0DED8', color:gradeColor(val.grade), fontWeight:600 }}>{sub.split(' ')[0]}: {val.grade}</span>
                            ))}
                            {!Object.keys(s.grades||{}).length && <span style={{ fontSize:12, color:'#aaa' }}>No grades</span>}
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:15, fontWeight:700, color:'#1A1A2E' }}>{gpa || '—'}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <button onClick={() => { setSelectedStudent(s); setModalTab('grades'); setShowModal(true); }}
                            style={{ padding:'5px 12px', fontSize:11, border:'1px solid #E0DED8', borderRadius:6, background:'#fff', cursor:'pointer', color:'#185FA5', fontFamily:'inherit' }}>Add Grade</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ════ REPORTS ════ */}
          {activeTab === 'Reports' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Attendance risk */}
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', padding:20 }}>
                <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Attendance Risk Report</h3>
                {students.filter(s => attendancePct(s)<75 && parseInt(s.attendance?.total||0)>0).map(s => (
                  <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F4F3EF' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:'#888' }}>{s.rollNo} · {s.department?.split(' ')[0]}</div>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color: attendancePct(s)<60?'#A32D2D':'#854F0B' }}>{attendancePct(s)}%</span>
                  </div>
                ))}
                {students.filter(s => attendancePct(s)<75 && parseInt(s.attendance?.total||0)>0).length === 0 && (
                  <p style={{ fontSize:13, color:'#0F6E56' }}>All students have satisfactory attendance.</p>
                )}
              </div>

              {/* Top performers */}
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', padding:20 }}>
                <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Top Performers</h3>
                {students
                  .map(s => ({ ...s, gpa: parseFloat(calcGPA(s.grades)) || 0 }))
                  .filter(s => s.gpa >= 8)
                  .sort((a,b) => b.gpa - a.gpa)
                  .slice(0,5)
                  .map((s, i) => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #F4F3EF' }}>
                      <div style={{ width:24, height:24, borderRadius:'50%', background: i===0?'#FAEEDA':i===1?'#F1EFE8':'#F4F3EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: i===0?'#854F0B':'#666' }}>{i+1}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:500 }}>{s.name}</div>
                        <div style={{ fontSize:11, color:'#888' }}>{s.department?.split(' ')[0]}</div>
                      </div>
                      <span style={{ fontSize:14, fontWeight:700, color:'#0F6E56' }}>{s.gpa.toFixed(1)}</span>
                    </div>
                  ))
                }
              </div>

              {/* Gender */}
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', padding:20 }}>
                <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Gender Distribution</h3>
                {[['Male','#185FA5'],['Female','#993556'],['Other','#854F0B']].map(([g,color]) => {
                  const n   = students.filter(s => s.gender===g).length;
                  const pct = total ? Math.round(n/total*100) : 0;
                  return (
                    <div key={g} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                        <span style={{ color:'#555' }}>{g}</span>
                        <span style={{ color:'#888' }}>{n} ({pct}%)</span>
                      </div>
                      <div style={{ height:8, background:'#F0EEE8', borderRadius:99 }}>
                        <div style={{ height:'100%', width:pct+'%', borderRadius:99, background:color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E6E0', padding:20 }}>
                <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:600, color:'#1A1A2E' }}>Summary Stats</h3>
                {[
                  ['Total Registered',       total],
                  ['Currently Active',        activeCount],
                  ['Inactive / Dropped',      students.filter(s=>s.status==='Inactive').length],
                  ['Alumni',                  students.filter(s=>s.status==='Alumni').length],
                  ['Avg. Attendance',         avgAtt+'%'],
                  ['Students at Risk (<75%)', students.filter(s=>attendancePct(s)<75&&parseInt(s.attendance?.total||0)>0).length],
                ].map(([label,val]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F4F3EF', fontSize:13 }}>
                    <span style={{ color:'#555' }}>{label}</span>
                    <span style={{ fontWeight:600, color:'#1A1A2E' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ══ STUDENT DETAIL MODAL ══ */}
      {showModal && selectedStudent && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background:'#fff', borderRadius:16, width:640, maxHeight:'90vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ background:'#1A1A2E', padding:24, borderRadius:'16px 16px 0 0', position:'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.1)', border:'none', borderRadius:6, width:28, height:28, color:'#fff', cursor:'pointer', fontSize:16 }}>×</button>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>{initials(selectedStudent.name)}</div>
                <div>
                  <h2 style={{ margin:0, fontSize:18, fontWeight:600, color:'#fff' }}>{selectedStudent.name}</h2>
                  <p style={{ margin:0, fontSize:13, color:'rgba(255,255,255,0.6)' }}>{selectedStudent.rollNo} · {selectedStudent.department}</p>
                </div>
                <span style={{ marginLeft:'auto', fontSize:11, padding:'4px 12px', borderRadius:99, background: selectedStudent.status==='Active'?'#E1F5EE':'#FCEBEB', color: selectedStudent.status==='Active'?'#0F6E56':'#A32D2D', fontWeight:500 }}>{selectedStudent.status}</span>
              </div>
              {/* Sub-tabs */}
              <div style={{ display:'flex', gap:4, marginTop:20 }}>
                {['profile','grades','attendance'].map(t => (
                  <button key={t} onClick={() => setModalTab(t)}
                    style={{ padding:'6px 16px', borderRadius:6, border:'none', cursor:'pointer', fontSize:12, fontWeight:500, fontFamily:'inherit', textTransform:'capitalize', background: modalTab===t?'rgba(255,255,255,0.15)':'transparent', color: modalTab===t?'#fff':'rgba(255,255,255,0.5)' }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ padding:24 }}>
              {/* Profile */}
              {modalTab === 'profile' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                    {[['Email',selectedStudent.email],['Phone',selectedStudent.phone],['Date of Birth',selectedStudent.dob],['Gender',selectedStudent.gender],['Blood Group',selectedStudent.bloodGroup],['Admission Date',selectedStudent.admissionDate],['Course',selectedStudent.course],['Year / Section',`Year ${selectedStudent.year} / ${selectedStudent.section}`],['Parent Name',selectedStudent.parentName],['Parent Phone',selectedStudent.parentPhone]].map(([l,v]) => (
                      <div key={l} style={{ background:'#F8F7F3', borderRadius:8, padding:'10px 14px' }}>
                        <div style={{ fontSize:11, color:'#888', marginBottom:3 }}>{l}</div>
                        <div style={{ fontSize:13, color:'#1A1A2E', fontWeight:500 }}>{v||'—'}</div>
                      </div>
                    ))}
                  </div>
                  {selectedStudent.address && (
                    <div style={{ background:'#F8F7F3', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                      <div style={{ fontSize:11, color:'#888', marginBottom:3 }}>Address</div>
                      <div style={{ fontSize:13, color:'#1A1A2E' }}>{selectedStudent.address}</div>
                    </div>
                  )}
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => { setShowModal(false); startEdit(selectedStudent); }}
                      style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid #E0DED8', background:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Edit Record</button>
                    <button onClick={() => setDeleteId(selectedStudent.id)}
                      style={{ padding:'10px 20px', borderRadius:8, border:'1px solid #F7C1C1', background:'#FCEBEB', color:'#A32D2D', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
                  </div>
                </div>
              )}

              {/* Grades */}
              {modalTab === 'grades' && (
                <div>
                  <h4 style={{ margin:'0 0 12px', fontSize:13, fontWeight:600, color:'#1A1A2E' }}>Existing Grades</h4>
                  {Object.entries(selectedStudent.grades||{}).map(([sub,val]) => (
                    <div key={sub} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'#F8F7F3', borderRadius:8, marginBottom:6 }}>
                      <div>
                        <span style={{ fontSize:13, fontWeight:500 }}>{sub}</span>
                        {val.semester && <span style={{ fontSize:11, color:'#888', marginLeft:8 }}>Sem {val.semester}</span>}
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {val.marks && <span style={{ fontSize:12, color:'#666' }}>{val.marks}/100</span>}
                        <span style={{ fontSize:13, fontWeight:700, padding:'2px 10px', borderRadius:6, background:'#fff', border:'1px solid #E0DED8', color:gradeColor(val.grade) }}>{val.grade}</span>
                      </div>
                    </div>
                  ))}
                  {!Object.keys(selectedStudent.grades||{}).length && <p style={{ fontSize:13, color:'#888', marginBottom:16 }}>No grades recorded yet.</p>}

                  <div style={{ borderTop:'1px solid #F0EEE8', paddingTop:16, marginTop:12 }}>
                    <h4 style={{ margin:'0 0 12px', fontSize:13, fontWeight:600, color:'#1A1A2E' }}>Add New Grade</h4>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[
                        { label:'Subject',          key:'subject',  type:'text',   ph:'e.g. Data Structures' },
                        { label:'Grade',            key:'grade',    type:'select', opts:['O','A+','A','B+','B','C','D','F'] },
                        { label:'Marks (optional)', key:'marks',    type:'number', ph:'0–100' },
                        { label:'Semester',         key:'semester', type:'select', opts:['1','2','3','4','5','6','7','8'] },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:'block', fontSize:12, color:'#888', marginBottom:4 }}>{f.label}</label>
                          {f.type==='select'
                            ? <select value={gradeForm[f.key]} onChange={e => setGradeForm(p => ({ ...p, [f.key]:e.target.value }))}
                                style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #E0DED8', fontSize:13, fontFamily:'inherit' }}>
                                <option value=''>Select</option>
                                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            : <input type={f.type} placeholder={f.ph} value={gradeForm[f.key]} onChange={e => setGradeForm(p => ({ ...p, [f.key]:e.target.value }))}
                                style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #E0DED8', fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
                          }
                        </div>
                      ))}
                    </div>
                    <button onClick={addGrade} style={{ marginTop:12, padding:'10px 20px', borderRadius:8, border:'none', background:'#1A1A2E', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Add Grade</button>
                  </div>
                </div>
              )}

              {/* Attendance */}
              {modalTab === 'attendance' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
                    {[
                      { label:'Classes Present', value:selectedStudent.attendance?.present||0, color:'#0F6E56' },
                      { label:'Total Classes',   value:selectedStudent.attendance?.total||0,   color:'#185FA5' },
                      { label:'Attendance %',    value:attendancePct(selectedStudent)+'%',     color: attendancePct(selectedStudent)>=75?'#0F6E56':'#A32D2D' },
                    ].map(c => (
                      <div key={c.label} style={{ background:'#F8F7F3', borderRadius:10, padding:16, textAlign:'center' }}>
                        <div style={{ fontSize:24, fontWeight:700, color:c.color }}>{c.value}</div>
                        <div style={{ fontSize:11, color:'#888', marginTop:4 }}>{c.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: attendancePct(selectedStudent)>=75?'#E1F5EE':'#FCEBEB', borderRadius:10, padding:14, fontSize:13, color: attendancePct(selectedStudent)>=75?'#0F6E56':'#A32D2D' }}>
                    {attendancePct(selectedStudent)>=75
                      ? '✓ Attendance is satisfactory. Student is eligible for exams.'
                      : '⚠ Attendance below 75%. Student may be barred from exams.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, width:360, textAlign:'center' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'#FCEBEB', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22 }}>⚠</div>
            <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:600 }}>Delete Student Record?</h3>
            <p style={{ margin:'0 0 20px', fontSize:13, color:'#666' }}>This action cannot be undone. All data will be permanently removed.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid #E0DED8', background:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:'#A32D2D', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST NOTIFICATION ══ */}
      {notification && (
        <div style={{ position:'fixed', bottom:24, right:24, background: notification.type==='err'?'#A32D2D':'#0F6E56', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:500, zIndex:2000, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
