// Validation patterns
export const PATTERNS = {
  NAME: /^[A-Za-z\s.'-]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMPLOYEE_ID: /^EMP\d{3,}$/i,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  OTP: /^\d{6}$/,
};

// IT Industry Constants
export const IT_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'QA/Testing',
  'DevOps',
  'Data Science',
  'IT Support',
  'Security',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Administration',
  'Research & Development',
];

export const IT_DESIGNATIONS = [
  'Intern',
  'Trainee',
  'Junior Software Engineer',
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Principal Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'QA Engineer',
  'Test Lead',
  'UI/UX Designer',
  'Graphic Designer',
  'Product Designer',
  'Data Scientist',
  'Data Analyst',
  'Data Engineer',
  'Machine Learning Engineer',
  'System Administrator',
  'Network Engineer',
  'Security Engineer',
  'Product Manager',
  'Project Manager',
  'Program Manager',
  'Technical Lead',
  'Engineering Manager',
  'Director of Engineering',
  'VP of Engineering',
  'CTO',
  'CEO',
  'HR Manager',
  'Recruiter',
  'Finance Manager',
  'Marketing Manager',
  'Other',
];

// Password strength calculator
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
  
  Object.values(checks).forEach(passed => {
    if (passed) score++;
  });
  
  // Bonus for length
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;
  
  let label, color;
  if (score < 3) {
    label = 'Weak';
    color = 'red';
  } else if (score < 5) {
    label = 'Fair';
    color = 'yellow';
  } else if (score < 6) {
    label = 'Good';
    color = 'blue';
  } else {
    label = 'Strong';
    color = 'green';
  }
  
  return { score: Math.min(score, 7), label, color, checks };
};

// Field validators
export const validators = {
  name: (value) => {
    if (!value) return 'Full name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 100) return 'Name must be less than 100 characters';
    if (!PATTERNS.NAME.test(value)) return 'Name can only contain letters, spaces, dots, hyphens';
    return '';
  },
  
  employeeId: (value) => {
    if (!value) return 'Employee ID is required';
    const upper = value.toUpperCase();
    if (!PATTERNS.EMPLOYEE_ID.test(upper)) {
      return 'Format: EMP + 3+ digits (e.g., EMP001)';
    }
    return '';
  },
  
  email: (value) => {
    if (!value) return 'Email is required';
    if (!PATTERNS.EMAIL.test(value)) return 'Please enter a valid email address';
    return '';
  },
  
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (value.length > 128) return 'Password must be less than 128 characters';
    if (!PATTERNS.STRONG_PASSWORD.test(value)) {
      return 'Must include uppercase, lowercase, number, and special character';
    }
    return '';
  },
  
  department: (value) => {
    if (!value) return 'Please select a department';
    if (!IT_DEPARTMENTS.includes(value)) return 'Invalid department';
    return '';
  },
  
  designation: (value) => {
    if (!value) return 'Please select a designation';
    if (!IT_DESIGNATIONS.includes(value)) return 'Invalid designation';
    return '';
  },
  
  otp: (value) => {
    if (!value) return 'OTP is required';
    if (!PATTERNS.OTP.test(value)) return 'OTP must be 6 digits';
    return '';
  },
};