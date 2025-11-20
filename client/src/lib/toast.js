import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  },
  warning: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
    });
  },
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  promise: (promise, { loading, success, error }) => {
    return toast.promise(promise, { loading, success, error }, {
      position: 'top-right',
    });
  },
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};
