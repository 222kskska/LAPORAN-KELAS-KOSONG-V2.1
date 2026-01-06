import React, { useState } from 'react';

interface StudentFormProps {
  onSubmit: (data: { name: string; nim: string; class: string }) => void;
  onBack?: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [studentClass, setStudentClass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && nim && studentClass) {
      onSubmit({ name, nim, class: studentClass });
      setName('');
      setNim('');
      setStudentClass('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Mahasiswa
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="nim" className="block text-sm font-medium text-gray-700 mb-1">
          NIM
        </label>
        <input
          type="text"
          id="nim"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
          Kelas
        </label>
        <input
          type="text"
          id="class"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Kembali
          </button>
        )}
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Simpan
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
