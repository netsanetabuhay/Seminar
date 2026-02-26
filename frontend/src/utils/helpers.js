export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

export const generateMeetingCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};