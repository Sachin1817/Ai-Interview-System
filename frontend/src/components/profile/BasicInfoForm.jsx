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

  const roles = [
    'Software Developer',
    'Data Scientist',
    'Web Developer',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'UI/UX Designer'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <User size={14} className="text-cyan-500" /> Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Sachin"
          className={`w-full bg-slate-800/50 border ${errors.name ? 'border-red-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all`}
        />
        {errors.name && <p className="text-[10px] text-red-400 font-semibold">{errors.name}</p>}
      </div>

      {/* Email (Read Only) */}
      <div className="space-y-2 opacity-70">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Mail size={14} className="text-cyan-500" /> Email (Authenticated)
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          readOnly
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed italic"
        />
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Phone size={14} className="text-cyan-500" /> Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="10-digit number"
          className={`w-full bg-slate-800/50 border ${errors.phone ? 'border-red-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all`}
        />
        {errors.phone && <p className="text-[10px] text-red-400 font-semibold">{errors.phone}</p>}
      </div>

      {/* Graduation Year */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <GraduationCap size={14} className="text-cyan-500" /> Graduation Year
        </label>
        <input
          type="number"
          name="graduationYear"
          value={formData.graduationYear}
          onChange={handleChange}
          placeholder="e.g. 2025"
          className={`w-full bg-slate-800/50 border ${errors.graduationYear ? 'border-red-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all`}
        />
        {errors.graduationYear && <p className="text-[10px] text-red-400 font-semibold">{errors.graduationYear}</p>}
      </div>

      {/* Branch */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-3.5 h-3.5 flex items-center justify-center"><School size={14} className="text-cyan-500" /></div> Branch / Dept
        </label>
        <select
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          className={`w-full bg-slate-800/50 border ${errors.branch ? 'border-red-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all`}
        >
          <option value="">Select Branch</option>
          {branches.map(b => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
        {errors.branch && <p className="text-[10px] text-red-400 font-semibold">{errors.branch}</p>}
      </div>

      {/* College Name */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <School size={14} className="text-cyan-500" /> College Name
        </label>
        <input
          type="text"
          name="college"
          value={formData.college}
          onChange={handleChange}
          placeholder="Enter your college"
          className={`w-full bg-slate-800/50 border ${errors.college ? 'border-red-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all`}
        />
        {errors.college && <p className="text-[10px] text-red-400 font-semibold">{errors.college}</p>}
      </div>

      {/* Target Job Role */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Briefcase size={14} className="text-cyan-500" /> Target Job Role
        </label>
        <select
          name="targetRole"
          value={formData.targetRole}
          onChange={handleChange}
          className={`w-full bg-slate-800/50 border ${errors.targetRole ? 'border-red-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all`}
        >
          <option value="">Select Target Role</option>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {errors.targetRole && <p className="text-[10px] text-red-400 font-semibold">{errors.targetRole}</p>}
      </div>
    </div>
  );
};

export default BasicInfoForm;
