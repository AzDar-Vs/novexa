import { useState } from 'react';

const useForm = (initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setValues({
      ...values,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const reset = () => setValues(initialState);

  return {
    values,
    setValues,
    handleChange,
    reset,
  };
};

export default useForm;
