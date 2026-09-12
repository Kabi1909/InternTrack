import { useState } from 'react';
import toast from 'react-hot-toast';
export function useAction() {
  const [loading, setLoading] = useState(false);
  const run = async (fn, message) => {
    setLoading(true);
    try {
      const result = await fn();
      if (message) toast.success(message);
      return { ok: true, result };
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };
  return { loading, run };
}
