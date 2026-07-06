import React from 'react';
import { User, Mail, Phone, GraduationCap, School, Briefcase } from 'lucide-react';

const BasicInfoForm = ({ formData, setFormData, errors }) => {
  const branches = [
    { label: 'Computer Science Engineering (CSE)', value: 'CSE' },
    { label: 'Information Technology (IT)', value: 'IT' },
    { label: 'Electronics and Communication (ECE)', value: 'ECE' },
    { label: 'Electrical Engineering (EEE)', value: 'EEE' },
    { label: 'Mechanical Engineering', value: 'Mechanical' },
    { label: 'Civil Engineering', value: 'Civil' },
    { label: 'Chemical Engineering', value: 'Chemical' },
    { label: 'Aerospace Engineering', value: 'Aerospace' }
  ];

  const rolesByBranch = {
    CSE: [
      'Software Developer',
      'Data Scientist',
      'Web Developer',
      'Machine Learning Engineer',
      'DevOps Engineer',
      'Cybersecurity Analyst',
      'Cloud Engineer',
      'UI/UX Designer',
      'Product Manager'
    ],
    IT: [
      'Software Developer',
      'Web Developer',
      'Database Administrator',
      'Cloud Solutions Architect',
      'System Administrator',
      'IT Consultant',
      'Cybersecurity Analyst',
      'UI/UX Designer'
    ],
    ECE: [
      'Embedded Systems Engineer',
      'VLSI Design Engineer',
      'Hardware Engineer',
      'Telecom Engineer',
      'IoT Specialist',
      'Robotics Engineer',
      'Software Developer'
    ],
    EEE: [
      'Power Systems Engineer',
      'Control Systems Engineer',
      'Electrical Design Engineer',
      'Automation Engineer',
      'Renewable Energy Consultant',
      'Robotics Engineer'
    ],
    Mechanical: [
      'CAD / Design Engineer',
      'Automotive Engineer',
      'Robotics & Automation Specialist',
      'Thermal Systems Engineer',
      'Manufacturing Engineer',
      'Product Manager'
    ],
    Civil: [
      'Structural Engineer',
      'Site / Construction Engineer',
      'Geotechnical Engineer',
      'Transportation Planner',
      'Environmental Engineer',
      'CAD Designer / Drafter'
    ],
    Chemical: [
      'Process Engineer',
      'Chemical Plant Operator',
      'Materials Engineer',
      'Biochemical Engineer',
      'Environmental Safety Officer',
      'Quality Control Analyst'
    ],
    Aerospace: [
      'Aerodynamics Engineer',
      'Propulsion Engineer',
      'Avionics Design Engineer',
      'Structural Analyst',
      'Flight Test Engineer',
      'Space Systems Engineer'
    ]
  };

  const allRoles = Array.from(new Set(Object.values(rolesByBranch).flat())).sort();
  const selectedBranch = formData.branch || '';
  const recommendedRoles = rolesByBranch[selectedBranch] || [];
  const otherRoles = allRoles.filter(role => !recommendedRoles.includes(role));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <User size={14} className="text-cyan-500" /> Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Sachin"
          className={`premium-input ${errors.name ? '!border-red-500/50' : ''}`}
        />
        {errors.name && <p className="text-[10px] text-red-400 font-semibold">{errors.name}</p>}
      </div>

      {/* Email (Read Only) */}
      <div className="space-y-2 opacity-80">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Mail size={14} className="text-cyan-500" /> Email (Authenticated)
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          readOnly
          className="premium-input !bg-slate-100/50 dark:!bg-white/5 !border-transparent !text-slate-400 cursor-not-allowed italic"
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Phone size={14} className="text-cyan-500" /> Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="10-digit number"
          className={`premium-input ${errors.phone ? '!border-red-500/50' : ''}`}
        />
        {errors.phone && <p className="text-[10px] text-red-400 font-semibold">{errors.phone}</p>}
      </div>

      {/* Graduation Year */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <GraduationCap size={14} className="text-cyan-500" /> Graduation Year
        </label>
        <input
          type="number"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={handleChange}
          placeholder="e.g. 2025"
          className={`premium-input ${errors.graduationYear ? '!border-red-500/50' : ''}`}
        />
        {errors.graduationYear && <p className="text-[10px] text-red-400 font-semibold">{errors.graduationYear}</p>}
      </div>

      {/* Branch */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <School size={14} className="text-cyan-500" /> Branch / Dept
        </label>
        <select
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          className={`premium-input appearance-none cursor-pointer ${errors.branch ? '!border-red-500/50' : ''}`}
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Branch</option>
          {branches.map(b => (
            <option key={b.value} value={b.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {b.label}
            </option>
          ))}
        </select>
        {errors.branch && <p className="text-[10px] text-red-400 font-semibold">{errors.branch}</p>}
      </div>

      {/* College Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <School size={14} className="text-cyan-500" /> College Name
        </label>
        <input
          type="text"
          name="college"
          value={formData.college}
          onChange={handleChange}
          placeholder="Enter your college"
          className={`premium-input ${errors.college ? '!border-red-500/50' : ''}`}
        />
        {errors.college && <p className="text-[10px] text-red-400 font-semibold">{errors.college}</p>}
      </div>

      {/* Target Job Role */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Briefcase size={14} className="text-cyan-500" /> Target Job Role
        </label>
        <select
          name="targetRole"
          value={formData.targetRole}
          onChange={handleChange}
          className={`premium-input appearance-none cursor-pointer ${errors.targetRole ? '!border-red-500/50' : ''}`}
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Target Role</option>
          {recommendedRoles.length > 0 ? (
            <>
              <optgroup label={`Recommended for ${selectedBranch}`} className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {recommendedRoles.map(r => (
                  <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-normal normal-case tracking-normal text-sm">
                    {r}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Roles" className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {otherRoles.map(r => (
                  <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-normal normal-case tracking-normal text-sm">
                    {r}
                  </option>
                ))}
              </optgroup>
            </>
          ) : (
            allRoles.map(r => (
              <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {r}
              </option>
            ))
          )}
        </select>
        {errors.targetRole && <p className="text-[10px] text-red-400 font-semibold">{errors.targetRole}</p>}
      </div>
    </div>
  );
};

export default BasicInfoForm;
