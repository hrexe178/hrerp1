export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = Math.abs(end - start);
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const getStatusColor = (status) => {
  const statusColors = {
    'Active': '#28a745',
    'Inactive': '#6c757d',
    'On-Leave': '#ffc107',
    'Terminated': '#dc3545',
    'Present': '#28a745',
    'Absent': '#dc3545',
    'Half-Day': '#ffc107',
    'Leave': '#17a2b8',
    'Holiday': '#007bff',
    'Weekend': '#6c757d',
    'Completed': '#28a745',
    'In Progress': '#007bff',
    'On Hold': '#ffc107',
    'Planning': '#6c757d',
    'Cancelled': '#dc3545',
  };
  return statusColors[status] || '#6c757d';
};

export const getStatusBadge = (status) => {
  const statusEmoji = {
    'Active': '✅',
    'Inactive': '⛔',
    'On-Leave': '📅',
    'Terminated': '🚫',
    'Present': '✅',
    'Absent': '❌',
    'Half-Day': '⏱️',
    'Leave': '🏖️',
    'Holiday': '🎉',
    'Weekend': '🎊',
    'Completed': '✅',
    'In Progress': '⏳',
    'On Hold': '⏸️',
    'Planning': '📋',
    'Cancelled': '❌',
  };
  return statusEmoji[status] || '•';
};

export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

