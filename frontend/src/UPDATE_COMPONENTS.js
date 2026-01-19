// Script to update all components to use api utility
// This file documents all the changes needed for Vercel deployment

const componentsToUpdate = [
    'ProjectManagement.jsx',
    'ProjectDetails.jsx',
    'EmployeeList.jsx',
    'EmployeeForm.jsx',
    'EmployeeDetails.jsx',
    'AttendanceManagement.jsx',
    'Dashboard.jsx'
];

// Changes needed:
// 1. Replace: import axios from 'axios' → import api from '../utils/api'
// 2. Remove: const token = localStorage.getItem('token')
// 3. Replace: axios.get('http://localhost:5000/api/...', { headers: { Authorization: `Bearer ${token}` } })
//    With: api.get('/api/...')
// 4. Replace: axios.post/put/delete('http://localhost:5000/api/...', data, { headers: { Authorization: `Bearer ${token}` } })
//    With: api.post/put/delete('/api/...', data)

export default componentsToUpdate;
